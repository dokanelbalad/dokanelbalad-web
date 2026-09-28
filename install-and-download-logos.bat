@echo off
cd /d "%~dp0"
if exist "app\favicon.ico" del "app\favicon.ico"
powershell -NoProfile -ExecutionPolicy Bypass -File "download-brand-logos.ps1"
echo.
echo Done. You can close this window.
pause
