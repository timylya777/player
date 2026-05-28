import json
import urllib.parse
from yt_proxy import YTProxyHandler

# We will inject room state into yt_proxy
room_states = {}

def handle_room(self, parsed, params):
    room_id = params.get("id", [""])[0]
    if not room_id:
        self._send_json({"error": "Missing room id"}, 400)
        return
        
    if self.command == "POST":
        content_length = int(self.headers.get('Content-Length', 0))
        post_data = self.rfile.read(content_length)
        try:
            data = json.loads(post_data.decode('utf-8'))
            room_states[room_id] = data
            self._send_json({"status": "updated"})
        except Exception as e:
            self._send_json({"error": str(e)}, 400)
    else:
        # GET
        state = room_states.get(room_id, {})
        self._send_json(state)
