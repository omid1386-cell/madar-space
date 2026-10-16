#!/usr/bin/env python3
"""Madar — Persian space-learning research web app.

Run with: python app.py
The server uses only the Python standard library for the web layer. Optional
packages power YouTube transcript extraction and Persian translation.
"""

from __future__ import annotations

import json
import math
import hashlib
import html as html_lib
import os
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import xml.etree.ElementTree as ET
from collections import Counter
from datetime import timezone
from email.utils import parsedate_to_datetime
from http import HTTPStatus
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer
from html.parser import HTMLParser
from pathlib import Path
from typing import Any

ROOT = Path(__file__).resolve().parent
VENDOR = ROOT / "vendor"
if VENDOR.exists():
    sys.path.insert(0, str(VENDOR))
# Prefer the full-backend repository layout (static files in public/).
# Fall back to repository-root static files for compatibility with older
# GitHub/Vercel uploads where index.html was placed beside app.py.
PUBLIC_DIR = ROOT / "public"
PUBLIC = PUBLIC_DIR if (PUBLIC_DIR / "index.html").is_file() else ROOT
if not (PUBLIC / "index.html").is_file():
    raise RuntimeError("Frontend entry file not found: expected public/index.html or index.html")
PORT = int(os.environ.get("PORT", "8000"))
USER_AGENT = "Madar-Space-Learning/0.18-experimental (+educational prototype)"
LL2 = "https://ll.thespacedevs.com/2.3.0"
CACHE: dict[str, tuple[float, Any]] = {}
IMAGE_CACHE: dict[str, tuple[float, bytes, str]] = {}
CACHE_SECONDS = 300
CACHE_FILE = ROOT / "data-cache.json"
TRANSLATION_FILE = ROOT / "translation-cache.json"
TRANSLATION_CACHE: dict[str, str] = {}
AGENCY_CACHE_FILE = ROOT / "agency-feed-cache.json"
AGENCY_FALLBACK_FILE = PUBLIC / "agency-feed-fallback.json"
LAUNCH_FALLBACK_FILE = PUBLIC / "launches-fallback.json"
FAILURE_FALLBACK_FILE = PUBLIC / "failures-fallback.json"
AGENCY_FEED_CACHE: dict[str, Any] = {}
AGENCY_ARTICLE_CACHE: dict[str, tuple[float, dict[str, Any]]] = {}
AGENCY_ARTICLE_CACHE_SECONDS = 21_600
AGENCY_FEEDS = {
    "nasa": "https://www.nasa.gov/news-release/feed/",
    "esa": "https://www.esa.int/rssfeed/TopNews",
}
IMAGE_HOSTS = {
    "thespacedevs-prod.nyc3.digitaloceanspaces.com",
    "www.nasa.gov",
    "science.nasa.gov",
    "assets.science.nasa.gov",
    "images-assets.nasa.gov",
    "www.esa.int",
    "i.ytimg.com",
    "img.youtube.com",
}

FA_STOP = {
    "از", "به", "در", "با", "برای", "که", "این", "آن", "را", "و", "یا", "یک", "می", "شود",
    "شده", "است", "بود", "بر", "تا", "هم", "های", "خود", "دارد", "کرد", "اما", "اگر", "پس",
}
EN_STOP = {
    "the", "a", "an", "and", "or", "to", "of", "in", "on", "for", "with", "is", "are", "was",
    "were", "be", "been", "that", "this", "it", "as", "at", "by", "from", "we", "you", "they",
    "will", "can", "into", "about", "than", "then", "so", "our", "their", "its", "have", "has",
}
TECH_TERMS = {
    "delta-v": "دلتاوی؛ بودجه تغییر سرعت مأموریت",
    "specific impulse": "تکانه ویژه؛ شاخص بهره‌وری پیشران",
    "thrust": "رانش؛ نیروی تولیدشده توسط موتور",
    "payload": "محموله؛ بخش سودمند حمل‌شده",
    "orbit": "مدار؛ مسیر گرانشی جسم",
    "apogee": "اوج؛ دورترین نقطه مدار از زمین",
    "perigee": "حضیض؛ نزدیک‌ترین نقطه مدار به زمین",
    "inclination": "میل مداری؛ زاویه صفحه مدار با استوا",
    "staging": "مرحله‌بندی؛ رهاکردن جرم مرده طی صعود",
    "fairing": "فیرینگ؛ پوشش آیرودینامیکی محموله",
    "max q": "بیشینه فشار دینامیکی",
    "gravity turn": "گردش گرانشی؛ تغییر تدریجی مسیر به سمت افق",
    "propellant": "پیشرانه؛ سوخت و اکسیدکننده",
    "oxidizer": "اکسیدکننده",
    "telemetry": "تله‌متری؛ داده‌های اندازه‌گیری‌شده ارسالی",
    "guidance": "هدایت؛ تعیین فرمان لازم برای رسیدن به مسیر هدف",
    "reentry": "بازورود به جو",
    "rendezvous": "ملاقات مداری",
    "circularization": "دایروی‌سازی مدار",
}

try:
    if CACHE_FILE.exists():
        saved_cache = json.loads(CACHE_FILE.read_text(encoding="utf-8"))
        for cache_url, cached in saved_cache.items():
            CACHE[cache_url] = (float(cached["timestamp"]), cached["data"])
except Exception:
    pass

try:
    if TRANSLATION_FILE.exists():
        TRANSLATION_CACHE.update(json.loads(TRANSLATION_FILE.read_text(encoding="utf-8")))
except Exception:
    pass

try:
    if AGENCY_CACHE_FILE.exists():
        AGENCY_FEED_CACHE.update(json.loads(AGENCY_CACHE_FILE.read_text(encoding="utf-8")))
except Exception:
    pass


def persist_cache() -> None:
    try:
        serializable = {url: {"timestamp": ts, "data": data} for url, (ts, data) in CACHE.items()}
        temporary = CACHE_FILE.with_suffix(".tmp")
        temporary.write_text(json.dumps(serializable, ensure_ascii=False), encoding="utf-8")
        temporary.replace(CACHE_FILE)
    except Exception:
        pass


def persist_translations() -> None:
    try:
        temporary = TRANSLATION_FILE.with_suffix(".tmp")
        temporary.write_text(json.dumps(TRANSLATION_CACHE, ensure_ascii=False), encoding="utf-8")
        temporary.replace(TRANSLATION_FILE)
    except Exception:
        pass


def translate_texts_remote(texts: list[str], target: str, source: str = "auto") -> list[str]:
    """Translate short UI/content batches using Google's public web endpoint.

    Results are persisted; source text is returned unchanged if the service is
    unavailable. A visible automatic-translation label remains in the client.
    """
    if target not in {"fa", "en"} or source not in {"auto", "fa", "en"}:
        raise ValueError("زبان ترجمه پشتیبانی نمی‌شود.")
    clean = [str(t)[:5000] for t in texts]
    results: list[str | None] = [None] * len(clean)
    missing: list[int] = []
    for i, text in enumerate(clean):
        key = f"{source}>{target}:{text}"
        if key in TRANSLATION_CACHE:
            results[i] = TRANSLATION_CACHE[key]
        else:
            missing.append(i)

    delimiter = "|||MADARSEP|||"
    groups: list[list[int]] = []
    group: list[int] = []
    size = 0
    for index in missing:
        text_size = len(clean[index]) + len(delimiter) + 4
        if group and size + text_size > 4200:
            groups.append(group); group = []; size = 0
        group.append(index); size += text_size
    if group:
        groups.append(group)

    for indexes in groups:
        joined = f"\n{delimiter}\n".join(clean[i] for i in indexes)
        query = urllib.parse.urlencode({"client": "gtx", "sl": source, "tl": target, "dt": "t", "q": joined})
        url = "https://translate.googleapis.com/translate_a/single?" + query
        try:
            request = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0 Madar/0.3"})
            with urllib.request.urlopen(request, timeout=15) as response:
                payload = json.loads(response.read().decode("utf-8"))
            translated_joined = "".join(part[0] for part in payload[0])
            translated_parts = [part.strip() for part in translated_joined.split(delimiter)]
            if len(translated_parts) != len(indexes):
                raise ValueError("قالب ترجمه گروهی حفظ نشد.")
            for index, translated in zip(indexes, translated_parts):
                results[index] = translated
                TRANSLATION_CACHE[f"{source}>{target}:{clean[index]}"] = translated
        except Exception:
            for index in indexes:
                results[index] = clean[index]
    if missing:
        persist_translations()
    return [str(value if value is not None else clean[i]) for i, value in enumerate(results)]


FA_DIGITS = str.maketrans("0123456789", "۰۱۲۳۴۵۶۷۸۹")
ROCKET_FA = {
    "Falcon 9 Block 5": "فالکن ۹ بلوک ۵", "Falcon 9": "فالکن ۹", "Long March 12": "لانگ مارچ ۱۲",
    "Long March 7A": "لانگ مارچ ۷اِی", "Long March 2C": "لانگ مارچ ۲سی", "Long March 3B/E": "لانگ مارچ ۳بی/ای",
    "New Glenn": "نیو گلن", "Electron": "الکترون", "Soyuz 2.1b/Fregat-M": "سایوز ۲.۱بی / فرگات-ام",
    "Ariane 6": "آریان ۶", "Vega-C": "وگا-سی", "PSLV-XL": "پی‌اِس‌اِل‌وی-اِکس‌اِل",
    "Tianlong-3": "تیان‌لونگ ۳", "H3-22": "اچ ۳-۲۲", "H3": "اچ ۳",
}
PROVIDER_FA = {
    "SpaceX": "اسپیس‌ایکس", "Rocket Lab": "راکت‌لب", "Blue Origin": "بلو اوریجین",
    "China Aerospace Science and Technology Corporation": "شرکت علوم و فناوری هوافضای چین (CASC)",
    "Arianespace": "آریان‌اسپیس", "Roscosmos": "روسکاسموس", "Indian Space Research Organization": "سازمان پژوهش‌های فضایی هند (ISRO)",
    "Japan Aerospace Exploration Agency": "آژانس کاوش‌های هوافضای ژاپن (JAXA)", "Space Pioneer": "اسپیس پایونیر",
}
COUNTRY_FA = {"China":"چین","United States of America":"ایالات متحده","United States":"ایالات متحده","Russian Federation":"روسیه","Russia":"روسیه","India":"هند","Japan":"ژاپن","France":"فرانسه","New Zealand":"نیوزیلند","French Guiana":"گویان فرانسه"}
MISSION_TYPE_FA = {"Communications":"مخابراتی","Earth Science":"علوم زمین","Earth Observation":"رصد زمین","Government/Top Secret":"دولتی / طبقه‌بندی‌شده","Technology":"نمایش فناوری","Navigation":"ناوبری","Science":"علمی","Astrophysics":"اخترفیزیک","Resupply":"تدارکاتی","Human Exploration":"اکتشاف سرنشین‌دار","Unknown":"نامشخص"}
ORBIT_FA = {"LEO":"مدار پایین زمین (LEO)","SSO":"مدار خورشیدآهنگ (SSO)","GTO":"مدار انتقال زمین‌ایستا (GTO)","GEO":"مدار زمین‌ایستا (GEO)","MEO":"مدار میانی زمین (MEO)","HEO":"مدار بسیار بیضوی (HEO)","—":"نامشخص"}


def mission_name_fa(name: str, rocket_name: str) -> str:
    parts = [part.strip() for part in name.split("|", 1)]
    rocket_en = parts[0] if parts else rocket_name
    mission = parts[1] if len(parts) > 1 else ""
    rocket_fa = ROCKET_FA.get(rocket_name) or ROCKET_FA.get(rocket_en) or f"پرتابگر {rocket_en}"
    patterns = [
        (r"Starlink Group\s+(.+)", r"گروه استارلینک \1"),
        (r"SatNet LEO Group\s+(.+)", r"گروه \1 منظومه SatNet در مدار پایین زمین"),
        (r"Satellite for Earth Observation\s*\((.+)\)", r"ماهواره رصد زمین (\1)"),
        (r"Demo Flight", "پرواز نمایشی"),
        (r"Maiden Flight", "پرواز نخست"),
    ]
    mission_fa = mission
    for pattern, replacement in patterns:
        if re.fullmatch(pattern, mission, flags=re.I):
            mission_fa = re.sub(pattern, replacement, mission, flags=re.I); break
    else:
        if mission:
            mission_fa = f"مأموریت {mission}"
    result = rocket_fa + (f" | {mission_fa}" if mission_fa else "")
    return result.translate(FA_DIGITS)


def clean_feed_html(raw: str, limit: int = 900) -> str:
    text = re.sub(r"<(script|style)[^>]*>.*?</\1>", " ", raw or "", flags=re.I | re.S)
    text = re.sub(r"<[^>]+>", " ", text)
    text = html_lib.unescape(text)
    text = re.sub(r"\s+", " ", text).strip()
    return text[:limit].rstrip()


def extract_feed_image(*blocks: str) -> str | None:
    for block in blocks:
        if not block:
            continue
        match = re.search(r"<img[^>]+src=[\"']([^\"']+)", block, flags=re.I)
        if match:
            return html_lib.unescape(match.group(1))
    return None


def optimize_feed_image(url: str | None) -> str | None:
    if not url:
        return None
    parsed = urllib.parse.urlparse(url)
    query = dict(urllib.parse.parse_qsl(parsed.query, keep_blank_values=True))
    if parsed.hostname == "assets.science.nasa.gov" and "/dynamicimage/" in parsed.path:
        query.update({"w": "900", "h": "560", "fit": "crop"})
    elif parsed.hostname in {"www.nasa.gov", "science.nasa.gov"} and "/wp-content/" in parsed.path:
        query["w"] = "900"
    return urllib.parse.urlunparse(parsed._replace(query=urllib.parse.urlencode(query)))


def persist_agency_cache() -> None:
    try:
        temporary = AGENCY_CACHE_FILE.with_suffix(".tmp")
        temporary.write_text(json.dumps(AGENCY_FEED_CACHE, ensure_ascii=False), encoding="utf-8")
        temporary.replace(AGENCY_CACHE_FILE)
        public_items: list[dict[str, Any]] = []
        for agency in ("nasa", "esa"):
            public_items.extend(AGENCY_FEED_CACHE.get(agency, {}).get("items", []))
        public_items.sort(key=lambda x: x.get("epoch", 0), reverse=True)
        public_payload = {
            "items": public_items[:40], "count": len(public_items), "agencies": ["nasa", "esa"],
            "updated": {name: AGENCY_FEED_CACHE.get(name, {}).get("timestamp") for name in ("nasa", "esa")},
            "poll_seconds": 180, "sources": AGENCY_FEEDS, "errors": [], "offline_fallback": True,
        }
        public_tmp = AGENCY_FALLBACK_FILE.with_suffix(".tmp")
        public_tmp.write_text(json.dumps(public_payload, ensure_ascii=False), encoding="utf-8")
        public_tmp.replace(AGENCY_FALLBACK_FILE)
    except Exception:
        pass


def fetch_agency_feed(agency: str, force: bool = False) -> list[dict[str, Any]]:
    if agency not in AGENCY_FEEDS:
        raise ValueError("آژانس پشتیبانی نمی‌شود.")
    cached = AGENCY_FEED_CACHE.get(agency)
    now = time.time()
    if cached and not force and now - float(cached.get("timestamp", 0)) < 180:
        return list(cached.get("items", []))
    try:
        request = urllib.request.Request(AGENCY_FEEDS[agency], headers={"User-Agent": USER_AGENT, "Accept": "application/rss+xml,application/xml,text/xml"})
        with urllib.request.urlopen(request, timeout=20) as response:
            raw = response.read(4_000_000)
        root = ET.fromstring(raw)
        parsed: list[dict[str, Any]] = []
        seen: set[str] = set()
        for item in root.findall(".//item"):
            def value(tag: str) -> str:
                node = item.find(tag)
                return (node.text or "").strip() if node is not None else ""
            title = value("title")
            link = value("link")
            guid = value("guid") or link or title
            if not title or not link or guid in seen:
                continue
            seen.add(guid)
            description_raw = value("description")
            content_raw = ""
            for child in list(item):
                if child.tag.endswith("encoded"):
                    content_raw = (child.text or "").strip(); break
            pub_raw = value("pubDate")
            try:
                published = parsedate_to_datetime(pub_raw).astimezone(timezone.utc).isoformat().replace("+00:00", "Z")
                epoch = parsedate_to_datetime(pub_raw).timestamp()
            except Exception:
                published = pub_raw
                epoch = 0.0
            categories = [(node.text or "").strip() for node in item.findall("category") if (node.text or "").strip()]
            image = optimize_feed_image(extract_feed_image(description_raw, content_raw))
            summary = clean_feed_html(description_raw or content_raw)
            if len(summary) < 50:
                summary = clean_feed_html(content_raw)
            parsed.append({
                "id": guid, "agency": agency.upper(), "title": clean_feed_html(title, 260), "url": link,
                "published": published, "epoch": epoch, "summary": summary, "image": image,
                "category": categories[0] if categories else ("ESA Top News" if agency == "esa" else "NASA News"),
            })
        parsed.sort(key=lambda x: x.get("epoch", 0), reverse=True)
        parsed = parsed[:30]
        # Official English remains authoritative; Persian is an explicitly
        # marked automatic translation stored beside it.
        translation_inputs: list[str] = []
        for entry in parsed:
            translation_inputs.extend([entry["title"], entry["summary"]])
        translated = translate_texts_remote(translation_inputs, "fa", "en") if translation_inputs else []
        for index, entry in enumerate(parsed):
            entry["title_fa"] = translated[index * 2] if len(translated) > index * 2 else entry["title"]
            entry["summary_fa"] = translated[index * 2 + 1] if len(translated) > index * 2 + 1 else entry["summary"]
        AGENCY_FEED_CACHE[agency] = {"timestamp": now, "items": parsed, "source": AGENCY_FEEDS[agency]}
        persist_agency_cache()
        return parsed
    except Exception:
        if cached:
            return list(cached.get("items", []))
        raise


def agency_feed_api(params: dict[str, list[str]]) -> dict[str, Any]:
    agency = params.get("agency", ["all"])[0].lower()
    limit = min(max(int(params.get("limit", ["20"])[0]), 1), 40)
    force = params.get("refresh", ["0"])[0] == "1"
    agencies = [agency] if agency in AGENCY_FEEDS else ["nasa", "esa"]
    items: list[dict[str, Any]] = []
    errors: list[str] = []
    for name in agencies:
        try:
            items.extend(fetch_agency_feed(name, force=force))
        except Exception as exc:
            errors.append(f"{name.upper()}: {type(exc).__name__}")
    items.sort(key=lambda x: x.get("epoch", 0), reverse=True)
    updated = {name: AGENCY_FEED_CACHE.get(name, {}).get("timestamp") for name in agencies}
    return {
        "items": items[:limit], "count": len(items), "agencies": agencies, "updated": updated,
        "poll_seconds": 180, "sources": {name: AGENCY_FEEDS[name] for name in agencies}, "errors": errors,
    }


ARTICLE_VOID_TAGS = {"meta", "link", "img", "br", "hr", "input", "source", "area", "base", "col", "embed", "param", "track", "wbr"}
ARTICLE_SKIP_TAGS = {"script", "style", "nav", "header", "footer", "aside", "svg", "form", "noscript", "button", "select", "option"}
ARTICLE_CONTENT_HINTS = ("entry-content", "article-content", "article__content", "article-body", "article_body", "usa-article-content", "wysiwyg", "rich-text", "story-body", "content-body")
ARTICLE_STOP_HEADINGS = {"share", "details", "related terms", "explore more", "discover more topics from nasa", "related content", "you may also like"}


class OfficialArticleParser(HTMLParser):
    """Extract metadata and readable blocks from official NASA/ESA pages."""

    def __init__(self) -> None:
        super().__init__(convert_charrefs=True)
        self.stack: list[tuple[str, bool, bool]] = []
        self.skip_depth = 0
        self.content_depth = 0
        self.current: list[Any] | None = None
        self.blocks: list[tuple[str, str]] = []
        self.meta: dict[str, str] = {}
        self.images: list[str] = []
        self.title_parts: list[str] = []
        self.in_title = False
        self.canonical = ""

    def handle_starttag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        tag = tag.lower()
        attributes = {str(key).lower(): (value or "") for key, value in attrs}
        classes = f"{attributes.get('class', '')} {attributes.get('id', '')}".lower()
        if tag == "meta":
            key = (attributes.get("property") or attributes.get("name") or "").lower()
            value = attributes.get("content", "").strip()
            if key and value:
                self.meta[key] = value
        if tag == "link" and "canonical" in attributes.get("rel", "").lower():
            self.canonical = attributes.get("href", "").strip()
        if tag == "title":
            self.in_title = True

        entered_skip = tag in ARTICLE_SKIP_TAGS
        entered_content = (tag in {"main", "article"} or any(hint in classes for hint in ARTICLE_CONTENT_HINTS)) and not self.skip_depth
        if tag not in ARTICLE_VOID_TAGS:
            self.stack.append((tag, entered_skip, entered_content))
        if entered_skip:
            self.skip_depth += 1
        if entered_content:
            self.content_depth += 1
        if tag == "img" and self.content_depth and not self.skip_depth:
            source = attributes.get("src") or attributes.get("data-src") or attributes.get("data-lazy-src")
            if source:
                self.images.append(source)
        if self.content_depth and not self.skip_depth and tag in {"h1", "h2", "h3", "p", "li", "blockquote"} and self.current is None:
            self.current = [tag, []]
        if self.current is not None and tag == "br":
            self.current[1].append(" ")

    def handle_startendtag(self, tag: str, attrs: list[tuple[str, str | None]]) -> None:
        self.handle_starttag(tag, attrs)
        self.handle_endtag(tag)

    def handle_data(self, data: str) -> None:
        if self.in_title:
            self.title_parts.append(data)
        if self.current is not None and not self.skip_depth:
            self.current[1].append(data)

    def handle_endtag(self, tag: str) -> None:
        tag = tag.lower()
        if tag == "title":
            self.in_title = False
        if self.current is not None and tag == self.current[0]:
            text = re.sub(r"\s+", " ", "".join(self.current[1])).strip()
            if text:
                self.blocks.append((tag, text))
            self.current = None
        index = next((i for i in range(len(self.stack) - 1, -1, -1) if self.stack[i][0] == tag), None)
        if index is not None:
            removed = self.stack[index:]
            self.stack = self.stack[:index]
            for _, entered_skip, entered_content in reversed(removed):
                if entered_content:
                    self.content_depth = max(0, self.content_depth - 1)
                if entered_skip:
                    self.skip_depth = max(0, self.skip_depth - 1)


def official_agency_from_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url)
    host = (parsed.hostname or "").lower().rstrip(".")
    if parsed.scheme != "https":
        raise ValueError("نشانی مقاله باید امن باشد.")
    if host == "nasa.gov" or host.endswith(".nasa.gov"):
        return "NASA"
    if host == "esa.int" or host.endswith(".esa.int"):
        return "ESA"
    raise ValueError("فقط مقاله‌های رسمی NASA و ESA پشتیبانی می‌شوند.")


def normalized_article_url(url: str) -> str:
    parsed = urllib.parse.urlparse(url.strip())
    return urllib.parse.urlunparse(parsed._replace(fragment="")).rstrip("/")


def find_cached_agency_item(url: str) -> dict[str, Any] | None:
    wanted = normalized_article_url(url)
    for agency in ("nasa", "esa"):
        for item in AGENCY_FEED_CACHE.get(agency, {}).get("items", []):
            if normalized_article_url(str(item.get("url", ""))) == wanted:
                return dict(item)
    try:
        payload = json.loads(AGENCY_FALLBACK_FILE.read_text(encoding="utf-8"))
        for item in payload.get("items", []):
            if normalized_article_url(str(item.get("url", ""))) == wanted:
                return dict(item)
    except Exception:
        pass
    return None


def iter_json_ld(value: Any):
    if isinstance(value, dict):
        yield value
        for nested in value.values():
            yield from iter_json_ld(nested)
    elif isinstance(value, list):
        for nested in value:
            yield from iter_json_ld(nested)


def article_image_from_value(value: Any) -> str:
    if isinstance(value, str):
        return value
    if isinstance(value, dict):
        return str(value.get("url") or value.get("contentUrl") or "")
    if isinstance(value, list):
        for item in value:
            image = article_image_from_value(item)
            if image:
                return image
    return ""


def clean_official_article_blocks(blocks: list[tuple[str, str]], title: str) -> list[dict[str, str]]:
    cleaned: list[dict[str, str]] = []
    seen: set[str] = set()
    paragraphs = 0
    headings = 0
    total_chars = 0
    title_key = re.sub(r"\W+", "", title.lower())
    for tag, raw_text in blocks:
        text = clean_feed_html(raw_text, 2200)
        key = re.sub(r"\W+", "", text.lower())
        lower = text.lower().strip(" :—-")
        if tag in {"h1", "h2", "h3"} and lower in ARTICLE_STOP_HEADINGS:
            break
        if lower.startswith(("thank you for liking", "you have already liked", "want to read more", "want to learn more", "this website uses cookies")):
            break
        if not text or key in seen or (title_key and key == title_key):
            continue
        if re.fullmatch(r"\d+\s*min(?:ute)?s? read", lower):
            continue
        kind = "heading" if tag in {"h2", "h3"} else "paragraph"
        if kind == "heading":
            if len(text) < 4 or len(text) > 180 or paragraphs < 1:
                continue
            headings += 1
            if headings > 6:
                continue
        else:
            if len(text) < 55:
                continue
            paragraphs += 1
            if paragraphs > 18:
                break
        seen.add(key)
        cleaned.append({"type": kind, "text": text})
        total_chars += len(text)
        if total_chars >= 16_000:
            break
    return cleaned


def article_key_points(paragraphs: list[str]) -> list[str]:
    sentences: list[dict[str, Any]] = []
    cursor = 0.0
    for paragraph in paragraphs:
        for sentence in re.split(r"(?<=[.!?])\s+", paragraph):
            clean = re.sub(r"\s+", " ", sentence).strip()
            if len(clean) >= 55:
                sentences.append({"text": clean[:700], "start": cursor, "duration": 12.0})
                cursor += 12.0
    if not sentences:
        return paragraphs[:4]
    summarized = summarize_segments(sentences, "en")
    return [item["text"] for item in summarized.get("bullets", [])[:5]]


def feed_level_article(url: str, fallback: dict[str, Any] | None, warning: str = "") -> dict[str, Any]:
    agency = official_agency_from_url(url)
    item = fallback or {}
    title = str(item.get("title") or "مطلب رسمی آژانس فضایی")
    summary = str(item.get("summary") or "جزئیات مقاله موقتاً قابل دریافت نیست؛ منبع رسمی را باز کنید.")
    return {
        "article_id": hashlib.sha256(url.encode("utf-8")).hexdigest()[:16],
        "agency": item.get("agency") or agency,
        "url": url,
        "canonical_url": url,
        "title": title,
        "title_fa": item.get("title_fa") or title,
        "published": item.get("published") or "",
        "author": "",
        "category": item.get("category") or "Official update",
        "image": item.get("image") or "",
        "summary": summary,
        "summary_fa": item.get("summary_fa") or summary,
        "blocks": [{"type": "paragraph", "text": summary, "text_fa": item.get("summary_fa") or summary}],
        "key_points": [summary],
        "key_points_fa": [item.get("summary_fa") or summary],
        "word_count": len(words(summary)),
        "reading_minutes": 1,
        "detail_level": "feed",
        "translated_to_fa": bool(item.get("summary_fa")),
        "translation_note": "جزئیات از خوراک رسمی نمایش داده شد؛ متن کامل در منبع رسمی در دسترس است.",
        "warning": warning,
        "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


def fetch_official_agency_article(url: str) -> dict[str, Any]:
    url = url.strip()
    if not url or len(url) > 2400:
        raise ValueError("نشانی مقاله معتبر نیست.")
    agency = official_agency_from_url(url)
    normalized = normalized_article_url(url)
    fallback = find_cached_agency_item(normalized)
    cached = AGENCY_ARTICLE_CACHE.get(normalized)
    if cached and time.time() - cached[0] < AGENCY_ARTICLE_CACHE_SECONDS:
        return {**cached[1], "cache": True}

    try:
        request = urllib.request.Request(normalized, headers={"User-Agent": USER_AGENT, "Accept": "text/html,application/xhtml+xml"})
        with urllib.request.urlopen(request, timeout=22) as response:
            final_url = response.geturl()
            official_agency_from_url(final_url)
            content_type = response.headers.get_content_type()
            if content_type not in {"text/html", "application/xhtml+xml"}:
                raise ValueError("پاسخ منبع رسمی، صفحه متنی نیست.")
            raw = response.read(4_000_001)
            if len(raw) > 4_000_000:
                raise ValueError("حجم صفحه رسمی بیش از حد مجاز است.")
            charset = response.headers.get_content_charset() or "utf-8"
        source = raw.decode(charset, errors="replace")
        parser = OfficialArticleParser()
        parser.feed(source)

        json_article: dict[str, Any] = {}
        for match in re.finditer(r"<script[^>]*type=[\"']application/ld\+json[\"'][^>]*>(.*?)</script>", source, flags=re.I | re.S):
            try:
                payload = json.loads(html_lib.unescape(match.group(1)).strip())
            except Exception:
                continue
            for candidate in iter_json_ld(payload):
                article_type = candidate.get("@type", "")
                types = article_type if isinstance(article_type, list) else [article_type]
                if any(str(value).lower() in {"article", "newsarticle", "blogposting", "report"} for value in types):
                    if len(candidate) > len(json_article):
                        json_article = candidate

        html_title = re.sub(r"\s+", " ", "".join(parser.title_parts)).strip()
        title = clean_feed_html(str(json_article.get("headline") or parser.meta.get("og:title") or (fallback or {}).get("title") or html_title), 320)
        for suffix in (" - NASA Science", " | NASA", " - NASA", " - ESA"):
            if title.endswith(suffix):
                title = title[:-len(suffix)].rstrip()
        summary = clean_feed_html(str(json_article.get("description") or parser.meta.get("og:description") or parser.meta.get("description") or (fallback or {}).get("summary") or ""), 1500)
        published = str(json_article.get("datePublished") or parser.meta.get("article:published_time") or (fallback or {}).get("published") or "")
        image = optimize_feed_image(article_image_from_value(json_article.get("image")) or parser.meta.get("og:image") or (fallback or {}).get("image") or (parser.images[0] if parser.images else "")) or ""
        category = str(json_article.get("articleSection") or (fallback or {}).get("category") or ("NASA News" if agency == "NASA" else "ESA Top News"))
        author_value = json_article.get("author") or json_article.get("creator") or ""
        author_names: list[str] = []
        for author in author_value if isinstance(author_value, list) else [author_value]:
            if isinstance(author, dict) and author.get("name"):
                author_names.append(str(author["name"]))
            elif isinstance(author, str) and author.strip():
                author_names.append(author.strip())
        author = "، ".join(dict.fromkeys(author_names))[:500]

        blocks = clean_official_article_blocks(parser.blocks, title)
        article_body = str(json_article.get("articleBody") or "").strip()
        if not blocks and article_body:
            blocks = [{"type": "paragraph", "text": part} for part in re.split(r"\n{2,}", article_body) if len(part.strip()) >= 55][:18]
        if not blocks:
            return feed_level_article(normalized, fallback, "ساختار صفحه رسمی قابل استخراج نبود.")

        paragraphs = [block["text"] for block in blocks if block["type"] == "paragraph"]
        key_points = article_key_points(paragraphs)
        translation_sources = [title, summary] + [block["text"] for block in blocks] + key_points
        translated, translated_to_fa, translation_note = translate_texts(translation_sources, "en")
        offset = 0
        title_fa = translated[offset] if translated else (fallback or {}).get("title_fa", title); offset += 1
        summary_fa = translated[offset] if len(translated) > offset else (fallback or {}).get("summary_fa", summary); offset += 1
        translated_blocks = translated[offset:offset + len(blocks)]; offset += len(blocks)
        translated_points = translated[offset:offset + len(key_points)]
        for index, block in enumerate(blocks):
            block["text_fa"] = translated_blocks[index] if index < len(translated_blocks) else block["text"]

        word_count = sum(len(words(paragraph)) for paragraph in paragraphs)
        result = {
            "article_id": hashlib.sha256(normalized.encode("utf-8")).hexdigest()[:16],
            "agency": agency,
            "url": normalized,
            "canonical_url": normalized_article_url(parser.canonical or final_url),
            "title": title,
            "title_fa": title_fa,
            "published": published,
            "author": author,
            "category": category,
            "image": image,
            "summary": summary or paragraphs[0],
            "summary_fa": summary_fa or (fallback or {}).get("summary_fa") or paragraphs[0],
            "blocks": blocks,
            "key_points": key_points,
            "key_points_fa": translated_points if len(translated_points) == len(key_points) else key_points,
            "word_count": word_count,
            "reading_minutes": max(1, math.ceil(word_count / 180)),
            "detail_level": "article",
            "translated_to_fa": translated_to_fa,
            "translation_note": translation_note,
            "warning": "",
            "fetched_at": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
        }
        AGENCY_ARTICLE_CACHE[normalized] = (time.time(), result)
        return result
    except ValueError:
        raise
    except Exception as exc:
        if fallback:
            return feed_level_article(normalized, fallback, f"دریافت جزئیات کامل موقتاً ممکن نبود ({type(exc).__name__}).")
        raise


def agency_article_api(params: dict[str, list[str]]) -> dict[str, Any]:
    url = params.get("url", [""])[0]
    return fetch_official_agency_article(url)


DEMO_TRANSCRIPT = [
    {"text": "رسیدن به مدار فقط به معنای بالا رفتن نیست؛ پرتابگر باید سرعت افقی کافی ایجاد کند.", "start": 0, "duration": 7},
    {"text": "پس از برخاست، موشک ابتدا تقریباً عمودی حرکت می‌کند تا از سازه و جو غلیظ فاصله بگیرد.", "start": 7, "duration": 7},
    {"text": "سپس برنامه هدایت، گردش گرانشی یا Gravity Turn را آغاز می‌کند و بردار سرعت به‌تدریج افقی می‌شود.", "start": 14, "duration": 8},
    {"text": "در نقطه Max Q حاصل‌ضرب چگالی هوا و مربع سرعت بیشینه است؛ بنابراین بار آیرودینامیکی اهمیت ویژه دارد.", "start": 22, "duration": 9},
    {"text": "با کاهش جو، فیرینگ جدا می‌شود چون دیگر حفاظت آیرودینامیکی محموله لازم نیست.", "start": 31, "duration": 7},
    {"text": "پس از خاموشی موتور مرحله اول، جدایش و روشن‌شدن مرحله دوم انجام می‌شود.", "start": 38, "duration": 7},
    {"text": "مرحله‌بندی جرم خشک مخازن و موتورهای مصرف‌شده را کنار می‌گذارد و نسبت جرمی مؤثر را بهتر می‌کند.", "start": 45, "duration": 9},
    {"text": "مرحله بالایی سرعت مداری را کامل می‌کند و ممکن است برای انتقال به مدار دیگر دوباره روشن شود.", "start": 54, "duration": 8},
    {"text": "برای مدار دایروی پایین زمین، سرعت تقریبی نزدیک هفت و هشت دهم کیلومتر بر ثانیه است.", "start": 62, "duration": 8},
    {"text": "پس از تزریق مداری، محموله جدا می‌شود، نخستین سیگنال دریافت می‌گردد و مرحله عملیات اولیه آغاز می‌شود.", "start": 70, "duration": 9},
]


def fetch_json(url: str, ttl: int = CACHE_SECONDS) -> Any:
    now = time.time()
    cached = CACHE.get(url)
    if cached and now - cached[0] < ttl:
        return cached[1]
    request = urllib.request.Request(url, headers={"User-Agent": USER_AGENT, "Accept": "application/json"})
    try:
        with urllib.request.urlopen(request, timeout=18) as response:
            data = json.loads(response.read().decode("utf-8"))
        CACHE[url] = (now, data)
        persist_cache()
        return data
    except (urllib.error.URLError, TimeoutError):
        # A stale, previously verified response is safer than an empty/broken
        # dashboard when the public upstream is throttled or briefly offline.
        if cached:
            return cached[1]
        raise


def normalize_launch(item: dict[str, Any]) -> dict[str, Any]:
    mission = item.get("mission") or {}
    orbit = mission.get("orbit") or {}
    rocket = (item.get("rocket") or {}).get("configuration") or {}
    provider = item.get("launch_service_provider") or {}
    pad = item.get("pad") or {}
    country = pad.get("country") or (pad.get("location") or {}).get("country") or {}
    status = item.get("status") or {}
    image = item.get("image") or {}
    return {
        "id": item.get("id"),
        "name": item.get("name") or "Unnamed mission",
        "name_fa": mission_name_fa(item.get("name") or "Unnamed mission", rocket.get("full_name") or rocket.get("name") or ""),
        "date": item.get("net"),
        "status": status.get("abbrev") or status.get("name") or "Unknown",
        "status_id": status.get("id"),
        "status_description": status.get("description"),
        "rocket": rocket.get("full_name") or rocket.get("name") or "—",
        "rocket_fa": ROCKET_FA.get(rocket.get("full_name") or rocket.get("name") or "", f"پرتابگر {rocket.get('full_name') or rocket.get('name') or 'نامشخص'}"),
        "provider": provider.get("name") or "—",
        "provider_fa": PROVIDER_FA.get(provider.get("name") or "", provider.get("name") or "نامشخص"),
        "mission_type": mission.get("type") or "Unknown",
        "mission_type_fa": MISSION_TYPE_FA.get(mission.get("type") or "Unknown", f"ماموریت {mission.get('type') or 'نامشخص'}"),
        "orbit": orbit.get("abbrev") or orbit.get("name") or "—",
        "orbit_fa": ORBIT_FA.get(orbit.get("abbrev") or orbit.get("name") or "—", orbit.get("name") or "نامشخص"),
        "pad": pad.get("name") or "—",
        "location": (pad.get("location") or {}).get("name") or "—",
        "country": country.get("name") or "—",
        "country_fa": COUNTRY_FA.get(country.get("name") or "", country.get("name") or "نامشخص"),
        "description": mission.get("description") or "No public mission description has been registered.",
        "description_fa": None,
        "image": image.get("thumbnail_url") or image.get("image_url"),
        "credit": image.get("credit"),
        "image_license": (image.get("license") or {}).get("name"),
        "image_license_url": (image.get("license") or {}).get("link"),
        "source_url": item.get("url"),
    }


def launches_api(params: dict[str, list[str]]) -> dict[str, Any]:
    limit = min(max(int(params.get("limit", ["12"])[0]), 1), 30)
    offset = max(int(params.get("offset", ["0"])[0]), 0)
    kind = params.get("kind", ["latest"])[0]
    status = "&status=4" if kind == "failures" else ""
    # A common 30-record upstream page lets dashboard and database requests
    # share one cached response instead of consuming the public API quota twice.
    upstream_limit = 30
    url = f"{LL2}/launches/previous/?limit={upstream_limit}&offset={offset}&ordering=-net{status}"
    data = fetch_json(url)
    normalized_all = [normalize_launch(x) for x in data.get("results", [])]
    normalized = normalized_all[:limit]
    count = data.get("count", 0)
    updated = time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime())
    response = {
        "count": count,
        "next_offset": offset + limit if offset + limit < count else None,
        "source": "Launch Library 2 / The Space Devs",
        "updated": updated,
        "results": normalized,
    }
    if offset == 0:
        try:
            fallback = {**response, "results": normalized_all, "next_offset": None, "offline_fallback": True}
            target = FAILURE_FALLBACK_FILE if kind == "failures" else LAUNCH_FALLBACK_FILE
            temporary = target.with_suffix(".tmp")
            temporary.write_text(json.dumps(fallback, ensure_ascii=False), encoding="utf-8")
            temporary.replace(target)
        except Exception:
            pass
    return response


def stats_api() -> dict[str, Any]:
    # Keep this endpoint to one upstream request. The total launch count comes
    # from /api/launches, which the dashboard already requests in parallel.
    fail_url = f"{LL2}/launches/previous/?limit=30&offset=0&ordering=-net&status=4"
    failed = fetch_json(fail_url)
    return {
        "catalogued_failures": failed.get("count", 0),
        "updated": time.strftime("%Y-%m-%dT%H:%M:%SZ", time.gmtime()),
    }


def satellites_api(params: dict[str, list[str]]) -> dict[str, Any]:
    allowed = {"stations", "weather", "gps-ops", "galileo", "starlink", "active", "last-30-days"}
    group = params.get("group", ["stations"])[0].lower()
    if group not in allowed:
        group = "stations"
    limit = min(max(int(params.get("limit", ["20"])[0]), 1), 100)
    url = f"https://celestrak.org/NORAD/elements/gp.php?GROUP={urllib.parse.quote(group)}&FORMAT=JSON"
    raw = fetch_json(url, ttl=7200)
    earth_radius = 6378.137
    mu = 398600.4418
    results = []
    for sat in raw[:limit]:
        mean_motion = float(sat.get("MEAN_MOTION") or 0)
        ecc = float(sat.get("ECCENTRICITY") or 0)
        if mean_motion:
            period_s = 86400 / mean_motion
            semi_major = (mu * (period_s / (2 * math.pi)) ** 2) ** (1 / 3)
            perigee = semi_major * (1 - ecc) - earth_radius
            apogee = semi_major * (1 + ecc) - earth_radius
        else:
            period_s = perigee = apogee = 0
        results.append({
            "name": sat.get("OBJECT_NAME"),
            "norad_id": sat.get("NORAD_CAT_ID"),
            "object_id": sat.get("OBJECT_ID"),
            "epoch": sat.get("EPOCH"),
            "inclination": sat.get("INCLINATION"),
            "eccentricity": ecc,
            "period_minutes": round(period_s / 60, 2),
            "perigee_km": round(perigee, 1),
            "apogee_km": round(apogee, 1),
        })
    return {"group": group, "count": len(raw), "results": results, "source": "CelesTrak GP/OMM"}


def video_id_from_url(value: str) -> str | None:
    value = value.strip()
    if re.fullmatch(r"[A-Za-z0-9_-]{11}", value):
        return value
    patterns = [r"youtu\.be/([A-Za-z0-9_-]{11})", r"[?&]v=([A-Za-z0-9_-]{11})", r"shorts/([A-Za-z0-9_-]{11})", r"embed/([A-Za-z0-9_-]{11})"]
    for pattern in patterns:
        match = re.search(pattern, value)
        if match:
            return match.group(1)
    return None


def transcript_segments(video_id: str) -> tuple[list[dict[str, Any]], str, str]:
    try:
        from youtube_transcript_api import YouTubeTranscriptApi
    except ImportError as exc:
        raise RuntimeError("بسته youtube-transcript-api نصب نیست. دستور pip install -r requirements.txt را اجرا کنید.") from exc

    api = YouTubeTranscriptApi()
    listing = api.list(video_id)
    available = list(listing)
    if not available:
        raise RuntimeError("برای این ویدئو زیرنویس قابل دریافت پیدا نشد.")

    chosen = next((t for t in available if t.language_code.startswith("fa")), None)
    chosen = chosen or next((t for t in available if t.language_code.startswith("en") and not t.is_generated), None)
    chosen = chosen or next((t for t in available if t.language_code.startswith("en")), None)
    chosen = chosen or available[0]
    fetched = chosen.fetch()
    segments = [{"text": x.text, "start": float(x.start), "duration": float(x.duration)} for x in fetched]
    return segments, chosen.language_code, chosen.language


def timestamp_to_seconds(value: str) -> float:
    parts = [int(part) for part in value.split(":")]
    if len(parts) == 2:
        return float(parts[0] * 60 + parts[1])
    if len(parts) == 3:
        return float(parts[0] * 3600 + parts[1] * 60 + parts[2])
    raise ValueError("قالب زمان زیرنویس معتبر نیست.")


def manual_transcript_segments(raw_text: str) -> list[dict[str, Any]]:
    """Parse copied YouTube transcript text, with or without timestamps."""
    text = raw_text.replace("\r\n", "\n").replace("\r", "\n").strip()
    if len(text) < 80:
        raise ValueError("متن زیرنویس خیلی کوتاه است؛ دست‌کم چند جمله کامل وارد کنید.")
    if len(text) > 160_000:
        raise ValueError("متن زیرنویس بیش از حد بزرگ است؛ حداکثر ۱۶۰ هزار نویسه پذیرفته می‌شود.")

    timestamp_pattern = re.compile(r"^\[?((?:\d{1,2}:)?\d{1,2}:\d{2})\]?\s*$")
    inline_pattern = re.compile(r"^\[?((?:\d{1,2}:)?\d{1,2}:\d{2})\]?\s+(.+)$")
    parsed: list[dict[str, Any]] = []
    current_start: float | None = None
    current_lines: list[str] = []
    saw_timestamp = False

    def flush() -> None:
        nonlocal current_lines
        clean = re.sub(r"\s+", " ", " ".join(current_lines)).strip()
        if clean and current_start is not None:
            parsed.append({"text": clean, "start": current_start, "duration": 0.0})
        current_lines = []

    for raw_line in text.split("\n"):
        line = raw_line.strip()
        if not line:
            continue
        timestamp_match = timestamp_pattern.fullmatch(line)
        inline_match = inline_pattern.match(line)
        if timestamp_match:
            flush()
            current_start = timestamp_to_seconds(timestamp_match.group(1))
            saw_timestamp = True
            continue
        if inline_match:
            flush()
            current_start = timestamp_to_seconds(inline_match.group(1))
            current_lines = [inline_match.group(2)]
            saw_timestamp = True
            continue
        if current_start is not None:
            current_lines.append(line)
    flush()

    if saw_timestamp and parsed:
        for index, segment in enumerate(parsed):
            if index + 1 < len(parsed):
                gap = parsed[index + 1]["start"] - segment["start"]
                segment["duration"] = max(1.0, min(float(gap), 45.0))
            else:
                segment["duration"] = max(3.0, min(len(words(segment["text"])) / 2.3, 30.0))
        return parsed[:5000]

    # Text without timestamps: split it into readable sentence groups and
    # synthesize approximate timing solely for chapter ordering.
    pieces = [
        re.sub(r"\s+", " ", piece).strip()
        for piece in re.split(r"(?<=[.!?؟])\s+|\n+", text)
        if piece.strip()
    ]
    groups: list[str] = []
    bucket = ""
    for piece in pieces:
        candidate = f"{bucket} {piece}".strip()
        if bucket and len(candidate) > 420:
            groups.append(bucket)
            bucket = piece
        else:
            bucket = candidate
    if bucket:
        groups.append(bucket)
    if not groups:
        groups = [text]

    start = 0.0
    generated: list[dict[str, Any]] = []
    for group in groups[:5000]:
        duration = max(4.0, min(len(words(group)) / 2.3, 45.0))
        generated.append({"text": group, "start": round(start, 2), "duration": round(duration, 2)})
        start += duration
    return generated


def detect_transcript_language(text: str) -> tuple[str, str]:
    persian = len(re.findall(r"[\u0600-\u06ff]", text))
    latin = len(re.findall(r"[A-Za-z]", text))
    if persian > latin * 0.35:
        return "fa", "Persian"
    return "en", "English"


def words(text: str) -> list[str]:
    return re.findall(r"[\w\-]+", text.lower(), flags=re.UNICODE)


def summarize_segments(segments: list[dict[str, Any]], language_code: str) -> dict[str, Any]:
    groups: list[dict[str, Any]] = []
    bucket: list[str] = []
    bucket_start = 0.0
    for idx, seg in enumerate(segments):
        if not bucket:
            bucket_start = float(seg.get("start", 0))
        clean = re.sub(r"\s+", " ", str(seg.get("text", ""))).strip()
        if clean:
            bucket.append(clean)
        if len(bucket) >= 4 or (bucket and re.search(r"[.!?؟]$", clean)) or idx == len(segments) - 1:
            text = " ".join(bucket)
            if len(text) > 40:
                groups.append({"text": text, "start": bucket_start})
            bucket = []

    full_text = " ".join(g["text"] for g in groups)
    stop = FA_STOP if language_code.startswith("fa") else EN_STOP
    candidates = [w for w in words(full_text) if len(w) > 2 and w not in stop and not w.isdigit()]
    freq = Counter(candidates)
    max_freq = max(freq.values(), default=1)
    normalized = {w: c / max_freq for w, c in freq.items()}

    scored = []
    total = max(len(groups), 1)
    for idx, group in enumerate(groups):
        ws = [w for w in words(group["text"]) if w in normalized]
        lexical = sum(normalized[w] for w in ws) / max(math.sqrt(len(ws)), 1)
        position_bonus = 0.25 if idx < total * 0.18 else 0
        length_penalty = 0.65 if len(group["text"]) > 650 else 1
        scored.append((lexical * length_penalty + position_bonus, idx, group))

    selected = sorted(scored, reverse=True)[: min(8, len(scored))]
    selected = [x[2] for x in sorted(selected, key=lambda x: x[1])]
    top_terms = [w for w, _ in freq.most_common(12)]
    technical = []
    lower = full_text.lower()
    for term, definition in TECH_TERMS.items():
        if term in lower:
            technical.append({"term": term, "definition": definition})

    duration = 0.0
    if segments:
        duration = float(segments[-1].get("start", 0)) + float(segments[-1].get("duration", 0))
    chapters = []
    if groups:
        chapter_count = min(5, max(3, round(duration / 420) + 2))
        for i in range(chapter_count):
            target = duration * i / chapter_count
            nearest = min(groups, key=lambda g: abs(g["start"] - target))
            chapter_words = words(nearest["text"])
            chapters.append({"start": round(nearest["start"]), "title": " ".join(chapter_words[:9])})

    return {
        "bullets": selected,
        "keywords": top_terms,
        "technical_terms": technical[:8],
        "chapters": chapters,
        "duration_seconds": round(duration),
        "word_count": len(words(full_text)),
    }


def group_transcript_segments(segments: list[dict[str, Any]], max_chars: int = 680, max_seconds: float = 55.0) -> list[dict[str, Any]]:
    """Combine short caption fragments into contextual, readable paragraphs."""
    grouped: list[dict[str, Any]] = []
    texts: list[str] = []
    start = 0.0
    end = 0.0

    def flush() -> None:
        nonlocal texts, start, end
        text = re.sub(r"\s+", " ", " ".join(texts)).strip()
        if text:
            grouped.append({"text": text, "start": round(start, 2), "duration": round(max(end - start, 1.0), 2)})
        texts = []

    previous_text = ""
    for segment in segments:
        clean = html_lib.unescape(re.sub(r"\s+", " ", str(segment.get("text", "")))).strip()
        if not clean or clean == previous_text:
            continue
        segment_start = float(segment.get("start", 0))
        segment_end = segment_start + float(segment.get("duration", 0) or 0)
        candidate = f"{' '.join(texts)} {clean}".strip()
        elapsed = segment_end - start if texts else 0
        if texts and (len(candidate) > max_chars or elapsed > max_seconds):
            flush()
        if not texts:
            start = segment_start
        texts.append(clean)
        end = segment_end
        previous_text = clean
        if len(" ".join(texts)) >= 280 and re.search(r"[.!?؟]$", clean):
            flush()
    flush()
    return grouped


AEROSPACE_TRANSLATION_RULES: list[tuple[str, str, tuple[str, ...]]] = [
    ("guidance, navigation and control", "هدایت، ناوبری و کنترل", ("هدایت، ناوبری و کنترل", "راهنمایی، ناوبری و کنترل")),
    ("attitude determination and control system", "سامانه تعیین و کنترل وضعیت", ("سیستم تعیین و کنترل نگرش", "سامانه تعیین و کنترل نگرش", "سیستم تعیین و کنترل وضعیت")),
    ("sun-synchronous orbit", "مدار خورشیدآهنگ", ("مدار همگام خورشیدی", "مدار خورشیدی همگام", "مدار خورشید همگام")),
    ("geostationary orbit", "مدار زمین‌ایستا", ("مدار زمین ثابت", "مدار زمین‌ثابت", "مدار ثابت زمین", "مدار ژئواستاتیک")),
    ("low earth orbit", "مدار پایین زمین", ("مدار پایین زمینی", "مدار پایین کره زمین", "مدار کم ارتفاع زمین")),
    ("medium earth orbit", "مدار میانی زمین", ("مدار متوسط زمین", "مدار میانی زمینی")),
    ("orbital mechanics", "مکانیک مداری", ("مکانیک مدار",)),
    ("orbital period", "دوره مداری", ("دورهٔ مداری", "دوره مدار")),
    ("orbital insertion", "تزریق مداری", ("درج مداری", "ورود مداری", "تزریق به مدار")),
    ("launch vehicle", "پرتابگر", ("وسیله نقلیه پرتاب", "وسیلهٔ نقلیهٔ پرتاب", "وسیله پرتاب", "خودروی پرتاب")),
    ("stage separation", "جدایش مرحله", ("جداسازی مرحله", "تفکیک مرحله")),
    ("specific impulse", "تکانه ویژه", ("ضربه خاص", "تکانه خاص", "ضربه ویژه")),
    ("reaction wheels", "چرخ‌های عکس‌العملی", ("چرخ های واکنش", "چرخ‌های واکنش", "چرخ های عکس العمل", "چرخ‌های عکس‌العمل")),
    ("reaction wheel", "چرخ عکس‌العملی", ("چرخ واکنش", "چرخ عکس العمل", "چرخ عکس‌العمل")),
    ("star trackers", "دوربین‌های ستاره‌ای", ("ردیاب های ستاره", "ردیاب‌های ستاره", "ردیاب ستاره")),
    ("star tracker", "دوربین ستاره‌ای", ("ردیاب ستاره", "ردیاب ستاره‌ای")),
    ("attitude control", "کنترل وضعیت", ("کنترل نگرش", "کنترل حالت")),
    ("attitude determination", "تعیین وضعیت", ("تعیین نگرش", "تشخیص نگرش")),
    ("station keeping", "نگهداری مداری", ("نگه داشتن ایستگاه", "حفظ ایستگاه", "ایستگاه داری", "ایستگاه‌داری")),
    ("earth observation", "رصد زمین", ("مشاهده زمین", "مشاهدۀ زمین", "مشاهدهٔ زمین")),
    ("eclipse", "عبور از سایه", ("کسوف", "گرفتگی", "سایه گرفتگی")),
    ("remote sensing", "سنجش‌ازدور", ("سنجش از دور",)),
    ("ground station", "ایستگاه زمینی", ("ایستگاه زمین",)),
    ("thermal control", "کنترل حرارتی", ("کنترل گرمایی", "کنترل حرارت")),
    ("power system", "سامانه توان", ("سیستم قدرت", "سیستم توان")),
    ("telemetry", "تله‌متری", ("تله متری", "دورسنجی")),
    ("downlink", "پیوند پایین‌رو", ("از طریق لینک پایین ارسال", "با لینک پایین ارسال", "لینک پایین", "پیوند رو به پایین")),
    ("downlink data", "ارسال داده از طریق پیوند پایین‌رو", ("داده را متصل", "داده‌ها را متصل", "داده را پایین می‌فرستد")),
    ("uplink", "پیوند بالارو", ("لینک بالا", "پیوند رو به بالا")),
    ("payload fairing", "فیرینگ محموله", ("نمایشگاه محموله", "پوشش بار", "پوشش محموله")),
    ("delta-v", "دلتاوی", ("دلتا وی", "دلتا-v", "دلتا V")),
    ("inclination", "میل مداری", ("شیب مداری", "تمایل مداری", "شیب", "تمایل")),
    ("propellant", "مادهٔ پیشران", ("سوخت پیشران", "پیشراننده", "سوخت موشک")),
    ("spacecraft", "فضاپیما", ("سفینه فضایی", "فضاپیمای فضایی")),
    ("apogee", "اوج مداری", ("آپوجی", "اوج مدار")),
    ("perigee", "حضیض مداری", ("پریجی", "حضیض مدار")),
    ("system", "سامانه", ("سیستم",)),
    ("power", "توان", ("قدرت",)),
]


def refine_persian_translation(source_text: str, translated_text: str) -> str:
    """Normalize Persian prose and enforce a small aerospace terminology guide."""
    text = html_lib.unescape(str(translated_text)).translate(str.maketrans({"ي": "ی", "ى": "ی", "ك": "ک"}))
    source_lower = source_text.lower()
    for source_term, canonical, variants in AEROSPACE_TRANSLATION_RULES:
        if re.search(rf"(?<![a-z0-9]){re.escape(source_term)}(?![a-z0-9])", source_lower):
            for variant in sorted(variants, key=len, reverse=True):
                text = re.sub(
                    rf"(?<!\w){re.escape(variant)}(?!\w)",
                    canonical,
                    text,
                    flags=re.IGNORECASE,
                )

    spelling = {
        "ماموریت": "مأموریت", "ماموریت‌ها": "مأموریت‌ها", "تاخیر": "تأخیر",
        "تاثیر": "تأثیر", "تایید": "تأیید", "مساله": "مسئله",
        "نسبتا": "نسبتاً", "دقیقا": "دقیقاً", "تقریبا": "تقریباً",
        "کاملا": "کاملاً", "معمولا": "معمولاً", "احتمالا": "احتمالاً",
    }
    for wrong, correct in spelling.items():
        optional_tanwin = "ً?" if correct.endswith("ً") else ""
        text = re.sub(rf"(?<!\w){re.escape(wrong)}{optional_tanwin}(?!\w)", correct, text)

    if re.search(r"(?<![a-z0-9])downlink(?![a-z0-9])", source_lower):
        text = re.sub(r"متصل\s+(می[‌ ]?[\u0600-\u06ff]+)", r"از طریق پیوند پایین‌رو ارسال \1", text)
        text = re.sub(r"پایین\s+می[‌ ]?فرستند", "از طریق پیوند پایین‌رو ارسال می‌کنند", text)
        text = re.sub(r"پایین\s+می[‌ ]?فرستد", "از طریق پیوند پایین‌رو ارسال می‌کند", text)
        text = re.sub(
            r"(داده(?:‌های)?[^.،؛]{0,120}) را به (ایستگاه زمینی) از طریق پیوند پایین‌رو ارسال (می[‌ ]?[\u0600-\u06ff]+)",
            r"\1 را از طریق پیوند پایین‌رو به \2 ارسال \3",
            text,
        )

    verbs = "کند|کنند|کرد|کرده|شود|شوند|شد|شده|رود|روند|رفت|ماند|مانند|باشد|باشند|تواند|توانند|گیرد|گیرند|دهد|دهند|آید|آیند|رسد|رسند"
    text = re.sub(rf"\b(ن?می)\s+({verbs})\b", lambda match: f"{match.group(1)}\u200c{match.group(2)}", text)
    text = re.sub(r"([\u0600-\u06ff]+)\s+(ها|های)\b", r"\1‌\2", text)
    text = re.sub(r"\bبه\s+طور\b", "به‌طور", text)
    text = re.sub(r"\bهم\s+زمان\b", "هم‌زمان", text)
    text = re.sub(r"\s+([،؛:,.!?؟])", r"\1", text)
    text = re.sub(r"([،؛])(?=\S)", r"\1 ", text)
    return re.sub(r"\s+", " ", text).strip()


def translate_texts(texts: list[str], source_lang: str) -> tuple[list[str], bool, str | None]:
    if source_lang.startswith("fa"):
        return [refine_persian_translation(text, text) for text in texts], False, None
    try:
        translated = translate_texts_remote(texts, "fa", "en" if source_lang.startswith("en") else "auto")
        changed = any(a != b for a, b in zip(texts, translated))
        if changed:
            translated = [refine_persian_translation(source, target) for source, target in zip(texts, translated)]
            return translated, True, "ترجمه فارسی با حفظ بافت جمله، اصلاح نگارشی و واژه‌نامه تخصصی هوافضا آماده شد؛ برای نقل‌قول حساس با متن اصلی مقابله شود."
        return translated, False, "ترجمه خودکار تغییری در متن ایجاد نکرد."
    except Exception as exc:  # Translation is an enhancement; source summary remains useful.
        return texts, False, f"ترجمه خودکار در دسترس نبود؛ خلاصه به زبان زیرنویس نمایش داده شد. ({type(exc).__name__})"


def youtube_api(payload: dict[str, Any]) -> dict[str, Any]:
    raw_url = str(payload.get("url", "")).strip()
    manual_text = str(payload.get("transcript_text", "")).strip()
    is_manual = bool(manual_text)
    is_demo = raw_url == "demo" and not is_manual

    if is_demo:
        video_id = "demo-launch"
        segments, lang_code, lang_name = DEMO_TRANSCRIPT, "fa", "Persian"
        title = "چگونه یک پرتابگر ماهواره را در مدار قرار می‌دهد؟"
        author = "نمونه آموزشی مدار"
        thumbnail = "/images/stages/stage-6.svg"
    elif is_manual:
        segments = manual_transcript_segments(manual_text)
        requested_language = str(payload.get("source_language", "auto")).lower()
        if requested_language == "fa":
            lang_code, lang_name = "fa", "Persian"
        elif requested_language == "en":
            lang_code, lang_name = "en", "English"
        else:
            lang_code, lang_name = detect_transcript_language(manual_text)
        video_id = video_id_from_url(raw_url) if raw_url else None
        title = str(payload.get("title", "")).strip()[:300] or "متن واردشده توسط کاربر"
        author = "ورودی دستی زیرنویس"
        thumbnail = ""
        if video_id:
            thumbnail = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
            try:
                oembed = fetch_json(f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json", ttl=86400)
                title = oembed.get("title", title)
                author = oembed.get("author_name", author)
                thumbnail = oembed.get("thumbnail_url", thumbnail)
            except Exception:
                pass
        video_id = video_id or "manual-transcript"
    else:
        video_id = video_id_from_url(raw_url)
        if not video_id:
            raise ValueError("لینک معتبر YouTube یا شناسه ۱۱ حرفی ویدئو را وارد کنید.")
        segments, lang_code, lang_name = transcript_segments(video_id)
        title, author = "ویدئوی YouTube", "—"
        thumbnail = f"https://i.ytimg.com/vi/{video_id}/hqdefault.jpg"
        try:
            oembed = fetch_json(f"https://www.youtube.com/oembed?url=https://www.youtube.com/watch?v={video_id}&format=json", ttl=86400)
            title = oembed.get("title", title)
            author = oembed.get("author_name", author)
            thumbnail = oembed.get("thumbnail_url", thumbnail)
        except Exception:
            pass

    source_summary = summarize_segments(segments, lang_code)
    summary = {
        **source_summary,
        "bullets": [dict(item) for item in source_summary["bullets"]],
        "chapters": [dict(item) for item in source_summary["chapters"]],
        "technical_terms": [dict(item) for item in source_summary["technical_terms"]],
    }

    source_bullets = [item["text"] for item in source_summary["bullets"]]
    source_chapters = [item["title"] for item in source_summary["chapters"]]
    display_segments = group_transcript_segments(segments)
    source_transcript = [item["text"] for item in display_segments]
    translated_all, translated, translation_note = translate_texts(
        source_bullets + source_chapters + source_transcript,
        lang_code,
    )
    bullet_end = len(source_bullets)
    chapter_end = bullet_end + len(source_chapters)
    translated_bullets = translated_all[:bullet_end]
    translated_chapters = translated_all[bullet_end:chapter_end]
    translated_transcript = translated_all[chapter_end:]

    for bullet, text in zip(summary["bullets"], translated_bullets):
        bullet["text"] = text
    for chapter, text in zip(summary["chapters"], translated_chapters):
        chapter["title"] = text

    transcript_fa = [
        {**segment, "text": translated_text}
        for segment, translated_text in zip(display_segments, translated_transcript)
    ]
    if len(transcript_fa) < len(display_segments):
        transcript_fa.extend(dict(segment) for segment in display_segments[len(transcript_fa):])

    return {
        "video_id": video_id,
        "title": title,
        "author": author,
        "thumbnail": thumbnail,
        "language": lang_name,
        "language_code": lang_code,
        "translated_to_fa": translated,
        "translation_note": translation_note,
        "input_mode": "demo" if is_demo else "manual" if is_manual else "youtube",
        "summary": summary,
        "source_summary": source_summary,
        "transcript_original": display_segments,
        "transcript_fa": transcript_fa,
        "transcript_preview": display_segments[:12],
        "translation_method": "contextual-aerospace-v2",
        "method_note": "خلاصه با امتیازدهی واژگانی و ساختاری تولید شده است؛ برای تصمیم فنی حساس به ویدئو و منابع اصلی مراجعه کنید.",
    }


def youtube_error_response(exc: Exception) -> dict[str, Any]:
    error_name = type(exc).__name__
    detail = str(exc)
    lowered = f"{error_name} {detail}".lower()
    if "requestblocked" in lowered or "ipblocked" in lowered or "blocking requests from your ip" in lowered:
        return {
            "error": "یوتیوب درخواست دریافت زیرنویس از نشانی این کارساز را مسدود کرده است.",
            "code": "youtube_ip_blocked",
            "detail": "از مسیر جایگزین پایین صفحه، متن زیرنویس را وارد کنید تا ترجمه و خلاصه‌سازی ادامه یابد.",
        }
    if "transcriptsdisabled" in lowered:
        return {
            "error": "زیرنویس این ویدئو غیرفعال است.",
            "code": "transcripts_disabled",
            "detail": "ویدئوی دیگری انتخاب کنید یا متن آماده را در مسیر جایگزین وارد کنید.",
        }
    if "notranscriptfound" in lowered or "no transcript" in lowered:
        return {
            "error": "برای این ویدئو زیرنویس قابل دریافت پیدا نشد.",
            "code": "transcript_not_found",
            "detail": "زبان‌های زیرنویس و عمومی‌بودن ویدئو را بررسی کنید یا متن را دستی وارد کنید.",
        }
    if "age" in lowered and "restrict" in lowered:
        return {
            "error": "ویدئو محدودیت سنی یا ورود به حساب دارد.",
            "code": "video_restricted",
            "detail": "دریافت خودکار برای ویدئوهای محدود ممکن نیست؛ از متن زیرنویس استفاده کنید.",
        }
    if "videounavailable" in lowered or "unavailable" in lowered:
        return {
            "error": "ویدئو عمومی یا در دسترس نیست.",
            "code": "video_unavailable",
            "detail": "نشانی ویدئو را بررسی کنید یا متن زیرنویس را وارد کنید.",
        }
    return {
        "error": "خلاصه‌سازی خودکار انجام نشد.",
        "code": "youtube_transcript_error",
        "detail": "ویدئو باید عمومی و دارای زیرنویس باشد؛ در صورت ادامه خطا از ورود متن استفاده کنید.",
    }


class MadarHandler(SimpleHTTPRequestHandler):
    server_version = "Madar/0.18-experimental"

    def __init__(self, *args: Any, **kwargs: Any) -> None:
        super().__init__(*args, directory=str(PUBLIC), **kwargs)

    def log_message(self, fmt: str, *args: Any) -> None:
        print(f"[{self.log_date_time_string()}] {fmt % args}")

    def send_json(self, data: Any, status: int = 200) -> None:
        body = json.dumps(data, ensure_ascii=False).encode("utf-8")
        self.send_response(status)
        self.send_header("Content-Type", "application/json; charset=utf-8")
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "no-store")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def send_remote_image(self, image_url: str) -> None:
        parsed_url = urllib.parse.urlparse(image_url)
        if parsed_url.scheme != "https" or parsed_url.hostname not in IMAGE_HOSTS:
            self.send_json({"error": "منبع تصویر مجاز نیست."}, HTTPStatus.BAD_REQUEST)
            return
        cached = IMAGE_CACHE.get(image_url)
        if cached and time.time() - cached[0] < 3600:
            body, content_type = cached[1], cached[2]
        else:
            request = urllib.request.Request(image_url, headers={"User-Agent": USER_AGENT, "Accept": "image/avif,image/webp,image/*"})
            with urllib.request.urlopen(request, timeout=18) as response:
                content_type = response.headers.get_content_type()
                if not content_type.startswith("image/"):
                    raise ValueError("پاسخ منبع، تصویر نیست.")
                body = response.read(8_000_001)
                if len(body) > 8_000_000:
                    raise ValueError("حجم تصویر بیش از حد مجاز است.")
            IMAGE_CACHE[image_url] = (time.time(), body, content_type)
        self.send_response(HTTPStatus.OK)
        self.send_header("Content-Type", content_type)
        self.send_header("Content-Length", str(len(body)))
        self.send_header("Cache-Control", "public, max-age=3600")
        self.send_header("X-Content-Type-Options", "nosniff")
        self.end_headers()
        try:
            self.wfile.write(body)
        except (BrokenPipeError, ConnectionResetError):
            pass

    def do_GET(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        params = urllib.parse.parse_qs(parsed.query)
        try:
            if parsed.path == "/api/image":
                image_url = params.get("url", [""])[0]
                self.send_remote_image(image_url)
                return
            if parsed.path == "/api/health":
                self.send_json({"ok": True, "service": "madar", "time": time.time()})
                return
            if parsed.path == "/api/launches":
                self.send_json(launches_api(params))
                return
            if parsed.path == "/api/agency-feed":
                self.send_json(agency_feed_api(params))
                return
            if parsed.path == "/api/agency-article":
                self.send_json(agency_article_api(params))
                return
            if parsed.path == "/api/stats":
                self.send_json(stats_api())
                return
            if parsed.path == "/api/satellites":
                self.send_json(satellites_api(params))
                return
            super().do_GET()
        except ValueError as exc:
            self.send_json({"error": str(exc), "code": "invalid_input"}, HTTPStatus.BAD_REQUEST)
        except (urllib.error.URLError, TimeoutError) as exc:
            self.send_json({"error": "منبع زنده موقتاً پاسخ نداد.", "detail": str(exc)}, HTTPStatus.BAD_GATEWAY)
        except Exception as exc:
            self.send_json({"error": "پردازش درخواست ناموفق بود.", "detail": str(exc)}, HTTPStatus.INTERNAL_SERVER_ERROR)

    def do_POST(self) -> None:
        parsed = urllib.parse.urlparse(self.path)
        if parsed.path not in {"/api/youtube-summary", "/api/translate"}:
            self.send_json({"error": "مسیر پیدا نشد."}, HTTPStatus.NOT_FOUND)
            return
        try:
            length = int(self.headers.get("Content-Length", "0"))
            maximum = 600_000 if parsed.path == "/api/youtube-summary" else 80_000
            if length > maximum:
                raise ValueError("درخواست بیش از حد بزرگ است.")
            payload = json.loads(self.rfile.read(length).decode("utf-8") or "{}")
            if parsed.path == "/api/translate":
                texts = payload.get("texts")
                if not isinstance(texts, list) or len(texts) > 180:
                    raise ValueError("فهرست ترجمه معتبر نیست یا بیش از حد بزرگ است.")
                target = str(payload.get("target", "fa"))
                source = str(payload.get("source", "auto"))
                translated = translate_texts_remote([str(x) for x in texts], target, source)
                self.send_json({"translations": translated, "target": target, "automatic": True})
            else:
                self.send_json(youtube_api(payload))
        except ValueError as exc:
            self.send_json({"error": str(exc), "code": "invalid_input"}, HTTPStatus.BAD_REQUEST)
        except Exception as exc:
            if parsed.path == "/api/translate":
                self.send_json({"error": "ترجمه خودکار موقتاً در دسترس نیست.", "detail": str(exc)}, HTTPStatus.BAD_GATEWAY)
                return
            self.send_json(youtube_error_response(exc), HTTPStatus.BAD_GATEWAY)


def main() -> None:
    server = ThreadingHTTPServer(("0.0.0.0", PORT), MadarHandler)
    print(f"Madar is running on http://0.0.0.0:{PORT}")
    try:
        server.serve_forever()
    except KeyboardInterrupt:
        pass
    finally:
        server.server_close()


if __name__ == "__main__":
    main()
