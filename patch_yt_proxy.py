import codecs

with codecs.open('yt_proxy.py', 'r', 'utf-8') as f:
    code = f.read()

patch1 = '''            "ext": data.get("ext", "mp4" if is_video else "m4a"),
        }
'''
new_patch1 = '''            "ext": data.get("ext", "mp4" if is_video else "m4a"),
        }
        
        # Extract subtitles
        subs_data = data.get("subtitles", {})
        auto_caps = data.get("automatic_captions", {})
        subs_url = None
        for lang in ["ru", "en", "uk"]:
            if lang in subs_data:
                for s in subs_data[lang]:
                    if s.get("ext") == "json3":
                        subs_url = s.get("url")
                        break
            if subs_url: break
            if lang in auto_caps:
                for s in auto_caps[lang]:
                    if s.get("ext") == "json3":
                        subs_url = s.get("url")
                        break
            if subs_url: break
        if subs_url:
            res["lyricsUrl"] = subs_url
'''
code = code.replace(patch1, new_patch1)

patch2 = '''        elif parsed.path == "/api/room":
            room_id = params.get("id", [""])[0]
            self._send_json(room_states.get(room_id, {}))'''
new_patch2 = '''        elif parsed.path == "/api/room":
            room_id = params.get("id", [""])[0]
            self._send_json(room_states.get(room_id, {}))
        elif parsed.path == "/api/lyrics":
            self._handle_lyrics(params)'''
code = code.replace(patch2, new_patch2)

patch3 = '''    def _handle_play(self, params):'''
new_patch3 = '''    def _handle_lyrics(self, params):
        video_id = params.get("id", [""])[0]
        if not video_id: return self._send_json({"error": "Missing id"}, 400)
        info = yt_dlp_get_audio_url(video_id)
        url = info.get("lyricsUrl")
        if not url: return self._send_json({"lyrics": []})
        try:
            req = __import__('urllib.request').request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
            with __import__('urllib.request').request.urlopen(req) as resp:
                raw = resp.read()
                import json
                j3 = json.loads(raw)
                lyrics = []
                for ev in j3.get("events", []):
                    t = ev.get("tStartMs", 0) / 1000.0
                    segs = ev.get("segs", [])
                    text = "".join(s.get("utf8", "") for s in segs if s.get("utf8") != "\\n").strip()
                    if text:
                        lyrics.append({"time": t, "text": text})
                self._send_json({"lyrics": lyrics})
        except Exception as e:
            self._send_json({"error": str(e)}, 500)

    def _handle_play(self, params):'''
code = code.replace(patch3, new_patch3)

with codecs.open('yt_proxy.py', 'w', 'utf-8') as f:
    f.write(code)
print('Patched yt_proxy.py!')
