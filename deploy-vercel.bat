@echo off
chcp 65001 >nul
where node >nul 2>nul
if errorlevel 1 goto nonode

echo.
echo آماده‌سازی انتشار مدار روی ورسل
echo مرورگر برای ورود به حساب باز خواهد شد.
echo.
call npx vercel --prod

echo.
echo اگر انتشار موفق باشد، نشانی دائمی بالا نمایش داده شده است.
pause
exit /b 0

:nonode
echo.
echo ابتدا نسخه پایدار نود را نصب کنید:
echo https://nodejs.org/
echo سپس این فایل را دوباره اجرا کنید.
pause
exit /b 1
