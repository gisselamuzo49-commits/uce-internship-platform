# 🎓 UCE Internship Platform

A comprehensive, modern web application for managing student internships and community service programs at Universidad Central del Ecuador (UCE). This platform streamlines the entire internship lifecycle from application to tutor assignment and reporting.

![Tech Stack](https://img.shields.io/badge/React-18-blue) ![Flask](https://img.shields.io/badge/Flask-2.x-green) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-blue) ![Docker](https://img.shields.io/badge/Docker-Ready-blue)

## 📋 Table of Contents
- [Overview](#overview)
- [Key Features](#key-features)
- [Tech Stack](#tech-stack)
- [Project Structure](#project-structure)
- [Quick Start](#quick-start)
- [Deployment](#deployment)
- [Documentation](#documentation)
- [License](#license)

## 🎯 Overview

The UCE Internship Platform automates the management of:
- **Pre-professional Internships** (Prácticas Pre-Profesionales)
- **Community Service** (Vinculación con la Sociedad)

The system connects students, administrators, tutors, and companies in a single streamlined environment with role-based access control, automated workflows, and real-time reporting.

### Problem Solved
Traditional manual processes for internship management are:
- Time-consuming for administrators
- Difficult to track for students
- Prone to errors in documentation
- Lack real-time visibility

**Our Solution:** A modern, automated platform that handles the entire workflow digitally.

## ✨ Key Features

### 🎓 For Students
- ✅ Browse available internship and community service opportunities
- ✅ Apply to positions with one click
- ✅ Track application status in real-time
- ✅ Manage profile, experiences, and certifications
- ✅ Upload CV and required documents
- ✅ Schedule appointments for interviews
- ✅ Submit tutor assignment requests

### 🛡️ For Administrators
- ✅ Dashboard with real-time KPIs and statistics
- ✅ Review and approve/reject student applications
- ✅ Create and manage internship opportunities
- ✅ Assign tutors to approved students
- ✅ Generate daily Excel reports of approved applicants
- ✅ Upload tutor assignment memos (PDF)
- ✅ Monitor tutor workload distribution
- ✅ Track documentation progress

### 🚀 System Capabilities
- ✅ **Vacancy Management** - Automatic enforcement of position limits
- ✅ **Google OAuth** - Quick sign-in with institutional accounts
- ✅ **Email Notifications** - Automated alerts for appointments and approvals
- ✅ **File Storage** - Cloudflare R2 integration for CVs and documents
- ✅ **Excel Reports** - One-click export of applicant data
- ✅ **Timezone Support** - Ecuador local time (UTC-5) for accurate reporting
- ✅ **Modern UI/UX** - Toast notifications, custom modals, responsive design

## 🛠️ Tech Stack

### Frontend
- **Framework:** React 18 with Vite 6
- **Styling:** Tailwind CSS 3
- **State Management:** TanStack Query (React Query 5)
- **Routing:** React Router 6
- **Forms:** React Hook Form
- **UI Components:** Lucide Icons, React Hot Toast
- **Charts:** Recharts
- **File Generation:** XLSX (SheetJS), jsPDF
- **Authentication:** @react-oauth/google

### Backend
- **Framework:** Flask 2.x (Python)
- **Database ORM:** SQLAlchemy + Flask-SQLAlchemy
- **Authentication:** JWT (Flask-JWT-Extended)
- **Migrations:** Alembic + Flask-Migrate
- **File Storage:** Cloudflare R2 (S3-compatible)
- **Email:** SMTP (Gmail)
- **WSGI Server:** Gunicorn (production)

### Infrastructure
- **Database:** PostgreSQL 15 (Supabase)
- **Containerization:** Docker + Docker Compose
- **Image Registry:** Docker Hub
- **Deployment:** AWS EC2 (or any cloud provider)

## 📂 Project Structure

```
uce-internship-platform/
├── backend/                    # Flask REST API
│   ├── app/
│   │   ├── routes/            # API endpoints (4 blueprints)
│   │   ├── models.py          # Database models
│   │   ├── services.py        # Business logic (R2, email)
│   │   └── extensions.py      # Flask extensions
│   ├── migrations/            # Alembic database migrations
│   ├── config.py              # Configuration
│   ├── main.py               # Entry point
│   ├── Dockerfile            # Backend container
│   └── README.md             # Backend docs
│
├── fronted/                   # React SPA
│   ├── src/
│   │   ├── pages/
│   │   │   ├── student/      # Student role pages (6 pages, 14 components)
│   │   │   └── panel_control/ # Admin role pages (4 pages, 21 components)
│   │   ├── components/        # Shared UI components
│   │   ├── context/          # React Context (Auth)
│   │   └── config/           # API configuration
│   ├── Dockerfile            # Frontend container
│   └── README.md             # Frontend docs
│
├── docker-compose.yml         # Multi-container orchestration
└── README.md                  # This file
```

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose (recommended)
- OR Node.js 18+ and Python 3.8+ (for local development)
- PostgreSQL 15+ (if not using Docker)

### Option 1: Docker (Recommended)

1. **Clone the repository:**
```bash
git clone https://github.com/gisselamuzo49-commits/uce-internship-platform.git
cd uce-internship-platform
```

2. **Configure environment variables:**

Create `.env` in `backend/`:
```env
DATABASE_URL=postgresql://user:password@host:5432/uce_db
SECRET_KEY=your_secret_key_here
R2_ENDPOINT_URL=https://your-account.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=uce-uploads
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password
```

3. **Start the platform:**
```bash
docker-compose up -d
```

4. **Access the application:**
- Frontend: http://localhost
- Backend API: http://localhost:5001

### Option 2: Local Development

**Backend:**
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Windows: venv\Scripts\activate
pip install -r requirements.txt
flask db upgrade
python main.py
```

**Frontend:**
```bash
cd fronted
npm install
npm run dev
```

## 📊 Database Schema

### Core Models
- **User** - Students and administrators with role-based access
- **Opportunity** - Internship/service positions with vacancy tracking
- **Application** - Student applications with approval workflow
- **Appointment** - Interview scheduling linked to applications
- **TutorRequest** - Tutor assignment formalization process
- **Experience & Certification** - Student profile information

See [backend/README.md](backend/README.md) for detailed schema documentation.

## 🔐 Authentication & Authorization

### User Roles
- **Student** - Apply to opportunities, manage profile
- **Admin** - Full system access, review applications, generate reports

### Authentication Methods
1. **Email/Password** - Traditional credentials
2. **Google OAuth** - Quick sign-in with institutional accounts

### Security
- JWT tokens with automatic expiration
- Password hashing with Werkzeug
- Role-based route protection
- CORS configuration for cross-origin requests

## 🚢 Deployment

### Production Deployment with Docker

**1. Build and push images:**

```bash
# Backend
cd backend
docker build -t gdmuzo/uce-backend:v3 .
docker push gdmuzo/uce-backend:v3

# Frontend
cd fronted
docker build -t gdmuzo/uce-frontend:v10 .
docker push gdmuzo/uce-frontend:v10
```

**2. Update `docker-compose.yml` on server:**

```yaml
services:
  backend:
    image: gdmuzo/uce-backend:v3
    ports:
      - "5001:5000"
    environment:
      - DATABASE_URL=postgresql://...
      # Add all env vars

  frontend:
    image: gdmuzo/uce-frontend:v13
    ports:
      - "80:80"
```

**3. Deploy on server:**

```bash
docker-compose pull
docker-compose down
docker-compose up -d
```

### Environment Setup

**Production Checklist:**
- [ ] Configure production PostgreSQL database
- [ ] Set strong `SECRET_KEY` for JWT
- [ ] Configure Cloudflare R2 for file storage
- [ ] Set up Gmail SMTP for email notifications
- [ ] Update `API_URL` in frontend config
- [ ] Configure Google OAuth client ID
- [ ] Enable HTTPS with SSL/TLS
- [ ] Set up domain and DNS

## 📖 Documentation

- [Backend Documentation](backend/README.md) - API routes, models, services
- [Frontend Documentation](fronted/README.md) - Component architecture, routing, state management

### API Documentation

**Base URL:** `http://localhost:5001/api`

**Key Endpoints:**
- `POST /api/login` - User authentication
- `POST /api/register` - User registration
- `GET /api/opportunities` - List opportunities
- `POST /api/applications` - Apply to opportunity
- `GET /api/admin/stats` - Dashboard statistics
- `GET /api/admin/daily-report` - Export Excel report

See [backend/README.md](backend/README.md#api-routes) for complete API reference.

## 🎨 UI/UX Highlights

### Modern Design
- **Responsive** - Mobile-first design with Tailwind CSS
- **Accessible** - Semantic HTML and ARIA labels
- **Performant** - Code splitting and lazy loading
- **Consistent** - Unified design system with custom components

### Key UI Components
- Custom confirmation modals (no browser dialogs)
- Toast notifications for user feedback
- Color-coded vacancy indicators
- Real-time data tables with filtering
- Interactive charts and graphs
- Smooth animations and transitions

## 🔧 Development

### Code Organization

**Backend:**
- Blueprints for route modularization
- Service layer for business logic
- SQLAlchemy models for data persistence

**Frontend:**
- Component-driven architecture
- Custom hooks for business logic
- Context API for global state
- TanStack Query for server state

### Best Practices
- ✅ Separation of concerns
- ✅ DRY (Don't Repeat Yourself)
- ✅ Consistent code style
- ✅ Comprehensive error handling
- ✅ Environment-based configuration

## 🐛 Troubleshooting

### Common Issues

**API Connection Failed:**
```bash
# Check backend is running
docker ps | grep uce_backend

# Check logs
docker logs uce_backend
```

**Database Migration Error:**
```bash
# Reset migrations
docker exec -it uce_backend flask db downgrade
docker exec -it uce_backend flask db upgrade
```

**Frontend Build Error:**
```bash
# Clear cache and rebuild
rm -rf node_modules dist
npm install
npm run build
```

See individual README files for detailed troubleshooting.

## 📈 Current Status

**Version:** 3.0 (Backend), 10 (Frontend)  
**Status:** Production Ready  
**Last Updated:** February 2026

### Recent Updates (v3.0 / v10)
- ✅ Vacancy validation and tracking
- ✅ Ecuador timezone support (UTC-5)
- ✅ Modern UI with toast notifications
- ✅ Custom modals replacing browser dialogs
- ✅ Google OAuth integration
- ✅ Excel report generation
- ✅ Improved error handling
- ✅ Component refactoring for better maintainability

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/new-feature`
3. Make your changes following code style guidelines
4. Test thoroughly
5. Commit: `git commit -m "Add new feature"`
6. Push: `git push origin feature/new-feature`
7. Submit a pull request

## 📄 License

All rights reserved © Universidad Central del Ecuador (UCE) 2026

## 👥 Team

**Developer:** Gissela Muzo  
**Institution:** Universidad Central del Ecuador  
**Year:** 2026

## 📞 Support

For questions, issues, or support:
- Create an issue on GitHub
- Contact UCE IT Department
- Email: [support@uce.edu.ec](mailto:support@uce.edu.ec)

---

**Built with for Universidad Central del Ecuador**
