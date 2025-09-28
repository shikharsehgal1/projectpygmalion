#!/bin/bash

# Voice Minecraft Controller Startup Script
# This script starts the voice controller with all necessary components

echo "🎮 Starting Voice Minecraft Controller..."
echo "========================================"

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "❌ Node.js is not installed. Please install Node.js first."
    echo "   Download from: https://nodejs.org/"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "❌ npm is not installed. Please install npm first."
    exit 1
fi

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    echo "❌ Python 3 is not installed. Please install Python 3 first."
    exit 1
fi

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "❌ .env file not found. Please create it with your OpenAI API key:"
    echo "   OPENAI_API_KEY=your-openai-api-key-here"
    exit 1
fi

# Install Node.js dependencies if node_modules doesn't exist
if [ ! -d "node_modules" ]; then
    echo "📦 Installing Node.js dependencies..."
    npm install
    if [ $? -ne 0 ]; then
        echo "❌ Failed to install Node.js dependencies"
        exit 1
    fi
fi

# Install Python dependencies
echo "🐍 Installing Python dependencies..."
pip3 install -r requirements_voice.txt
if [ $? -ne 0 ]; then
    echo "❌ Failed to install Python dependencies"
    exit 1
fi

echo ""
echo "🚀 Starting voice server..."
echo "   The server will be available at: http://localhost:3000"
echo "   Press Ctrl+C to stop the server"
echo ""

# Start the voice server
node voice_server.js
