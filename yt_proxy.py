"""
Nebula Player - YouTube Audio Proxy
Runs on port 9001, provides search and audio proxying via yt-dlp.
"""

import json
import subprocess
import sys
import urllib.request
import urllib.parse
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from concurrent.futures import ThreadPoolExecutor
import sqlite3
import time
import os
import random
import threading
import glob

PORT = 9001
DB_FILE = "nebula_player.db"
CACHE_DIR = "cached_songs"
CACHE_CONFIG_FILE = "cache_config.json"

# Ensure directories exist
if not os.path.exists(CACHE_DIR):
    os.makedirs(CACHE_DIR)

# SQLite Database Initialization
def init_sqlite_db():
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    
    # 1. Users table
    c.execute('''
        CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT UNIQUE,
            password TEXT,
            avatar TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        )
    ''')
    
    # 2. Playlists table
    c.execute('''
        CREATE TABLE IF NOT EXISTS playlists (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            name TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(username, name)
        )
    ''')
    
    # 3. Playlist Tracks table
    c.execute('''
        CREATE TABLE IF NOT EXISTS playlist_tracks (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            playlist_id INTEGER,
            title TEXT,
            artist TEXT,
            url TEXT,
            cover TEXT,
            is_youtube INTEGER DEFAULT 0,
            youtube_id TEXT,
            thumbnail TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            FOREIGN KEY(playlist_id) REFERENCES playlists(id) ON DELETE CASCADE
        )
    ''')
    
    # 4. Favorites table
    c.execute('''
        CREATE TABLE IF NOT EXISTS favorites (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            username TEXT,
            title TEXT,
            artist TEXT,
            url TEXT,
            cover TEXT,
            is_youtube INTEGER DEFAULT 0,
            youtube_id TEXT,
            thumbnail TEXT,
            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            UNIQUE(username, url)
        )
    ''')
    
    # 5. Song Cache table for priority calculations
    c.execute('''
        CREATE TABLE IF NOT EXISTS song_cache (
            video_id TEXT PRIMARY KEY,
            title TEXT,
            artist TEXT,
            play_count INTEGER DEFAULT 0,
            last_played REAL,
            file_size INTEGER DEFAULT 0,
            is_cached INTEGER DEFAULT 0
        )
    ''')
    
    conn.commit()
    conn.close()

# Initialize config files
def init_cache_config():
    if not os.path.exists(CACHE_CONFIG_FILE):
        config = {
            "max_songs": 5,      # Default limit of 5 cached songs
            "max_size_mb": 50,   # Default limit of 50 MB
            "min_plays_to_cache": 2 # Cached only if played >= 2 times
        }
        with open(CACHE_CONFIG_FILE, "w", encoding="utf-8") as f:
            json.dump(config, f, indent=4, ensure_ascii=False)

init_sqlite_db()
init_cache_config()

# Cache helper functions
def get_cache_config():
    try:
        with open(CACHE_CONFIG_FILE, "r", encoding="utf-8") as f:
            return json.load(f)
    except Exception:
        return {"max_songs": 5, "max_size_mb": 50, "min_plays_to_cache": 2}

def register_song_play(video_id, title="", artist=""):
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    now = time.time()
    
    c.execute("SELECT play_count, is_cached FROM song_cache WHERE video_id = ?", (video_id,))
    row = c.fetchone()
    
    if row:
        new_count = row[0] + 1
        c.execute('''
            UPDATE song_cache 
            SET play_count = ?, last_played = ?, title = ?, artist = ? 
            WHERE video_id = ?
        ''', (new_count, now, title, artist, video_id))
        is_cached = row[1]
    else:
        new_count = 1
        c.execute('''
            INSERT INTO song_cache (video_id, title, artist, play_count, last_played)
            VALUES (?, ?, ?, ?, ?)
        ''', (video_id, title, artist, 1, now))
        is_cached = 0
        
    conn.commit()
    conn.close()
    
    config = get_cache_config()
    if not is_cached and new_count >= config.get("min_plays_to_cache", 2):
        threading.Thread(target=download_and_cache_song, args=(video_id, title, artist)).start()

def download_and_cache_song(video_id, title, artist):
    target_path = os.path.join(CACHE_DIR, f"{video_id}.mp3")
    if os.path.exists(target_path):
        return
        
    print(f"[CACHE] Caching track {video_id} ('{title}') in background...")
    cmd = [
        "yt-dlp",
        "-f", "bestaudio",
        "--extract-audio",
        "--audio-format", "mp3",
        "-o", os.path.join(CACHE_DIR, f"{video_id}.%(ext)s"),
        f"https://www.youtube.com/watch?v={video_id}",
        "--no-playlist",
        "--quiet"
    ]
    try:
        res = subprocess.run(cmd, stdout=subprocess.PIPE, stderr=subprocess.PIPE)
        if res.returncode == 0:
            found_file = None
            for ext in [".mp3", ".webm", ".m4a", ".opus"]:
                test_path = os.path.join(CACHE_DIR, f"{video_id}{ext}")
                if os.path.exists(test_path):
                    found_file = test_path
                    break
                    
            if found_file:
                if not found_file.endswith(".mp3"):
                    new_path = os.path.join(CACHE_DIR, f"{video_id}.mp3")
                    if os.path.exists(new_path):
                        os.remove(new_path)
                    os.rename(found_file, new_path)
                    found_file = new_path
                    
                file_size = os.path.getsize(found_file)
                
                conn = sqlite3.connect(DB_FILE)
                c = conn.cursor()
                c.execute('''
                    UPDATE song_cache 
                    SET is_cached = 1, file_size = ? 
                    WHERE video_id = ?
                ''', (file_size, video_id))
                conn.commit()
                conn.close()
                print(f"[CACHE] Track {video_id} successfully cached ({file_size} bytes).")
                
                evict_low_priority_songs()
        else:
            print(f"[CACHE] Error caching {video_id}: yt-dlp returned {res.returncode}")
    except Exception as e:
        print(f"[CACHE] Download thread exception for {video_id}:", e)

def evict_low_priority_songs():
    config = get_cache_config()
    max_songs = config.get("max_songs", 5)
    max_size_bytes = config.get("max_size_mb", 50) * 1024 * 1024
    
    conn = sqlite3.connect(DB_FILE)
    c = conn.cursor()
    # Exclude tracks that are favorited by any user to protect them from eviction
    c.execute('''
        SELECT video_id, file_size, play_count, last_played 
        FROM song_cache 
        WHERE is_cached = 1 
          AND video_id NOT IN (SELECT youtube_id FROM favorites WHERE is_youtube = 1)
    ''')
    cached_songs = c.fetchall()
    conn.close()
    
    if not cached_songs:
        return
        
    now = time.time()
    song_list = []
    for video_id, file_size, play_count, last_played in cached_songs:
        recency_weight = 100000.0 / (now - last_played + 1.0)
        score = (play_count * 100) + recency_weight
        song_list.append({
            "video_id": video_id,
            "file_size": file_size,
            "score": score
        })
        
    song_list.sort(key=lambda x: x["score"])
    
    total_size = sum(s["file_size"] for s in song_list)
    total_count = len(song_list)
    
    evicted_ids = []
    idx = 0
    while (total_count > max_songs or total_size > max_size_bytes) and idx < len(song_list):
        evict_item = song_list[idx]
        v_id = evict_item["video_id"]
        size = evict_item["file_size"]
        
        file_path = os.path.join(CACHE_DIR, f"{v_id}.mp3")
        if os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"[CACHE] Evicted track {v_id} from cache to free up space (Score: {evict_item['score']:.1f}).")
            except Exception as e:
                print(f"[CACHE] Error removing evicted file {file_path}:", e)
                
        evicted_ids.append(v_id)
        total_count -= 1
        total_size -= size
        idx += 1
        
    if evicted_ids:
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        for v_id in evicted_ids:
            c.execute("UPDATE song_cache SET is_cached = 0, file_size = 0 WHERE video_id = ?", (v_id,))
        conn.commit()
        conn.close()

# Cache to store video_id -> audio URL mapping to avoid re-running yt-dlp
url_cache = {}

def yt_dlp_search(query, limit=20):
    try:
        cmd = [
            sys.executable, "-m", "yt_dlp",
            f"ytsearch{limit}:{query}",
            "--dump-json",
            "--flat-playlist",
            "--no-download",
            "--no-warnings",
            "--quiet"
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30, encoding="utf-8", errors="replace")
        items = []
        for line in result.stdout.strip().split("\n"):
            if not line.strip(): continue
            try:
                data = json.loads(line)
                items.append({
                    "id": data.get("id", ""),
                    "title": data.get("title", "Unknown"),
                    "artist": data.get("channel", data.get("uploader", "Unknown")),
                    "duration": data.get("duration", 0),
                    "thumbnail": data.get("thumbnail", data.get("thumbnails", [{}])[-1].get("url", "")),
                    "url": f"/watch?v={data.get('id', '')}",
                    "views": data.get("view_count", 0),
                })
            except json.JSONDecodeError: continue
        return items
    except Exception as e:
        return {"error": str(e)}

def yt_dlp_get_audio_url(video_id, is_video=False):
    cache_key = f"{video_id}_{'video' if is_video else 'audio'}"
    if cache_key in url_cache:
        return url_cache[cache_key]
    try:
        format_selector = "best[ext=mp4]/best" if is_video else "bestaudio[ext=m4a]/bestaudio[ext=webm]/bestaudio"
        cmd = [
            sys.executable, "-m", "yt_dlp",
            f"https://www.youtube.com/watch?v={video_id}",
            "--dump-json",
            "--no-download",
            "--no-warnings",
            "--quiet",
            "-f", format_selector
        ]
        result = subprocess.run(cmd, capture_output=True, text=True, timeout=30, encoding="utf-8", errors="replace")
        if result.returncode != 0:
            return {"error": f"yt-dlp error: {result.stderr.strip()[:200]}"}
        data = json.loads(result.stdout.strip())
        res = {
            "title": data.get("title", "Unknown"),
            "artist": data.get("channel", data.get("uploader", "Unknown")),
            "duration": data.get("duration", 0),
            "thumbnail": data.get("thumbnail", ""),
            "audioUrl": data.get("url", ""),
            "ext": data.get("ext", "mp4" if is_video else "m4a"),
        }
        
        # Extract subtitles
        subs_data = data.get("subtitles", {})
        auto_caps = data.get("automatic_captions", {})
        subs_url = None
        
        # Priority 1: Manual subtitles (ru, en, uk regional codes)
        for lang_code in subs_data.keys():
            if lang_code.split("-")[0] in ["ru", "en", "uk"]:
                for s in subs_data[lang_code]:
                    if s.get("ext") == "json3":
                        subs_url = s.get("url")
                        break
            if subs_url:
                break
                
        # Priority 2: Automatic captions (ru, en, uk regional codes)
        if not subs_url:
            for lang_code in auto_caps.keys():
                if lang_code.split("-")[0] in ["ru", "en", "uk"]:
                    for s in auto_caps[lang_code]:
                        if s.get("ext") == "json3":
                            subs_url = s.get("url")
                            break
                if subs_url:
                    break
                    
        if subs_url:
            res["lyricsUrl"] = subs_url
        url_cache[cache_key] = res
        return res
    except Exception as e:
        return {"error": str(e)}

room_states = {}

class YTProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_POST(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)
        
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length) if content_length > 0 else b""
        
        # Try to parse JSON data if available
        data = {}
        if post_data:
            try:
                data = json.loads(post_data.decode('utf-8'))
            except Exception:
                pass
                
        if parsed.path == "/api/room":
            room_id = params.get("id", [""])[0]
            if not room_id:
                self._send_json({"error": "Missing room id"}, 400)
                return
            room_states[room_id] = data
            self._send_json({"status": "updated"})
        elif parsed.path == "/api/auth/register":
            self._handle_db_register(data)
        elif parsed.path == "/api/auth/login":
            self._handle_db_login(data)
        elif parsed.path == "/api/auth/avatar":
            self._handle_db_avatar(data)
        elif parsed.path == "/api/favorites":
            self._handle_post_favorites(data)
        elif parsed.path == "/api/playlists":
            self._handle_post_playlists(data)
        elif parsed.path == "/api/playlists/add":
            self._handle_playlists_add(data)
        elif parsed.path == "/api/playlists/remove":
            self._handle_playlists_remove(data)
        elif parsed.path == "/api/playlists/delete":
            self._handle_playlists_delete(data)
        else:
            self._send_json({"error": "Not found"}, 404)

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        if parsed.path == "/api/search":
            self._handle_search(params)
        elif parsed.path == "/api/stream":
            self._handle_stream_info(params)
        elif parsed.path == "/api/play":
            self._handle_play(params)
        elif parsed.path == "/api/room":
            room_id = params.get("id", [""])[0]
            self._send_json(room_states.get(room_id, {}))
        elif parsed.path == "/api/lyrics":
            self._handle_lyrics(params)
        elif parsed.path == "/api/favorites":
            self._handle_get_favorites(params)
        elif parsed.path == "/api/playlists":
            self._handle_get_playlists(params)
        elif parsed.path == "/api/recommendations":
            self._handle_recommendations(params)
        elif parsed.path == "/api/health":
            self._send_json({"status": "ok", "service": "nebula-yt-proxy"})
        else:
            self._send_json({"error": "Not found"}, 404)

    def _handle_search(self, params):
        query = params.get("q", [""])[0]
        limit = int(params.get("limit", ["20"])[0])
        if not query:
            self._send_json({"error": "Missing 'q'"}, 400)
            return
        results = yt_dlp_search(query, limit)
        if isinstance(results, dict) and "error" in results:
            self._send_json(results, 500)
        else:
            self._send_json({"items": results})

    def _handle_recommendations(self, params):
        category = params.get("category", ["pop"])[0]
        queries = {
            "pop": "pop trending hits music",
            "synthwave": "synthwave cyberpunk pop retro 80s",
            "lofi": "lofi study chillout lofi beats relax",
            "cyberpunk": "cyberpunk gaming beats darksynth electronic"
        }
        query = queries.get(category, "pop trending hits music")
        results = yt_dlp_search(query, limit=15)
        if isinstance(results, dict) and "error" in results:
            self._send_json(results, 500)
        else:
            self._send_json({"items": results})

    def _handle_stream_info(self, params):
        video_id = params.get("id", [""])[0]
        is_video = params.get("video", ["0"])[0] == "1"
        if not video_id:
            self._send_json({"error": "Missing 'id'"}, 400)
            return
        result = yt_dlp_get_audio_url(video_id, is_video=is_video)
        if "error" in result:
            self._send_json(result, 500)
        else:
            # Tell frontend to use our /api/play endpoint instead of raw googlevideo.com url
            result_copy = dict(result)
            result_copy["audioUrl"] = f"http://localhost:{PORT}/api/play?id={video_id}{'&video=1' if is_video else ''}"
            self._send_json(result_copy)

    def _handle_lyrics(self, params):
        video_id = params.get("id", [""])[0]
        passed_title = params.get("title", [""])[0]
        passed_artist = params.get("artist", [""])[0]
        
        if not video_id and not passed_title: 
            return self._send_json({"error": "Missing id or title"}, 400)
        
        import glob
        import os
        import tempfile
        import re
        import urllib.request
        import urllib.parse
        
        title = passed_title
        artist = passed_artist
        
        # 1. Fetch metadata using the existing yt-dlp cache if video_id is provided
        if video_id:
            info = yt_dlp_get_audio_url(video_id)
            title = title or info.get("title", "")
            artist = artist or info.get("artist", "")
        
        lyrics = None
        
        # Helper to clean up titles for higher lyrics search matching
        def clean_text(text, is_title=True):
            if not text: return ""
            text = re.sub(r"\s*[(\[][Oo]fficial\s*[Vv]ideo[)\]]", "", text)
            text = re.sub(r"\s*[(\[][Mm]/?[Vv][)\]]", "", text)
            text = re.sub(r"\s*[(\[][Ll]yric\s*[Vv]ideo[)\]]", "", text)
            text = re.sub(r"\s*[(\[][Hh][Dd][)\]]", "", text)
            text = re.sub(r"\s*[(]?[Cc]fficial\s*[Aa]udio[)]?", "", text)
            if is_title:
                text = re.sub(r"\s*[(]?[Ff]eat\..*?[)]?", "", text)
                text = re.sub(r"\s*[(]?[Ff]eaturings?.*?[)]?", "", text)
            return text.strip()

        # Helper to parse artist and track name from video title
        def parse_artist_and_title(video_title, video_uploader):
            art = video_uploader or ""
            tit = video_title or ""
            
            separators = [" - ", " – ", " — ", " | ", " : "]
            for sep in separators:
                if sep in video_title:
                    parts = video_title.split(sep, 1)
                    art = parts[0].strip()
                    tit = parts[1].strip()
                    break
                    
            return clean_text(art, is_title=False), clean_text(tit, is_title=True)

        # 2. Try fetching high-quality synced lyrics from LRCLib API
        if title:
            clean_artist, clean_title = parse_artist_and_title(title, artist)
            
            def parse_lrc_content(synced_text):
                parsed_lyrics = []
                for line in synced_text.split("\n"):
                    line = line.strip()
                    if not line: continue
                    match = re.match(r"^\[(\d+):(\d+)[.:](\d+)\](.*)$", line)
                    if match:
                        m, s, ms, txt = match.groups()
                        t = int(m) * 60 + int(s) + float(f"0.{ms}")
                        parsed_lyrics.append({"time": t, "text": txt.strip()})
                return parsed_lyrics

            try:
                lrclib_url = f"https://lrclib.net/api/get?artist={urllib.parse.quote(clean_artist)}&track_name={urllib.parse.quote(clean_title)}"
                headers = {
                    "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                    "Accept": "application/json"
                }
                req = urllib.request.Request(lrclib_url, headers=headers)
                with urllib.request.urlopen(req, timeout=10) as resp:
                    if resp.status == 200:
                        res = json.loads(resp.read().decode("utf-8"))
                        synced = res.get("syncedLyrics")
                        if synced:
                            lyrics = parse_lrc_content(synced)
                            if lyrics:
                                print(f"Successfully loaded professional lyrics from LRCLib via GET for: {clean_artist} - {clean_title}")
            except Exception as e:
                print("LRCLib GET failed, trying search fallback. Error:", e)

            if lyrics is None:
                try:
                    query = f"{clean_artist} {clean_title}"
                    lrclib_url = f"https://lrclib.net/api/search?q={urllib.parse.quote(query)}"
                    headers = {
                        "User-Agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36",
                        "Accept": "application/json"
                    }
                    req = urllib.request.Request(lrclib_url, headers=headers)
                    with urllib.request.urlopen(req, timeout=10) as resp:
                        if resp.status == 200:
                            results = json.loads(resp.read().decode("utf-8"))
                            if results:
                                for res in results:
                                    synced = res.get("syncedLyrics")
                                    if synced:
                                        lyrics = parse_lrc_content(synced)
                                        if lyrics:
                                            print(f"Successfully loaded professional lyrics from LRCLib via SEARCH for: {res.get('artistName')} - {res.get('trackName')}")
                                            break
                except Exception as e:
                    print("LRCLib SEARCH failed. Error:", e)

        # 3. Download and parse YouTube subtitles if LRCLib found nothing
        if lyrics is None:
            temp_dir = tempfile.gettempdir()
            temp_base = os.path.join(temp_dir, f"nebula_sub_{video_id}")
            
            cmd = [
                sys.executable, "-m", "yt_dlp",
                "--skip-download",
                "--write-subs",
                "--write-auto-subs",
                "--sub-langs", "ru,en,uk",
                "--sub-format", "json3",
                "-o", temp_base,
                f"https://www.youtube.com/watch?v={video_id}"
            ]
            
            try:
                subprocess.run(cmd, capture_output=True, timeout=20)
            except Exception as e:
                print("Error downloading subtitles via yt-dlp:", e)
                
            pattern = f"{temp_base}.*.json3"
            files = glob.glob(pattern)
            
            raw_lyrics = []
            if files:
                best_file = None
                for lang in ["ru", "en", "uk"]:
                    matching = [f for f in files if f.endswith(f".{lang}.json3")]
                    if matching:
                        best_file = matching[0]
                        break
                
                if not best_file:
                    best_file = files[0]
                    
                try:
                    with open(best_file, "r", encoding="utf-8") as f:
                        j3 = json.load(f)
                        for ev in j3.get("events", []):
                            t = ev.get("tStartMs", 0) / 1000.0
                            segs = ev.get("segs", [])
                            text = "".join(s.get("utf8", "") for s in segs if s.get("utf8") != "\n").strip()
                            if text:
                                raw_lyrics.append({"time": t, "text": text})
                except Exception as e:
                    print("Error parsing subtitle file:", e)
                    
            for f in files:
                try:
                    os.remove(f)
                except Exception:
                    pass
            
            lyrics = []
            if raw_lyrics:
                current_line = []
                current_start = None
                
                for ev in raw_lyrics:
                    t = ev["time"]
                    text = ev["text"]
                    
                    if current_start is None:
                        current_start = t
                        current_line.append(text)
                    elif t - current_start < 3.0:
                        if text not in current_line:
                            current_line.append(text)
                    else:
                        full_text = " ".join(current_line).strip()
                        full_text = " ".join(full_text.split())
                        if full_text:
                            full_text = full_text[0].upper() + full_text[1:]
                            lyrics.append({"time": current_start, "text": full_text})
                        current_start = t
                        current_line = [text]
                        
                if current_line:
                    full_text = " ".join(current_line).strip()
                    full_text = " ".join(full_text.split())
                    if full_text:
                        full_text = full_text[0].upper() + full_text[1:]
                        lyrics.append({"time": current_start, "text": full_text})
        
        self._send_json({"lyrics": lyrics or []})

    def _handle_play(self, params):
        video_id = params.get("id", [""])[0]
        is_video = params.get("video", ["0"])[0] == "1"
        if not video_id:
            self.send_response(400)
            self.end_headers()
            return
            
        info = yt_dlp_get_audio_url(video_id, is_video=is_video)
        if "error" in info:
            self.send_response(500)
            self.end_headers()
            return
            
        title = info.get("title", "Unknown Title")
        artist = info.get("artist", "Unknown Artist")
        
        # Register play in database and increase play count
        register_song_play(video_id, title, artist)
        
        # Check if song is already cached locally
        cached_file_path = os.path.join(CACHE_DIR, f"{video_id}.mp3")
        
        if os.path.exists(cached_file_path):
            print(f"[CACHE] Serving cached file for {video_id} ('{title}')...")
            file_size = os.path.getsize(cached_file_path)
            
            client_range = self.headers.get("Range")
            start = 0
            end = file_size - 1
            
            if client_range:
                try:
                    range_val = client_range.split("=")[1]
                    parts = range_val.split("-")
                    start = int(parts[0]) if parts[0] else 0
                    end = int(parts[1]) if len(parts) > 1 and parts[1] else file_size - 1
                except Exception:
                    pass
            
            chunk_size = end - start + 1
            
            if client_range:
                self.send_response(206) # Partial Content
                self._set_cors_headers()
                self.send_header("Content-Type", "audio/mpeg")
                self.send_header("Content-Length", str(chunk_size))
                self.send_header("Content-Range", f"bytes {start}-{end}/{file_size}")
                self.send_header("Accept-Ranges", "bytes")
                self.end_headers()
            else:
                self.send_response(200)
                self._set_cors_headers()
                self.send_header("Content-Type", "audio/mpeg")
                self.send_header("Content-Length", str(file_size))
                self.send_header("Accept-Ranges", "bytes")
                self.end_headers()
                
            try:
                with open(cached_file_path, "rb") as f:
                    f.seek(start)
                    bytes_remaining = chunk_size
                    while bytes_remaining > 0:
                        read_len = min(8192, bytes_remaining)
                        chunk = f.read(read_len)
                        if not chunk:
                            break
                        self.wfile.write(chunk)
                        bytes_remaining -= len(chunk)
            except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
                pass
            except Exception as e:
                print("Error serving cached file:", e)
            return

        # Fallback to direct network streaming from YouTube
        target_url = info["audioUrl"]
        req = urllib.request.Request(target_url, headers={"User-Agent": "Mozilla/5.0"})
        
        client_range = self.headers.get("Range")
        if client_range:
            req.add_header("Range", client_range)
            
        try:
            with urllib.request.urlopen(req) as resp:
                self.send_response(resp.status)
                self._set_cors_headers()
                
                for h in ["Content-Type", "Content-Length", "Accept-Ranges", "Content-Range"]:
                    val = resp.headers.get(h)
                    if val:
                        self.send_header(h, val)
                self.end_headers()
                
                while True:
                    chunk = resp.read(8192)
                    if not chunk:
                        break
                    try:
                        self.wfile.write(chunk)
                    except Exception:
                        break
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.end_headers()
        except Exception as e:
            print("Proxy stream error:", e)

    def _handle_db_register(self, data):
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            return self._send_json({"error": "Логин и пароль обязательны!"}, 400)
            
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        try:
            avatars = ["👽", "🪐", "🚀", "🛸", "👾", "🤖", "⭐", "👩‍🚀", "👨‍🚀"]
            avatar = random.choice(avatars)
            c.execute("INSERT INTO users (username, password, avatar) VALUES (?, ?, ?)", 
                      (username, password, avatar))
            conn.commit()
            self._send_json({"status": "ok", "username": username, "avatar": avatar})
        except sqlite3.IntegrityError:
            self._send_json({"error": "Пользователь уже существует!"}, 400)
        finally:
            conn.close()

    def _handle_db_login(self, data):
        username = data.get("username")
        password = data.get("password")
        if not username or not password:
            return self._send_json({"error": "Логин и пароль обязательны!"}, 400)
            
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("SELECT password, avatar FROM users WHERE username = ?", (username,))
        row = c.fetchone()
        conn.close()
        
        if row and row[0] == password:
            self._send_json({"status": "ok", "username": username, "avatar": row[1]})
        else:
            self._send_json({"error": "Неверный логин или пароль!"}, 400)

    def _handle_db_avatar(self, data):
        username = data.get("username")
        avatar = data.get("avatar")
        if not username or not avatar:
            return self._send_json({"error": "Поля username и avatar обязательны!"}, 400)
            
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("UPDATE users SET avatar = ? WHERE username = ?", (avatar, username))
        conn.commit()
        conn.close()
        self._send_json({"status": "ok"})

    def _handle_get_favorites(self, params):
        username = params.get("username", [""])[0]
        if not username:
            return self._send_json({"error": "Missing 'username'"}, 400)
            
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute('''
            SELECT title, artist, url, cover, is_youtube, youtube_id, thumbnail 
            FROM favorites WHERE username = ?
        ''', (username,))
        rows = c.fetchall()
        conn.close()
        
        tracks = []
        for r in rows:
            is_yt = bool(r[4])
            yt_id = r[5]
            tracks.append({
                "title": r[0],
                "artist": r[1],
                "url": r[2],
                "cover": r[3],
                "isYoutube": is_yt,
                "youtubeId": yt_id,
                "thumbnail": r[6]
            })
            
            # Auto-save favorite tracks on the local device in the background
            if is_yt and yt_id:
                cached_file = os.path.join(CACHE_DIR, f"{yt_id}.mp3")
                if not os.path.exists(cached_file):
                    threading.Thread(target=download_and_cache_song, args=(yt_id, r[0], r[1])).start()
                    
        self._send_json({"favorites": tracks})

    def _handle_post_favorites(self, data):
        username = data.get("username")
        track = data.get("track")
        if not username or not track:
            return self._send_json({"error": "Missing 'username' or 'track'"}, 400)
            
        url = track.get("url")
        title = track.get("title", "Unknown")
        artist = track.get("artist", "Unknown")
        cover = track.get("cover", "🎵")
        is_youtube = 1 if track.get("isYoutube") else 0
        youtube_id = track.get("youtubeId", "")
        thumbnail = track.get("thumbnail", "")
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        c.execute("SELECT id FROM favorites WHERE username = ? AND url = ?", (username, url))
        row = c.fetchone()
        
        if row:
            c.execute("DELETE FROM favorites WHERE username = ? AND url = ?", (username, url))
            status = "removed"
        else:
            c.execute('''
                INSERT INTO favorites (username, title, artist, url, cover, is_youtube, youtube_id, thumbnail)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?)
            ''', (username, title, artist, url, cover, is_youtube, youtube_id, thumbnail))
            status = "added"
            
        conn.commit()
        conn.close()
        
        # If successfully liked, trigger background download!
        if status == "added" and is_youtube == 1 and youtube_id:
            threading.Thread(target=download_and_cache_song, args=(youtube_id, title, artist)).start()
            
        self._send_json({"status": status})

    def _handle_get_playlists(self, params):
        username = params.get("username", [""])[0]
        if not username:
            return self._send_json({"error": "Missing 'username'"}, 400)
            
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        c.execute("SELECT id, name FROM playlists WHERE username = ?", (username,))
        playlists_rows = c.fetchall()
        
        result = {}
        for p_id, p_name in playlists_rows:
            c.execute('''
                SELECT title, artist, url, cover, is_youtube, youtube_id, thumbnail 
                FROM playlist_tracks WHERE playlist_id = ?
            ''', (p_id,))
            tracks_rows = c.fetchall()
            
            tracks = []
            for r in tracks_rows:
                tracks.append({
                    "title": r[0],
                    "artist": r[1],
                    "url": r[2],
                    "cover": r[3],
                    "isYoutube": bool(r[4]),
                    "youtubeId": r[5],
                    "thumbnail": r[6]
                })
            result[p_name] = tracks
            
        conn.close()
        self._send_json({"playlists": result})

    def _handle_post_playlists(self, data):
        username = data.get("username")
        name = data.get("name")
        if not username or not name:
            return self._send_json({"error": "Missing 'username' or 'name'"}, 400)
            
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        try:
            c.execute("INSERT INTO playlists (username, name) VALUES (?, ?)", (username, name))
            conn.commit()
            self._send_json({"status": "created"})
        except sqlite3.IntegrityError:
            self._send_json({"error": "Плейлист с таким именем уже существует!"}, 400)
        finally:
            conn.close()

    def _handle_playlists_add(self, data):
        username = data.get("username")
        name = data.get("name")
        track = data.get("track")
        if not username or not name or not track:
            return self._send_json({"error": "Missing parameters"}, 400)
            
        title = track.get("title", "Unknown")
        artist = track.get("artist", "Unknown")
        url = track.get("url")
        cover = track.get("cover", "🎵")
        is_youtube = 1 if track.get("isYoutube") else 0
        youtube_id = track.get("youtubeId", "")
        thumbnail = track.get("thumbnail", "")
        
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        c.execute("SELECT id FROM playlists WHERE username = ? AND name = ?", (username, name))
        row = c.fetchone()
        if not row:
            c.execute("INSERT INTO playlists (username, name) VALUES (?, ?)", (username, name))
            c.execute("SELECT id FROM playlists WHERE username = ? AND name = ?", (username, name))
            row = c.fetchone()
            
        playlist_id = row[0]
        
        c.execute('''
            INSERT INTO playlist_tracks (playlist_id, title, artist, url, cover, is_youtube, youtube_id, thumbnail)
            VALUES (?, ?, ?, ?, ?, ?, ?, ?)
        ''', (playlist_id, title, artist, url, cover, is_youtube, youtube_id, thumbnail))
        
        conn.commit()
        conn.close()
        self._send_json({"status": "added"})

    def _handle_playlists_remove(self, data):
        username = data.get("username")
        name = data.get("name")
        track_index = data.get("track_index")
        
        if not username or not name or track_index is None:
            return self._send_json({"error": "Missing parameters"}, 400)
            
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        
        c.execute("SELECT id FROM playlists WHERE username = ? AND name = ?", (username, name))
        row = c.fetchone()
        if not row:
            conn.close()
            return self._send_json({"error": "Playlist not found"}, 404)
            
        playlist_id = row[0]
        
        c.execute("SELECT id FROM playlist_tracks WHERE playlist_id = ? ORDER BY id", (playlist_id,))
        tracks = c.fetchall()
        
        if 0 <= track_index < len(tracks):
            track_db_id = tracks[track_index][0]
            c.execute("DELETE FROM playlist_tracks WHERE id = ?", (track_db_id,))
            conn.commit()
            status = "removed"
        else:
            status = "out of range"
            
        conn.close()
        self._send_json({"status": status})

    def _handle_playlists_delete(self, data):
        username = data.get("username")
        name = data.get("name")
        if not username or not name:
            return self._send_json({"error": "Missing 'username' or 'name'"}, 400)
            
        conn = sqlite3.connect(DB_FILE)
        c = conn.cursor()
        c.execute("DELETE FROM playlists WHERE username = ? AND name = ?", (username, name))
        conn.commit()
        conn.close()
        self._send_json({"status": "deleted"})

    def _send_json(self, data, status=200):
        try:
            self.send_response(status)
            self._set_cors_headers()
            self.send_header("Content-Type", "application/json; charset=utf-8")
            self.end_headers()
            self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))
        except (ConnectionAbortedError, ConnectionResetError, BrokenPipeError):
            pass
        except Exception as e:
            print("[PROXY] Error sending JSON response:", e)

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, POST, OPTIONS, DELETE")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Range")
        self.send_header("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges")

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), YTProxyHandler)
    print(f"\nNebula YT Proxy running on http://localhost:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
