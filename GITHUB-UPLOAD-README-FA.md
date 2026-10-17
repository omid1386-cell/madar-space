# راهنمای کوتاه بارگذاری نسخه ۰٫۱۹ مدار

مخزن هدف:

```text
https://github.com/omid1386-cell/madar-space-render
```

شاخه هدف:

```text
main
```

مراحل:

1. فایل فشرده را استخراج کنید.
2. مخزن را با برنامه رومیزی گیت‌هاب دریافت کنید.
3. یک شاخه پشتیبان بسازید.
4. محتوای داخل پوشه استخراج‌شده را مستقیماً در ریشه مخزن کپی کنید.
5. پوشه‌های وابستگی و کش قدیمی را حذف کنید.
6. تغییرات را روی شاخه اصلی ثبت کنید.
7. تغییرات را به گیت‌هاب ارسال کنید.
8. در پنل سرویس میزبانی، آخرین ثبت را منتشر کنید.

پوشه‌های حذف‌شدنی در صورت وجود:

```text
vendor/
__pycache__/
api/__pycache__/
```

فایل‌های کش حذف‌شدنی:

```text
data-cache.json
translation-cache.json
agency-feed-cache.json
```

ساختار صحیح:

```text
madar-space-render/app.py
madar-space-render/public/index.html
```

عنوان پیشنهادی ثبت:

```text
Release Madar 0.19 mathematical typography update
```

بعد از ارسال، مسیر سلامت را کنترل کنید:

```text
https://YOUR-RENDER-URL/api/health
```

نسخه مورد انتظار:

```text
Madar/0.19-experimental
```
