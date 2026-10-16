#!/usr/bin/env python3
"""One-tap Android launcher for Pydroid 3."""
from __future__ import annotations

import os
import sys
import threading
import time
import webbrowser
from pathlib import Path

ROOT = Path(__file__).resolve().parent
os.chdir(ROOT)
sys.path.insert(0, str(ROOT))
os.environ.setdefault("PORT", "8000")


def open_madar() -> None:
    time.sleep(2.0)
    url = "http://127.0.0.1:8000/#dashboard"
    try:
        webbrowser.open(url, new=1)
    except Exception:
        print("مرورگر خودکار باز نشد. این نشانی را در مرورگر باز کنید:")
        print(url)


if __name__ == "__main__":
    threading.Thread(target=open_madar, daemon=True).start()
    from app import main
    main()
