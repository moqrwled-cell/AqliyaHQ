@echo off
title عقلية | AQLIYA HQ
cd /d "%~dp0"
if exist "node_modules\electron\dist\electron.exe" (
    start "" "node_modules\electron\dist\electron.exe" .
) else (
    npm run app
)
exit
