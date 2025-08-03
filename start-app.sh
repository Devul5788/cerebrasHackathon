#!/bin/bash

echo "================================================"
echo "    NexLead - Full Stack Application Setup"
echo "================================================"
echo ""

# Check if Python is installed
if ! command -v python3 &> /dev/null; then
    if ! command -v python &> /dev/null; then
        echo "ERROR: Python is not installed or not in PATH"
        echo "Please install Python 3.8+ and try again"
        exit 1
    else
        PYTHON_CMD="python"
    fi
else
    PYTHON_CMD="python3"
fi

# Check if Node.js is installed
if ! command -v node &> /dev/null; then
    echo "ERROR: Node.js is not installed or not in PATH"
    echo "Please install Node.js 16+ and try again"
    exit 1
fi

# Check if npm is installed
if ! command -v npm &> /dev/null; then
    echo "ERROR: npm is not installed or not in PATH"
    echo "Please install npm and try again"
    exit 1
fi

echo "[1/5] Clearing previous database context..."
cd backend

# Delete SQLite database file to clear context
if [ -f "db.sqlite3" ]; then
    echo "Removing existing SQLite database file..."
    rm -f db.sqlite3
    echo "Database file deleted successfully."
else
    echo "No existing database file found."
fi

echo ""
echo "[2/5] Setting up Backend (Django)..."

echo "Installing Python dependencies..."
if command -v pip3 &> /dev/null; then
    pip3 install -r requirements.txt
else
    pip install -r requirements.txt
fi

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Python dependencies"
    exit 1
fi

echo "Running database migrations..."
$PYTHON_CMD manage.py migrate

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to run migrations"
    exit 1
fi

echo "Starting Django server on port 8000..."
$PYTHON_CMD manage.py runserver 8000 &
BACKEND_PID=$!

echo ""
echo "[3/5] Setting up Frontend (React + TypeScript + Tailwind)..."
cd ../frontend

echo "Installing Node.js dependencies..."
npm install

if [ $? -ne 0 ]; then
    echo "ERROR: Failed to install Node.js dependencies"
    kill $BACKEND_PID 2>/dev/null
    exit 1
fi

echo ""
echo "[4/5] Starting React development server..."
echo "Note: React server will start on port 3000 (or next available port)"
npm start &
FRONTEND_PID=$!

echo ""
echo "[5/5] Setup Complete!"
echo "================================================"
echo "    Both servers are now running!"
echo "================================================"
echo ""
echo "Backend (Django):  http://localhost:8000"
echo "Frontend (React):  http://localhost:3000"
echo "API Endpoints:     http://localhost:8000/api/"
echo "Django Admin:      http://localhost:8000/admin/"
echo ""
echo "Both servers are running in the background."
echo "Press Ctrl+C to stop both servers and exit."

# Function to handle script termination
cleanup() {
    echo ""
    echo "Stopping servers..."
    kill $BACKEND_PID 2>/dev/null
    kill $FRONTEND_PID 2>/dev/null
    echo "Servers stopped. Goodbye!"
    exit 0
}

# Trap Ctrl+C and call cleanup function
trap cleanup SIGINT

# Wait for user to press Ctrl+C
echo "Waiting for servers to start up..."
sleep 5
echo "Servers should now be accessible. Press Ctrl+C to stop."

# Keep script running until user presses Ctrl+C
while true; do
    sleep 1
done
