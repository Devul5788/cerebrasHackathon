# CerebrasApp - Full Stack Web Application

A modern full-stack web application built with **React + TypeScript + Tailwind CSS** frontend and **Django + Django REST Framework** backend.

## 🚀 Features

- **Frontend**: React 18 with TypeScript and Tailwind CSS
- **Backend**: Django 4.2 with Django REST Framework
- **Styling**: Modern, responsive design with Tailwind CSS
- **API**: RESTful API endpoints with CORS support
- **Type Safety**: Full TypeScript integration
- **Real-time Data**: Frontend dynamically fetches data from Django backend

## 📁 Project Structure

```
cerebrasHackathon/
├── frontend/          # React + TypeScript + Tailwind CSS
│   ├── src/
│   │   ├── services/  # API service functions
│   │   └── ...
│   └── package.json
├── backend/           # Django + DRF
│   ├── api/          # API app
│   ├── cerebras_backend/  # Main project
│   ├── manage.py
│   └── requirements.txt
├── start-app.bat     # One-click setup script (Windows)
├── start-app.sh      # One-click setup script (Mac/Linux)
├── start-frontend.bat # Script to start React dev server
├── start-backend.bat  # Script to start Django dev server
└── README.md
```

## 📋 Getting Started for New Contributors

### First Time Setup

1. **Clone the repository:**
   ```bash
   git clone <your-repo-url>
   cd cerebrasHackathon
   ```

2. **Run the one-click setup:**
   - **Windows:** Double-click `start-app.bat` or run `start-app.bat` in terminal
   - **Mac/Linux:** Run `./start-app.sh` in terminal

3. **Access the application:**
   - Frontend: http://localhost:3000
   - Backend API: http://localhost:8000/api/
   - Django Admin: http://localhost:8000/admin/

### About Git and Backend Files

**Q: Why don't I see backend files in git?**

**A:** The backend files ARE included in the repository! If you're not seeing them, it might be because:

1. **Files haven't been committed yet** - Run `git status` to see untracked files
2. **You're in the wrong directory** - Make sure you're in the root project directory
3. **Files were accidentally gitignored** - Check for `.gitignore` rules

To add all files to git:
```bash
git add .
git commit -m "Initial commit with frontend and backend"
git push origin main
```

The backend files are located in the `backend/` directory and include:
- Django project files (`cerebras_backend/`)
- API application (`api/`)
- Database file (`db.sqlite3`)
- Requirements file (`requirements.txt`)
- Management commands (`manage.py`)

## 🛠️ Quick Setup (Recommended)

### One-Click Setup

For the fastest setup, use the provided startup scripts that automatically install dependencies and start both servers:

#### Windows Users:
```cmd
start-app.bat
```
or simply double-click the `start-app.bat` file

#### Mac/Linux Users:
```bash
./start-app.sh
```

These scripts will:
1. ✅ Install all Python dependencies (Django, DRF, etc.)
2. ✅ Install all Node.js dependencies (React, TypeScript, Tailwind CSS)
3. ✅ Run database migrations
4. ✅ Start both backend and frontend servers
5. ✅ Open both servers in separate terminal windows

## 🛠️ Manual Setup Instructions

### Prerequisites
- **Python 3.8+** installed
- **Node.js 16+** and npm installed

### Backend Setup (Django)

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install Python dependencies:
   ```bash
   pip install -r requirements.txt
   ```

3. Run database migrations:
   ```bash
   python manage.py migrate
   ```

4. Start the Django development server:
   ```bash
   python manage.py runserver 8000
   ```

### Frontend Setup (React)

1. Navigate to the frontend directory:
   ```bash
   cd frontend
   ```

2. Install Node.js dependencies:
   ```bash
   npm install
   ```

3. Start the React development server:
   ```bash
   npm start
   ```

## 🚀 Alternative Quick Start

You can also use the individual batch files to start servers separately:

1. **Start Backend**: Double-click `start-backend.bat` or run it from terminal
2. **Start Frontend**: Double-click `start-frontend.bat` or run it from terminal

## 🔗 API Endpoints

The Django backend provides the following API endpoints:

- `GET /api/hello/` - Simple hello world message
- `GET /api/status/` - API status and version info
- `GET /api/data/` - Sample data for frontend display
- `POST /api/data/` - Submit data to the backend

## 🎨 Frontend Features

- **Responsive Design**: Works on desktop, tablet, and mobile
- **Modern UI**: Clean, professional design with Tailwind CSS
- **API Integration**: Real-time data fetching from Django backend
- **Loading States**: User-friendly loading and error handling
- **TypeScript**: Full type safety and better developer experience

## 🔧 Backend Features

- **REST API**: Clean, RESTful API design
- **CORS Support**: Configured for frontend-backend communication
- **Django Admin**: Built-in admin interface
- **Extensible**: Easy to add new API endpoints and models

## 📱 Accessing the Application

- **Frontend**: http://localhost:3000
- **Backend API**: http://localhost:8000/api/
- **Django Admin**: http://localhost:8000/admin/

## 🧪 Testing the Connection

1. Start both servers (backend on port 8000, frontend on port 3000)
2. Open http://localhost:3000 in your browser
3. You should see:
   - A green status indicator showing "API: online"
   - Feature cards loaded from the Django backend
   - Footer showing the count of items from the API

## 🔧 Development

### Adding New API Endpoints

1. Add new views in `backend/api/views.py`
2. Add URL patterns in `backend/api/urls.py`
3. Update the frontend service in `frontend/src/services/apiService.ts`

### Customizing the Frontend

- Modify `frontend/src/App.tsx` for main component changes
- Add new components in `frontend/src/components/`
- Customize styling with Tailwind CSS classes

## 📦 Dependencies

### Frontend
- React 18
- TypeScript
- Tailwind CSS
- Axios (for API calls)

### Backend
- Django 4.2
- Django REST Framework
- django-cors-headers
- python-decouple

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature-name`
3. Make your changes
4. Test both frontend and backend
5. Commit your changes: `git commit -m "Add feature"`
6. Push to the branch: `git push origin feature-name`
7. Submit a pull request

## 🔧 Troubleshooting

### Common Issues

**1. "Python/Node.js not found"**
- Make sure Python 3.8+ and Node.js 16+ are installed
- Ensure they're added to your system PATH

**2. "Port already in use"**
- Backend: Kill any process using port 8000 or change the port in `start-backend.bat`
- Frontend: React will automatically suggest an alternative port

**3. "pip install fails"**
- Try using `pip3` instead of `pip`
- On Windows, ensure you're running as Administrator if needed

**4. "npm install fails"**
- Clear npm cache: `npm cache clean --force`
- Delete `node_modules` and `package-lock.json`, then run `npm install` again

**5. "Database migration errors"**
- Delete `db.sqlite3` file and run migrations again
- Make sure you're in the `backend/` directory

**6. "Tailwind CSS not working"**
- Make sure you're using Tailwind CSS v3 (not v4)
- Verify `postcss.config.js` configuration
- Check that CSS imports are correct in `src/index.css`

### Getting Help

If you encounter issues:
1. Check this troubleshooting section
2. Look at the terminal output for specific error messages
3. Ensure all prerequisites are installed
4. Try the manual setup steps instead of the one-click script

## 📄 License

This project is open source and available under the MIT License.
