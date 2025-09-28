@echo off
REM Voice Minecraft Controller Startup Script for Windows
REM This script starts the voice controller with all necessary components

echo 🎮 Starting Voice Minecraft Controller...
echo ========================================

REM Check if Node.js is installed
node --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Node.js is not installed. Please install Node.js first.
    echo    Download from: https://nodejs.org/
    pause
    exit /b 1
)

REM Check if npm is installed
npm --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ npm is not installed. Please install npm first.
    pause
    exit /b 1
)

REM Check if Python is installed
python --version >nul 2>&1
if %errorlevel% neq 0 (
    echo ❌ Python is not installed. Please install Python first.
    pause
    exit /b 1
)

REM Check if .env file exists
if not exist ".env" (
    echo ❌ .env file not found. Please create it with your OpenAI API key:
    echo    OPENAI_API_KEY=your-openai-api-key-here
    pause
    exit /b 1
)

REM Install Node.js dependencies if node_modules doesn't exist
if not exist "node_modules" (
    echo 📦 Installing Node.js dependencies...
    npm install
    if %errorlevel% neq 0 (
        echo ❌ Failed to install Node.js dependencies
        pause
        exit /b 1
    )
)

REM Install Python dependencies
echo 🐍 Installing Python dependencies...
pip install -r requirements_voice.txt
if %errorlevel% neq 0 (
    echo ❌ Failed to install Python dependencies
    pause
    exit /b 1
)

echo.
echo 🚀 Starting voice server...
echo    The server will be available at: http://localhost:3000
echo    Press Ctrl+C to stop the server
echo.

REM Start the voice server
node voice_server.js

pause
