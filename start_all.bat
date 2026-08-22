@echo off
title CODE HUNT - Platform Launcher
cls
echo =================================================================
echo             STARTING CODE HUNT EXPEDITION PLATFORM
echo =================================================================
echo.

echo [1/2] Starting Backend FastAPI Server (Port 8000)...
start "CODE HUNT - Backend Server" cmd /k "cd /d %~dp0backend && python run.py"

timeout /t 2 >nul

echo [2/2] Starting Frontend React Vite Server (Port 5173)...
start "CODE HUNT - Frontend Server" cmd /k "cd /d %~dp0frontend && npm run dev"

echo.
echo =================================================================
echo                CODE HUNT IS NOW RUNNING!
echo =================================================================
echo.
echo  Participant URL (Local):  http://localhost:5173
echo  Backend API & Docs:       http://localhost:8000/docs
echo  Admin Mission Control:    http://localhost:5173 (Click Mission Control)
echo.
echo =================================================================
pause
