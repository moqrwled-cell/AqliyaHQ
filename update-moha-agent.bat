@echo off
chcp 65001 >nul
echo ========================================================
echo     Moha Agent - تحديث المنظومة بنقرة واحدة
echo ========================================================
echo.
echo 1. جاري سحب أحدث التعديلات من GitHub...
git pull origin main
echo.
echo 2. جاري بناء ملفات التطبيق (Vite + TypeScript)...
call npm run build
echo.
echo 3. جاري مزامنة تطبيق أندرويد (Capacitor Sync)...
call npx cap sync android
echo.
echo 4. جاري فحص اتصال الهاتف عبر USB أو Wi-Fi (ADB)...
where adb >nul 2>nul
if %errorlevel% equ 0 (
    adb devices
    echo جاري تثبيت التطبيق مباشرة على هاتفك...
    cd android && call gradlew.bat assembleDebug && cd ..
    if exist "android\app\build\outputs\apk\debug\app-debug.apk" (
        copy /Y "android\app\build\outputs\apk\debug\app-debug.apk" "MohaAgent-Latest.apk"
        adb install -r "android\app\build\outputs\apk\debug\app-debug.apk"
        echo.
        echo [نجاح] تم تثبيت التحديث مباشرة على هاتفك بنجاح!
    )
) else (
    echo [تنبيه] ADB غير مثبت، تم تجهيز ملفات التحديث للمزامنة السريعة.
)

echo.
echo ========================================================
echo   اكتمل التحديث بنجاح يا قائد محمد! 🫡
echo ========================================================
pause
