# Portfolio Website

A modern, responsive portfolio website built with React, FastAPI, and Docker. Features a clean design with dark/light mode toggle, smooth animations, and a containerized deployment setup.

## 🚀 Features

- **Responsive Design**: Mobile-first approach with Tailwind CSS
- **Dark/Light Mode**: Toggle between themes with localStorage persistence
- **Smooth Animations**: Fade-in effects and smooth scrolling
- **Modern UI**: Glass morphism effects and gradient backgrounds
- **Containerized**: Full Docker setup for easy deployment
- **API Integration**: FastAPI backend serving resume and project data

## 🛠️ Technology Stack

### Frontend
- React 18 with Vite
- Tailwind CSS for styling
- Custom animations and transitions
- Responsive design

### Backend
- FastAPI (Python)
- CORS middleware for cross-origin requests
- Structured JSON API endpoints

### Deployment
- Docker & Docker Compose
- Multi-stage builds for optimization
- Nginx for static file serving

## 📁 Project Structure

```
portfolio-app/
├── docker-compose.yml          # Docker orchestration
├── README.md                   # This file
├── backend/                    # FastAPI backend
│   ├── Dockerfile             # Backend container config
│   ├── main.py                # FastAPI application
│   └── requirements.txt       # Python dependencies
└── frontend/                   # React frontend
    ├── Dockerfile             # Frontend container config
    ├── package.json           # Node.js dependencies
    ├── vite.config.js         # Vite configuration
    ├── tailwind.config.js     # Tailwind CSS config
    ├── postcss.config.js      # PostCSS config
    ├── index.html             # HTML entry point
    └── src/
        ├── App.jsx            # Main React component
        ├── main.jsx           # React entry point
        └── index.css          # Global styles
```

## 🚀 Quick Start

### Prerequisites
- Docker and Docker Compose installed
- Git (for cloning the repository)

### Running the Application

1. **Clone the repository** (if not already done):
   ```bash
   git clone <repository-url>
   cd portfolio-app
   ```

2. **Start the application with Docker Compose**:
   ```bash
   docker-compose up --build
   ```

3. **Access the application**:
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:8000
   - API Documentation: http://localhost:8000/docs

### Development Mode

For development with hot reloading:

1. **Start the backend**:
   ```bash
   cd backend
   pip install -r requirements.txt
   python main.py
   ```

2. **Start the frontend** (in a new terminal):
   ```bash
   cd frontend
   npm install
   npm run dev
   ```

## 🔧 Configuration

### Environment Variables
The application uses default configurations. For production deployment, consider setting:
- `PYTHONUNBUFFERED=1` (already set in docker-compose.yml)
- Custom nginx configuration for the frontend

### API Endpoints

- `GET /api/status` - Health check endpoint
- `GET /api/resume` - Returns professional experience and education data
- `GET /api/projects` - Returns featured projects data

### Customization

#### Adding New Resume Data
Edit `backend/main.py` and update the data structures in the respective endpoints.

#### Styling Changes
Modify `frontend/src/index.css` and `frontend/tailwind.config.js` for custom styling.

#### Adding New Sections
Update `frontend/src/App.jsx` to add new sections and corresponding navigation.

## 🐳 Docker Commands

```bash
# Build and start all services
docker-compose up --build

# Start services in background
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# Rebuild specific service
docker-compose up --build backend
```

## 📱 Responsive Design

The application is fully responsive with breakpoints:
- Mobile: < 768px
- Tablet: 768px - 1024px
- Desktop: > 1024px

## 🎨 Theme System

The application supports both light and dark themes:
- Automatic detection of system preference
- Manual toggle in navigation
- Persistent storage in localStorage
- Smooth transitions between themes

## 🔍 Performance Features

- Multi-stage Docker builds for smaller images
- Optimized bundle with Vite
- Lazy loading and intersection observers for animations
- Efficient state management with React hooks

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test thoroughly
5. Submit a pull request

## 📞 Support

For questions or support, please open an issue in the repository.