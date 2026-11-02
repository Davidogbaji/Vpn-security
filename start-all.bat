@echo off
title VPN and Proxy IP Detection System - Launcher
color 0b

echo ======================================================================
echo    VPN AND PROXY IP DETECTION SYSTEM - LAUNCHER
echo ======================================================================
echo.
echo  Starting Backend API on http://localhost:5000 ...
start "VPN Detection Backend API" cmd /k "cd backend && npm run dev"

timeout /t 3 /nobreak >nul

echo  Starting Frontend Web App on http://localhost:5173 ...
start "VPN Detection Frontend" cmd /k "cd frontend && npm run dev"

timeout /t 2 /nobreak >nul

echo.
echo  Opening browser at http://localhost:5173 ...
start http://localhost:5173

echo.
echo ======================================================================
echo  System is running! 
echo  Frontend: http://localhost:5173
echo  Backend:  http://localhost:5000
echo ======================================================================
echo.
pause
