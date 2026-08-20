from vercel_common import JsonHandler, core

class handler(JsonHandler):
    def do_GET(self):
        try:
            self.send_json(core.stats_api(), cache="s-maxage=300, stale-while-revalidate=900")
        except Exception as exc:
            self.send_error_json(exc, "آمار زنده موقتاً در دسترس نیست.")
