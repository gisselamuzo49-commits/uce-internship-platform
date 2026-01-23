# 🎓 Internship Management Platform - UCE

A comprehensive web-based system designed to automate the management of pre-professional internships and practicums at the Central University of Ecuador (UCE). This platform connects students, companies, and academic tutors in a single, streamlined environment.

## 🚀 Key Features

* **Role-Based Authentication:** Secure login and registration for Students, Tutors, and Administrators.
* **Opportunity Management:** Companies can post internship vacancies, and students can apply directly through the portal.
* **Automated Document Generation:**
    * 📄 **Memorandums:** Automatic generation of PDF assignment memos for tutors.
    * 📊 **Reporting:** Exporting approved applicant data into Excel spreadsheets for administrative control.
* **Real-time Notifications:** Automated email alerts (via Gmail SMTP) for interview scheduling and account registration.
* **Interactive Dashboard:** Real-time statistics and data visualization regarding internship status and quotas.

## 🛠️ Tech Stack

* **Frontend:** React.js (Vite), Tailwind CSS, Lucide Icons.
* **Backend:** Python (Flask), Flask-SQLAlchemy, JWT Authentication.
* **Database:** PostgreSQL 15 (Managed via Docker).
* **Containerization:** Docker & Docker Compose (Multi-container setup).
* **Document Services:** ReportLab (PDF) & Pandas (Excel).

## 📦 Installation and Setup

1.  **Clone the repository:**
    ```bash
    git clone [https://github.com/gisselamuzo49-commits/uce-internship-platform.git](https://github.com/gisselamuzo49-commits/uce-internship-platform.git)
    ```

2.  **Run with Docker:**
    ```bash
    docker-compose up --build
    ```

3.  **Access the Platform:**
    * **Frontend:** `http://localhost:5173`
    * **Backend API:** `http://localhost:5001` (or 5000 depending on configuration)

---
Developed by Gissela M. - UCE 2026