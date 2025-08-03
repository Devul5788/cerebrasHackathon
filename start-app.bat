@echo off
echo ================================================
echo    NexLead - Full Stack Application Setup
echo ================================================
echo.

echo [1/5] Clearing previous database context...
cd backend

REM Delete SQLite database file to clear context
if exist "db.sqlite3" (
    echo Removing existing SQLite database file...
    del "db.sqlite3"
    echo Database file deleted successfully.
) else (
    echo No existing database file found.
)

echo.
echo [2/5] Setting up Backend (Django)...
echo Installing Python dependencies...
pip install -r requirements.txt
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Python dependencies
    pause
    exit /b 1
)

echo Running database migrations...
python manage.py migrate
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to run migrations
    pause
    exit /b 1
)

echo Starting Django server on port 8000...
start "Django Backend" cmd /k "python manage.py runserver 8000"

echo.
echo [3/5] Setting up Frontend (React + TypeScript + Tailwind)...
cd ..\frontend
echo Installing Node.js dependencies...
npm install
if %ERRORLEVEL% NEQ 0 (
    echo ERROR: Failed to install Node.js dependencies
    pause
    exit /b 1
)

echo.
echo [4/5] Starting React development server...
echo Note: React server will start on port 3000 (or next available port)
start "React Frontend" cmd /k "npm start"

echo.
echo [5/5] Setup Complete!
echo ================================================
echo    Both servers are starting up...
echo ================================================
echo.
echo Backend (Django):  http://localhost:8000
echo Frontend (React):  http://localhost:3000
echo API Endpoints:     http://localhost:8000/api/
echo Django Admin:      http://localhost:8000/admin/
echo.
echo Wait a few moments for both servers to fully start up.
echo Both terminal windows will remain open for monitoring.
echo.
echo Press any key to exit this setup script...
pause >nul
