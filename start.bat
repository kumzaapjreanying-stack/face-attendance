@echo off
title Face Recognition Attendance Server
cd /d "%~dp0"
powershell -ExecutionPolicy Bypass -File run_server.ps1
pause
