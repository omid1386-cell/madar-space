#!/data/data/com.termux/files/usr/bin/bash
set -e

GREEN='\033[1;32m'; YELLOW='\033[1;33m'; RESET='\033[0m'
SOURCE_DIR="$(cd "$(dirname "$0")/.." && pwd)"
DEST="$HOME/madar"

echo -e "${GREEN}مدار — نصب نسخه اندروید${RESET}"
echo "۱/۴ نصب Python در Termux…"
pkg update -y
pkg install -y python

echo "۲/۴ انتقال فایل‌های مدار…"
rm -rf "$DEST"
mkdir -p "$DEST"
cp "$SOURCE_DIR/app.py" "$SOURCE_DIR/requirements.txt" "$DEST/"
cp -R "$SOURCE_DIR/public" "$SOURCE_DIR/vendor" "$DEST/"
cp "$SOURCE_DIR/android/start-madar.sh" "$SOURCE_DIR/android/stop-madar.sh" "$DEST/"
chmod +x "$DEST/start-madar.sh" "$DEST/stop-madar.sh"

echo "۳/۴ ساخت میان‌بر اختیاری Termux:Widget…"
mkdir -p "$HOME/.shortcuts"
cat > "$HOME/.shortcuts/Madar" <<'EOF'
#!/data/data/com.termux/files/usr/bin/bash
bash "$HOME/madar/start-madar.sh"
EOF
chmod +x "$HOME/.shortcuts/Madar"

echo "۴/۴ اجرای مدار…"
echo -e "${YELLOW}برای اجرای بعدی فقط در Termux بنویسید: bash ~/madar/start-madar.sh${RESET}"
bash "$DEST/start-madar.sh"
