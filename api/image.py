import time
import urllib.parse
import urllib.request
from http import HTTPStatus
from vercel_common import JsonHandler, core

class handler(JsonHandler):
    def do_GET(self):
        try:
            image_url = self.query().get("url", [""])[0]
            parsed = urllib.parse.urlparse(image_url)
            if parsed.scheme != "https" or parsed.hostname not in core.IMAGE_HOSTS:
                self.send_json({"error": "منبع تصویر مجاز نیست."}, HTTPStatus.BAD_REQUEST)
                return
            cached = core.IMAGE_CACHE.get(image_url)
            if cached and time.time() - cached[0] < 3600:
                body, content_type = cached[1], cached[2]
            else:
                request = urllib.request.Request(image_url, headers={"User-Agent": core.USER_AGENT, "Accept": "image/avif,image/webp,image/*"})
                with urllib.request.urlopen(request, timeout=18) as response:
                    content_type = response.headers.get_content_type()
                    if not content_type.startswith("image/"):
                        raise ValueError("پاسخ منبع، تصویر نیست.")
                    body = response.read(8_000_001)
                    if len(body) > 8_000_000:
                        raise ValueError("حجم تصویر بیش از حد مجاز است.")
                core.IMAGE_CACHE[image_url] = (time.time(), body, content_type)
            self.send_response(HTTPStatus.OK)
            self.send_header("Content-Type", content_type)
            self.send_header("Content-Length", str(len(body)))
            self.send_header("Cache-Control", "public, s-maxage=3600, stale-while-revalidate=86400")
            self.send_header("X-Content-Type-Options", "nosniff")
            self.end_headers()
            self.wfile.write(body)
        except Exception as exc:
            self.send_error_json(exc, "تصویر موقتاً در دسترس نیست.")
