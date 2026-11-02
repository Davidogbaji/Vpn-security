@echo off
title VPN and Proxy IP Detection System - Setup
color 0a

echo ======================================================================
echo    VPN AND PROXY IP DETECTION SYSTEM - AUTOMATIC SETUP
echo ======================================================================
echo.
echo  Step 1 of 2: Installing Backend Dependencies...
cd backend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Backend npm install failed. Please ensure Node.js is installed.
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo  Step 2 of 2: Installing Frontend Dependencies...
cd frontend
call npm install
if %ERRORLEVEL% NEQ 0 (
    echo [ERROR] Frontend npm install failed.
    pause
    exit /b %ERRORLEVEL%
)
cd ..

echo.
echo ======================================================================
echo  [SUCCESS] All dependencies have been installed successfully!
echo  You can now start the application by double-clicking "start-all.bat"
echo ======================================================================
echo.
pause
