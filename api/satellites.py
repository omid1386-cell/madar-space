from vercel_common import JsonHandler, core

class handler(JsonHandler):
    def do_GET(self):
        try:
            self.send_json(core.satellites_api(self.query()), cache="s-maxage=1800, stale-while-revalidate=3600")
        except Exception as exc:
            self.send_error_json(exc, "داده مداری موقتاً در دسترس نیست.")
