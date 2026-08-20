"""Shared helpers for Madar's Vercel Python functions."""
from __future__ import annotations

import json
import sys
from http import HTTPStatus
from http.server import BaseHTTPRequestHandler
from pathlib import Path
from urllib.parse import parse_qs, urlparse

ROOT = Path(__file__).resolve().parent
if str(ROOT) not in sys.path:
    sys.path.insert(0, str(ROOT))

import app as core  # noqa: E402


class JsonHandler(BaseHTTPRequestHandler):
    def query(self):
        return parse_qs(urlparse(self.path).query)

    def payload(self, maximum=80_000):
        length = int(self.headers.get("Content-Length", "0"))
        if length > maximum:
            raise ValueError("درخواست بیش از حد بزرگ است.")
        return json.loads(self.rfile.read(length).decode("utf-8") or "{}")

    def send_json(self, data, status=HTTPStatus.OK, cache="no-store"):
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", cache)
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        self.wfile.write(body)

    def send_error_json(self, exc, message="پردازش درخواست ناموفق بود.", status=HTTPStatus.BAD_GATEWAY):
        self.send_json({"error": message, "detail": str(exc)}, status)

    def do_OPTIONS(self):
        self.send_response(HTTPStatus.NO_CONTENT)
        self.send_header("Allow", "GET, POST, OPTIONS")
        self.end_headers()
