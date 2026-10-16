#!/data/data/com.termux/files/usr/bin/bash
DEST="$HOME/madar"
PIDFILE="$DEST/madar.pid"
if [ -f "$PIDFILE" ]; then
  PID="$(cat "$PIDFILE" 2>/dev/null || true)"
  if [ -n "$PID" ] && kill -0 "$PID" 2>/dev/null; then
    kill "$PID" 2>/dev/null || true
    echo "مدار متوقف شد."
  else
    echo "مدار در حال اجرا نبود."
  fi
  rm -f "$PIDFILE"
else
  echo "مدار در حال اجرا نبود."
fi
command -v termux-wake-unlock >/dev/null 2>&1 && termux-wake-unlock || true
