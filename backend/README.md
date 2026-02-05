# UCE Internship Platform - Backend

REST API backend for the UCE (Universidad Central del Ecuador) Internship Management Platform built with Flask.

## Overview

The backend manages student internship applications, tutor assignments, appointments, and file storage using Cloudflare R2. It provides authentication via JWT tokens and integrates with PostgreSQL for data persistence.

## Tech Stack

- **Framework**: Flask 2.x
- **Database**: PostgreSQL (via Supabase or Docker)
- **Authentication**: JWT (Flask-JWT-Extended)
- **ORM**: SQLAlchemy + Flask-SQLAlchemy
- **Migrations**: Alembic + Flask-Migrate
- **File Storage**: Cloudflare R2 (S3-compatible)
- **Email**: SMTP (Gmail)
- **Task Queue**: Threading (for async email)

## Project Structure

```
backend/
├── app/
│   ├── __init__.py              # Flask app factory
│   ├── extensions.py             # Flask extensions (db, jwt, mail)
│   ├── models.py                # Database models
│   ├── services.py              # Business logic (R2, email)
│   └── routes/
│       ├── auth_routes.py       # User registration/login
│       ├── student_routes.py    # Student applications, profile, tutor requests
│       ├── opportunity_routes.py # Job/internship opportunities
│       └── admin_routes.py      # Admin dashboard, statistics, approvals
├── migrations/                   # Database migration scripts
│   ├── alembic.ini
│   ├── env.py
│   └── versions/
├── config.py                    # Configuration class
├── main.py                      # Entry point
└── requirements.txt             # Python dependencies
```

## Database Models

### User
- `id` (Primary Key)
- `name`, `email`, `password`
- `role` ('student' or 'admin')
- Relations: applications, experiences, certifications, tutor_requests, appointments

### Application
- `id`, `student_id`, `opportunity_id`
- `status` ('Pendiente', 'Aprobada', 'Rechazada')
- `date` (timestamp)
- Links: student profile, opportunity, appointment

### Opportunity
- `id`, `title`, `company`, `description`
- `location`, `deadline`, `vacancies`, `type` ('pasantia', 'practicante')
- `created_at` (timestamp)

### TutorRequest
- `id`, `user_id`, `filename`, `status`
- `assigned_tutor`, `tutor_email`, `memo_filename`
- `date` (timestamp)
- For formalization process

### Appointment
- `id`, `application_id`, `student_id`
- `date`, `time`, `status` ('Agendada')
- Links: application, student

### Experience & Certification
- Student profile data
- `user_id` foreign key

## API Routes

### Authentication (`/api/`)
- `POST /register` - User registration (first user becomes admin)
- `POST /login` - User authentication, returns JWT token

### Students (`/api/student/`, `/api/`)
- `GET /student/my-applications` - List student's applications
- `POST /applications` - Apply to opportunity
- `GET /appointments` - Get student's scheduled appointments
- `POST /appointments` - Schedule appointment
- `POST /experience` - Add work experience
- `POST /certifications` - Add certification
- `POST /tutor-requests` - Submit tutor request with document
- `GET /cv/<student_id>` - Download student CV

### Opportunities (`/api/`)
- `POST /opportunities` - Create (admin only)
- `PUT /opportunities/<id>` - Update (admin only)
- `DELETE /opportunities/<id>` - Delete (admin only)

### Admin (`/api/admin/`)
- `GET /admin/stats` - Dashboard statistics
- `GET /admin/applications` - All student applications
- `PUT /admin/applications/<id>/status` - Update application status
- `GET /admin/tutor-requests` - All tutor requests
- `PUT /admin/tutor-requests/<id>/status` - Approve/reject tutor request
- `POST /admin/tutor-requests/<id>/upload-memo` - Upload tutor memo
- `GET /admin/students/<id>` - Student profile details
- `GET /admin/appointments` - All scheduled appointments
- `GET /admin/daily-report` - Daily internship report

## Services

### Cloudflare R2 (File Storage)
- `upload_file_to_r2(file_obj, folder)` - Upload file to R2
- `get_file_from_r2(filename)` - Download file from R2 (proxy mode)
- CORS-safe file downloads through backend proxy

### Email Service
- `send_email_confirmation()` - Appointment confirmation emails
- `send_welcome_email()` - Welcome email for new users
- Async execution using threading
- UTF-8 encoded, no special characters

## Configuration

Create a `.env` file in the backend directory:

```
# Database
DATABASE_URL=postgresql://user:password@host:5432/uce_db

# JWT
SECRET_KEY=your_secret_key_here

# Email (SMTP)
SMTP_EMAIL=your_email@gmail.com
SMTP_PASSWORD=your_app_password

# Cloudflare R2
R2_ENDPOINT_URL=https://your-account.r2.cloudflarestorage.com
R2_ACCESS_KEY_ID=your_access_key
R2_SECRET_ACCESS_KEY=your_secret_key
R2_BUCKET_NAME=uce-uploads
```

## Installation

### Prerequisites
- Python 3.8+
- PostgreSQL 12+
- Docker & Docker Compose (optional)

### Local Setup

1. Clone repository:
```bash
git clone <repo>
cd backend
```

2. Create virtual environment:
```bash
python -m venv venv
source venv/bin/activate  # On Windows: venv\Scripts\activate
```

3. Install dependencies:
```bash
pip install -r requirements.txt
```

4. Configure `.env` file with your settings

5. Initialize database:
```bash
flask db upgrade
```

6. Run development server:
```bash
python main.py
```

Server runs on `http://localhost:5000`

### Docker Setup

```bash
docker-compose up -d
```

Ensures automatic container networking and volume management.

## Database Migrations

### Create new migration
```bash
flask db migrate -m "Description of changes"
```

### Apply migration
```bash
flask db upgrade
```

### Rollback migration
```bash
flask db downgrade
```

Migrations are managed by Alembic and stored in `migrations/versions/`

## Authentication

JWT tokens are required for protected routes. Include in request headers:

```
Authorization: Bearer <token>
```

Token expires based on configuration (typically 30 days for refresh token).

## Error Handling

API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (missing data)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (insufficient permissions)
- `404` - Not found
- `500` - Server error

All errors include JSON response with error message.

## Development

### Code Style
- Python PEP 8 compliant
- English comments for clarity
- Minimal comments (code is self-documenting)

### Testing
Run tests (if available):
```bash
python -m pytest
```

### Logging
Logs are printed to console:
- ☁️ Cloudflare R2 operations
- 📧 Email sending status
- ❌ Errors and exceptions

## Deployment

### Production Checklist
- [ ] Set `SECRET_KEY` to strong random value
- [ ] Use `DATABASE_URL` pointing to production PostgreSQL
- [ ] Configure R2 credentials for file storage
- [ ] Set up email with production SMTP credentials
- [ ] Disable `debug=True` in `main.py`
- [ ] Use environment variables for all secrets

### Environment Variables
All sensitive data must be in environment variables, never hardcoded.

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check network connectivity

### Email Not Sending
- Verify SMTP credentials
- Ensure Gmail has "Less secure apps" enabled (use app password instead)
- Check mail server configuration in `config.py`

### File Upload to R2 Failed
- Verify R2 credentials and endpoint URL
- Check bucket name is correct
- Ensure IAM permissions allow s3:PutObject

## Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -m "Add new feature"`
3. Push to branch: `git push origin feature/new-feature`
4. Submit pull request

## License

All rights reserved © Universidad Central del Ecuador
