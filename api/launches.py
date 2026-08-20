from vercel_common import JsonHandler, core

class handler(JsonHandler):
    def do_GET(self):
        try:
            self.send_json(core.launches_api(self.query()), cache="s-maxage=180, stale-while-revalidate=900")
        except Exception as exc:
            self.send_error_json(exc, "منبع زنده پرتاب‌ها موقتاً پاسخ نداد.")
