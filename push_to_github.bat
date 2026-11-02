@echo off
title Push to GitHub
cd /d "%~dp0"
echo ========================================================
echo กำลัง Push โปรเจกต์ขึ้น GitHub...
echo (หากมีหน้าต่างถาม ให้เข้าสู่ระบบ GitHub หรือใส่ Token)
echo ========================================================
"%LOCALAPPDATA%\Programs\GitPortable\cmd\git.exe" push -u origin main
echo.
pause
