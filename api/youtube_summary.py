from http import HTTPStatus
from vercel_common import JsonHandler, core

class handler(JsonHandler):
    def do_POST(self):
        try:
            self.send_json(core.youtube_api(self.payload()))
        except ValueError as exc:
            self.send_error_json(exc, str(exc), HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            self.send_error_json(exc, "خلاصه‌سازی انجام نشد؛ عمومی‌بودن و کپشن ویدئو را بررسی کنید.")
