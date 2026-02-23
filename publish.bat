@echo off
cd /d "%~dp0"
git add -A
git commit -m "Updated content via Keystatic"
git push
echo.
echo Done! Changes will be live in ~60 seconds.
pause
