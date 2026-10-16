from http import HTTPStatus
from vercel_common import JsonHandler, core


class handler(JsonHandler):
    def do_GET(self):
        try:
            self.send_json(core.agency_article_api(self.query()), cache="s-maxage=21600, stale-while-revalidate=86400")
        except ValueError as exc:
            self.send_json({"error": str(exc), "code": "invalid_input"}, HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            self.send_error_json(exc, "دریافت جزئیات مطلب رسمی ناموفق بود.")
