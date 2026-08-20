from http import HTTPStatus
from vercel_common import JsonHandler, core

class handler(JsonHandler):
    def do_POST(self):
        try:
            payload = self.payload()
            texts = payload.get("texts")
            if not isinstance(texts, list) or len(texts) > 180:
                raise ValueError("فهرست ترجمه معتبر نیست یا بیش از حد بزرگ است.")
            target = str(payload.get("target", "fa"))
            source = str(payload.get("source", "auto"))
            result = core.translate_texts_remote([str(x) for x in texts], target, source)
            self.send_json({"translations": result, "target": target, "automatic": True})
        except ValueError as exc:
            self.send_error_json(exc, str(exc), HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            self.send_error_json(exc, "ترجمه خودکار موقتاً در دسترس نیست.")
