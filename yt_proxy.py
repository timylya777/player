"""
Nebula Player - YouTube Audio Proxy
Runs on port 9001, provides search and audio proxying via yt-dlp.
"""

import json
import subprocess
import sys
import urllib.request
from http.server import HTTPServer, BaseHTTPRequestHandler
from urllib.parse import urlparse, parse_qs
from concurrent.futures import ThreadPoolExecutor

PORT = 9001

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
        url_cache[cache_key] = res
        return res
    except Exception as e:
        return {"error": str(e)}

class YTProxyHandler(BaseHTTPRequestHandler):
    def do_OPTIONS(self):
        self.send_response(200)
        self._set_cors_headers()
        self.end_headers()

    def do_GET(self):
        parsed = urlparse(self.path)
        params = parse_qs(parsed.query)

        if parsed.path == "/api/search":
            self._handle_search(params)
        elif parsed.path == "/api/stream":
            self._handle_stream_info(params)
        elif parsed.path == "/api/play":
            self._handle_play(params)
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
            
        target_url = info["audioUrl"]
        req = urllib.request.Request(target_url, headers={"User-Agent": "Mozilla/5.0"})
        
        # Forward Range header from client
        client_range = self.headers.get("Range")
        if client_range:
            req.add_header("Range", client_range)
            
        try:
            with urllib.request.urlopen(req) as resp:
                self.send_response(resp.status)
                self._set_cors_headers()
                
                # Forward important headers
                for h in ["Content-Type", "Content-Length", "Accept-Ranges", "Content-Range"]:
                    val = resp.headers.get(h)
                    if val:
                        self.send_header(h, val)
                self.end_headers()
                
                # Stream body
                while True:
                    chunk = resp.read(8192)
                    if not chunk:
                        break
                    try:
                        self.wfile.write(chunk)
                    except Exception:
                        break # Client disconnected
        except urllib.error.HTTPError as e:
            self.send_response(e.code)
            self.end_headers()
        except Exception as e:
            print("Proxy stream error:", e)

    def _send_json(self, data, status=200):
        self.send_response(status)
        self._set_cors_headers()
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.end_headers()
        self.wfile.write(json.dumps(data, ensure_ascii=False).encode("utf-8"))

    def _set_cors_headers(self):
        self.send_header("Access-Control-Allow-Origin", "*")
        self.send_header("Access-Control-Allow-Methods", "GET, OPTIONS")
        self.send_header("Access-Control-Allow-Headers", "Content-Type, Range")
        self.send_header("Access-Control-Expose-Headers", "Content-Length, Content-Range, Accept-Ranges")

if __name__ == "__main__":
    server = HTTPServer(("0.0.0.0", PORT), YTProxyHandler)
    print(f"\nNebula YT Proxy running on http://localhost:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        server.shutdown()
