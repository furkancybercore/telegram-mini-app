#!/bin/bash

# Rock-Paper-Scissors Telegram Mini App Starter Script
# This script starts both the backend and frontend servers
# for a smoother development experience.

echo "🚀 Starting Rock-Paper-Scissors Telegram Mini App..."
echo ""

# Function to display an error message and exit
error_exit() {
    echo "❌ Error: $1"
    exit 1
}

# Function to check if a command exists
command_exists() {
    command -v "$1" >/dev/null 2>&1
}

# Check for required commands
command_exists python || error_exit "Python is required but not installed."
command_exists gnome-terminal || command_exists xterm || command_exists terminal || error_exit "No suitable terminal emulator found."

# Determine which terminal to use
TERMINAL_CMD="gnome-terminal"
if ! command_exists gnome-terminal; then
    if command_exists xterm; then
        TERMINAL_CMD="xterm -e"
    elif command_exists terminal; then
        TERMINAL_CMD="terminal -e"
    fi
fi

echo "📁 Project directory: $(pwd)"
echo ""

# Start the backend server
echo "🔧 Starting Django Backend server..."
$TERMINAL_CMD "cd $(pwd)/backend && echo '🔧 Starting Django Backend server at http://localhost:8000' && python manage.py runserver" &

# Wait a moment for backend to start
sleep 2

# Start the frontend server
echo "🎨 Starting Frontend server..."
$TERMINAL_CMD "cd $(pwd)/frontend && echo '🎨 Starting Frontend server at http://localhost:8080' && python -m http.server 8080" &

# Wait a moment for frontend to start
sleep 2

echo ""
echo "✅ Servers started successfully!"
echo ""
echo "📱 Access the app at: http://localhost:8080"
echo "🔌 API available at: http://localhost:8000/api"
echo ""
echo "ℹ️ Use Demo Mode if running outside of Telegram"
echo "ℹ️ Press Ctrl+C in the terminal windows to stop the servers"
echo ""
echo "🔍 For more information, check the README.md files"
echo "" 