@echo off
:: Rock-Paper-Scissors Telegram Mini App Starter Script for Windows
:: This script starts both the backend and frontend servers

echo 🚀 Starting Rock-Paper-Scissors Telegram Mini App...
echo.

:: Check if Python is installed
where python >nul 2>nul
if %ERRORLEVEL% neq 0 (
    echo ❌ Error: Python is required but not installed.
    exit /b 1
)

echo 📁 Project directory: %CD%
echo.

:: Start the backend server
echo 🔧 Starting Django Backend server...
start cmd /k "cd %CD%\backend && echo 🔧 Starting Django Backend server at http://localhost:8000 && python manage.py runserver"

:: Wait a moment for backend to start
timeout /t 2 /nobreak >nul

:: Start the frontend server
echo 🎨 Starting Frontend server...
start cmd /k "cd %CD%\frontend && echo 🎨 Starting Frontend server at http://localhost:8080 && python -m http.server 8080"

:: Wait a moment for frontend to start
timeout /t 2 /nobreak >nul

echo.
echo ✅ Servers started successfully!
echo.
echo 📱 Access the app at: http://localhost:8080
echo 🔌 API available at: http://localhost:8000/api
echo.
echo ℹ️ Use Demo Mode if running outside of Telegram
echo ℹ️ Close the terminal windows to stop the servers
echo.
echo 🔍 For more information, check the README.md files
echo. 