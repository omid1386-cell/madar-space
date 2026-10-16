# راه‌اندازی مدار روی Render و نصب روی گوشی

پروژه از نظر PWA و Render آماده است. مراحل باقی‌مانده به حساب GitHub و Render شما نیاز دارند.

## مرحله ۱ — قرار دادن پروژه در GitHub

1. وارد [github.com](https://github.com) شوید.
2. یک Repository جدید با نامی مانند `madar-space` بسازید.
3. محتوای پوشه `madar` را در ریشه Repository قرار دهید.
4. مطمئن شوید فایل‌های زیر در ریشه دیده می‌شوند:

```text
app.py
render.yaml
requirements.txt
Procfile
public/
```

> پوشه وابستگی محلی عمداً در بسته انتشار قرار نگرفته است. سرویس، وابستگی معتبر را هنگام ساخت از فایل نیازمندی‌ها نصب می‌کند. پوشه‌های کش و پوشه زیر را نیز بارگذاری نکنید.

```text
node_modules/
```

## مرحله ۲ — اتصال به Render

1. وارد [dashboard.render.com](https://dashboard.render.com) شوید.
2. روی **New +** بزنید.
3. گزینه **Blueprint** را انتخاب کنید.
4. حساب GitHub را متصل و Repository مدار را انتخاب کنید.
5. Render فایل `render.yaml` را پیدا می‌کند.
6. روی **Apply** یا **Deploy Blueprint** بزنید.

تنظیمات از قبل آماده‌اند:

| تنظیم | مقدار |
|---|---|
| Runtime | Python |
| Build command | `pip install -r requirements.txt` |
| Start command | `python -u app.py` |
| Health check | `/api/health` |
| Python | 3.12.8 |

پس از پایان، Render آدرسی شبیه این می‌دهد:

```text
https://madar-space.onrender.com
```

## مرحله ۳ — آزمون

این نشانی باید پاسخ JSON سالم بدهد:

```text
https://YOUR-APP.onrender.com/api/health
```

سپس صفحه اصلی را باز و بخش‌های زیر را بررسی کنید:

- بانک پرتاب‌ها
- NASA / ESA زنده
- دانشنامه ماهواره‌ها
- مدل سه‌بعدی
- خلاصه‌ساز

## مرحله ۴ — نصب روی Android

1. آدرس Render را با Chrome باز کنید.
2. چند ثانیه صبر کنید تا دکمه **نصب مدار** ظاهر شود.
3. روی آن بزنید و Install را تأیید کنید.
4. اگر دکمه ظاهر نشد: منوی سه‌نقطه → **Install app** یا **Add to Home screen**.

## مرحله ۵ — نصب روی iPhone/iPad

1. آدرس را با Safari باز کنید.
2. Share را بزنید.
3. **Add to Home Screen** را انتخاب کنید.
4. نام «مدار» را تأیید کنید.

## نکته پلن رایگان Render

پلن Free پس از مدتی بی‌استفاده‌بودن ممکن است Sleep شود. اولین بازشدن بعدی می‌تواند چند ده ثانیه طول بکشد. Service Worker در این فاصله نسخه Cache‌شده آموزشی را نشان می‌دهد، ولی داده تازه API پس از بیدارشدن سرور می‌آید.

برای اجرای فوری و دائمی می‌توانید بعداً سرویس را به پلن Starter ارتقا دهید.

## به‌روزرسانی نسخه‌های بعدی

هر بار تغییرات جدید را به GitHub Push کنید، Render به‌طور خودکار Deploy می‌کند. Service Worker نسخه جدید را تشخیص می‌دهد و داخل برنامه پیام بازخوانی نمایش داده می‌شود.
