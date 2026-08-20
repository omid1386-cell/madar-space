from vercel_common import JsonHandler

class handler(JsonHandler):
    def do_GET(self):
        self.send_json({"ok": True, "service": "madar", "platform": "vercel"}, cache="public, max-age=30")
