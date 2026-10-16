#!/data/data/com.termux/files/usr/bin/bash
set -e
DEST="$HOME/madar"
PIDFILE="$DEST/madar.pid"
LOGFILE="$DEST/madar.log"
PORT=8000

cd "$DEST"
command -v termux-wake-lock >/dev/null 2>&1 && termux-wake-lock || true

if [ -f "$PIDFILE" ]; then
  OLD_PID="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [ -n "$OLD_PID" ] && kill -0 "$OLD_PID" 2>/dev/null; then
    termux-open-url "http://127.0.0.1:$PORT/#dashboard"
    exit 0
  fi
fi

nohup env PORT="$PORT" python -u app.py >"$LOGFILE" 2>&1 &
echo $! > "$PIDFILE"
sleep 2

if kill -0 "$(cat "$PIDFILE")" 2>/dev/null; then
  echo "مدار فعال شد: http://127.0.0.1:$PORT"
  termux-open-url "http://127.0.0.1:$PORT/#dashboard"
else
  echo "اجرای مدار ناموفق بود. گزارش:"
  tail -30 "$LOGFILE"
  exit 1
fi
