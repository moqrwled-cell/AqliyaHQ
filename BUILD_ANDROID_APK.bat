@echo off
title عقلية ^| AQLIYA HQ — حزم تطبيق الأندرويد (APK Builder)
color 0B
cls
echo ===================================================================
echo               عقلية ^| AQLIYA ANDROID APK PACKAGER
echo ===================================================================
cd /d "%~dp0"

echo [1/3] Building production assets...
call npm run build

echo [2/3] Syncing assets with native Android wrapper...
call npx cap sync android

echo [3/3] Opening Android project or compiling APK...
echo.
echo ===================================================================
echo [!] تم تجهيز ومزامنة كود الأندرويد بنجاح!
echo [!] لإنشاء ملف الـ APK النهائي أو تشغيله على هاتفك مباشرة:
echo.
echo     1. لتشغيل المشروع في Android Studio وبناء الـ APK بنقرة واحدة:
echo        اكتب: npx cap open android
echo.
echo     2. أو إن كان لديك Java/Gradle مثبت:
echo        cd android && gradlew assembleDebug
echo ===================================================================
pause
