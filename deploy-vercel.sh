#!/usr/bin/env bash
set -e
if ! command -v node >/dev/null 2>&1; then
  echo "ابتدا نسخه پایدار نود را نصب کنید:"
  echo "https://nodejs.org/"
  exit 1
fi
printf '\nانتشار مدار روی ورسل آغاز می‌شود.\n\n'
npx vercel --prod
printf '\nاگر انتشار موفق باشد، نشانی دائمی در خروجی بالا نمایش داده شده است.\n'
