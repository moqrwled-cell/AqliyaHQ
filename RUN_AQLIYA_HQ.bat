@echo off
title عقلية | AQLIYA HQ — غرفة العمليات التكتيكية
color 0A
cls
echo ===================================================================
echo               عقلية ^| AQLIYA COMMAND CENTER (WAR ROOM)
echo                       SYSTEM INITIALIZATION
echo ===================================================================
echo [!] Starting Tactical Engine & Supabase Realtime Sync...
cd /d "%~dp0"

start /b npm run dev

echo [!] Waiting for Core HUD to initialize...
timeout /t 3 /nobreak >nul

echo [!] Opening Command Console...
start http://localhost:5173

echo ===================================================================
echo [OK] WAR ROOM HUD IS ONLINE AT: http://localhost:5173
echo [!] Press Ctrl+C in this window to power down when finished.
echo ===================================================================
pause
