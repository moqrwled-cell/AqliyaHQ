@echo off
title عقلية | AQLIYA HQ
cd /d "%~dp0"
if exist "node_modules\electron\dist\electron.exe" (
    start "" "%~dp0node_modules\electron\dist\electron.exe" "%~dp0electron-main.cjs"
) else (
    npm run app
)
exit
