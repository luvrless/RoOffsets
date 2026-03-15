@echo off
title Roblox Offsets API - Installer & Launcher
color 0b

echo ===================================================
echo Roblox Offsets API - Setup & Launch
echo ===================================================

node -v >nul 2>&1
if %errorlevel% neq 0 (
    echo [!] Node.js is not installed. 
    echo [*] Downloading and Installing Node.js via Winget...
    winget install OpenJS.NodeJS
    echo [*] Please restart this script after Node.js finishes installing!
    pause
    exit
) else (
    echo [+] Node.js is installed.
)

if not exist node_modules\ (
    echo [*] Installing required API dependencies...
    call npm install express axios cors
)

echo.
echo [+] Starting the Custom Offsets API Server...
echo [+] Once started, the website will be available at: http://localhost:3000
echo.

node server.js
pause
