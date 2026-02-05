# UCE Internship Platform - Backend

REST API backend for the UCE (Universidad Central del Ecuador) Internship Management Platform built with Flask.

## Overview

The backend manages student internship applications, tutor assignments, appointments, and file storage using Cloudflare R2. It provides authentication via JWT tokens and integrates with PostgreSQL for data persistence.

**Key Features:**
- ✅ Role-based access control (Students & Admins)
- ✅ Vacancy limit validation (prevents over-application)
- ✅ Ecuador timezone support (UTC-5)
- ✅ Cloudflare R2 file storage with proxy downloads
- ✅ Automated email notifications
- ✅ Daily internship reports

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
│   ├── extensions.py            # Flask extensions (db, jwt, mail)
│   ├── models.py                # Database models
│   ├── services.py              # Business logic (R2, email)
│   └── routes/
│       ├── auth_routes.py       # User registration/login (176 lines)
│       ├── student_routes.py    # Student applications, profile (208 lines)
│       ├── opportunity_routes.py # Job/internship opportunities (148 lines)
│       └── admin_routes.py      # Admin dashboard, statistics (310 lines)
├── migrations/                  # Database migration scripts
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
- `status` ('Pendiente', 'Aprobado', 'Rechazado')
- `date` (timestamp)
- `approval_date` (timestamp, Ecuador timezone UTC-5)
- Links: student profile, opportunity, appointment

### Opportunity
- `id`, `title`, `company`, `description`
- `location`, `deadline`, `vacancies`, `type` ('pasantia', 'vinculacion')
- `created_at` (timestamp)
- **New:** `approved_applications` and `available_vacancies` in API response

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
- `POST /google-login` - Google OAuth authentication

### Students (`/api/`, `/api/student/`)
- `GET /student/my-applications` - List student's applications
- `POST /applications` - Apply to opportunity (validates vacancy limits)
- `GET /appointments` - Get student's scheduled appointments
- `POST /appointments` - Schedule appointment
- `POST /experience` - Add work experience
- `DELETE /experience/<id>` - Remove work experience
- `POST /certifications` - Add certification
- `DELETE /certifications/<id>` - Remove certification
- `POST /tutor-requests` - Submit tutor request with document
- `GET /tutor-requests` - Get student's tutor requests
- `GET /cv/<student_id>` - Download student CV (proxy mode)
- `GET /profile/<user_id>` - Get user profile

### Opportunities (`/api/`)
- `GET /opportunities` - List all opportunities (public)
- `GET /opportunities/<id>` - Get opportunity details
- `POST /opportunities` - Create (admin only)
- `PUT /opportunities/<id>` - Update (admin only)
- `DELETE /opportunities/<id>` - Delete (admin only)
- `GET /opportunities/<id>/applications` - Get applicants (admin only)

### Admin (`/api/admin/`)
- `GET /admin/stats` - Dashboard statistics (applications, students, tutor workload)
- `GET /admin/applications` - All student applications
- `PUT /admin/applications/<id>/status` - Update application status (sets approval_date in Ecuador timezone)
- `GET /admin/tutor-requests` - All tutor requests
- `PUT /admin/tutor-requests/<id>/status` - Approve/reject tutor request
- `POST /admin/tutor-requests/<id>/upload-memo` - Upload tutor memo PDF
- `GET /admin/students/<id>` - Student profile details (experiences, certifications)
- `GET /admin/appointments` - All scheduled appointments
- `GET /admin/daily-report?date=YYYY-MM-DD` - Daily internship report (Excel export)

### File Downloads (Proxy Mode)
- `GET /api/uploads/<filename>` - Universal file download from R2 (CORS-safe)

## Services

### Cloudflare R2 (File Storage)
- `upload_file_to_r2(file_obj, folder)` - Upload file to R2
  - Supports folders: `cvs/`, `tutor_requests/`, `memos_admin/`
  - Returns R2 filename for database storage
- `get_file_from_r2(filename)` - Download file from R2 (proxy mode)
  - CORS-safe file downloads through backend proxy
  - Prevents XML signature errors

### Email Service
- `send_email_confirmation()` - Appointment confirmation emails
- `send_welcome_email()` - Welcome email for new users
- Async execution using threading (non-blocking)
- UTF-8 encoded, no special characters

## Key Features Explained

### 1. Vacancy Validation
When a student applies to an opportunity:
1. Backend counts **approved applications** for that opportunity
2. If `approved_count >= vacancies`, application is **rejected**
3. Pending or rejected applications **don't consume** vacancy slots
4. Frontend displays available vacancies in real-time with color coding

### 2. Ecuador Timezone (UTC-5)
- `approval_date` is stored in **Ecuador local time** (UTC-5)
- Prevents timezone mismatch in daily reports
- Students approved late in the day appear in correct date's report

### 3. Role-Based Access
- **Admin routes** protected with `check_admin()` function
- **JWT tokens** required for all protected endpoints
- First registered user automatically becomes admin

### 4. File Storage (Cloudflare R2)
- All files uploaded to R2 bucket
- Proxy downloads through backend to avoid CORS issues
- Supports CVs, tutor requests, and memo PDFs

## Configuration

Create a `.env` file in the backend directory:

```env
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

Build and run with Docker:
```bash
docker build -t uce-backend:latest .
docker run -p 5000:5000 --env-file .env uce-backend:latest
```

Or use Docker Compose (recommended):
```bash
docker-compose up -d
```

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

Token expires based on configuration (typically 30 days).

## Error Handling

API returns standard HTTP status codes:
- `200` - Success
- `201` - Created
- `400` - Bad request (missing data, validation failed, no vacancies)
- `401` - Unauthorized (invalid credentials)
- `403` - Forbidden (insufficient permissions, not admin)
- `404` - Not found
- `500` - Server error

All errors include JSON response with error message:
```json
{
  "error": "No hay vacantes disponibles"
}
```

## Development

### Code Style
- Python PEP 8 compliant
- English comments for clarity
- Modular design with blueprints
- Each route file has single responsibility

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
- 🔄 Database migrations

## Deployment

### Production Checklist
- [ ] Set `SECRET_KEY` to strong random value
- [ ] Use `DATABASE_URL` pointing to production PostgreSQL
- [ ] Configure R2 credentials for file storage
- [ ] Set up email with production SMTP credentials
- [ ] Disable `debug=True` in `main.py`
- [ ] Use environment variables for all secrets
- [ ] Enable HTTPS (SSL/TLS)
- [ ] Configure CORS for production frontend domain

### Docker Deployment

1. Build production image:
```bash
docker build -t gdmuzo/uce-backend:v3 .
```

2. Push to Docker Hub:
```bash
docker push gdmuzo/uce-backend:v3
```

3. Deploy on server:
```bash
docker pull gdmuzo/uce-backend:v3
docker run -d -p 5000:5000 --env-file .env gdmuzo/uce-backend:v3
```

### Environment Variables
All sensitive data must be in environment variables, never hardcoded.

## Troubleshooting

### Database Connection Error
- Verify `DATABASE_URL` is correct
- Ensure PostgreSQL is running
- Check network connectivity
- Test connection: `psql $DATABASE_URL`

### Email Not Sending
- Verify SMTP credentials in `.env`
- Use Gmail App Password (not account password)
- Check mail server configuration in `config.py`
- Ensure threading is working (check console logs)

### File Upload to R2 Failed
- Verify R2 credentials and endpoint URL
- Check bucket name is correct
- Ensure IAM permissions allow `s3:PutObject` and `s3:GetObject`
- Test R2 connection with AWS CLI

### Vacancy Validation Not Working
- Check that `Opportunity.to_dict()` returns `available_vacancies`
- Verify frontend receives the field
- Ensure only "Aprobado" status counts toward limit

### Timezone Issues
- Verify `approval_date` is being set in Ecuador timezone (UTC-5)
- Check daily report filtering uses `func.date()` for date comparison
- Test with different dates to confirm timezone handling

## API Testing

### Using cURL

**Login:**
```bash
curl -X POST http://localhost:5000/api/login \
  -H "Content-Type: application/json" \
  -d '{"email":"admin@uce.edu.ec","password":"password123"}'
```

**Get Stats (requires token):**
```bash
curl -X GET http://localhost:5000/api/admin/stats \
  -H "Authorization: Bearer <your-token>"
```

**Apply to Opportunity:**
```bash
curl -X POST http://localhost:5000/api/applications \
  -H "Authorization: Bearer <your-token>" \
  -H "Content-Type: application/json" \
  -d '{"opportunity_id": 1}'
```

## Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Commit changes: `git commit -m "Add new feature"`
3. Push to branch: `git push origin feature/new-feature`
4. Submit pull request

## License

All rights reserved © Universidad Central del Ecuador

## Contact

For questions or support, contact the UCE IT department.

---

**Last Updated:** February 2026  
**Current Version:** v3.0  
**Maintainer:** UCE Development Team
