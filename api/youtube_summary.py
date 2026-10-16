from http import HTTPStatus
from vercel_common import JsonHandler, core

class handler(JsonHandler):
    def do_POST(self):
        try:
            self.send_json(core.youtube_api(self.payload(maximum=600_000)))
        except ValueError as exc:
            self.send_json({"error": str(exc), "code": "invalid_input"}, HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            self.send_json(core.youtube_error_response(exc), HTTPStatus.BAD_GATEWAY)
