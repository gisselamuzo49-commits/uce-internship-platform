# UCE Internship Platform - Frontend

This is the frontend repository for the UCE Internship Platform, a web application designed to manage student internships and community service programs.

## 🚀 Technologies

This project is built using the following core technologies:

- **[React](https://react.dev/)**: JavaScript library for building user interfaces.
- **[Vite](https://vitejs.dev/)**: Next Generation Frontend Tooling.
- **[Tailwind CSS](https://tailwindcss.com/)**: A utility-first CSS framework for rapid UI development.
- **[React Router](https://reactrouter.com/)**: Standard routing library for React.
- **[TanStack Query (React Query)](https://tanstack.com/query/latest)**: Powerful asynchronous state management.
- **[React Hook Form](https://react-hook-form.com/)**: Performant, flexible and extensible forms with easy validation.
- **[Lucide React](https://lucide.dev/)**: Beautiful & consistent icon toolkit.

### Additional Libraries
- **Recharts**: Redefined chart library meant to be deployed with React examples.
- **XLSX**: SheetJS Spreadsheet data parser and writer.
- **jsPDF**: Client-side PDF generation.

## 📂 Project Structure

The source code is organized as follows:

- **`src/components`**: Reusable UI components (Navbar, etc.).
- **`src/context`**: React Context providers (AuthContext).
- **`src/layouts`**: Global layout wrappers.
- **`src/pages`**: Application views/pages.
  - **`student/`**: Views specific to the Student role (Profile, Opportunities, etc.).
  - **`panel_control/`**: Views specific to the Admin role (Dashboard, Requests, etc.).
  - **`Login.jsx` / `Register.jsx`**: Authentication pages.
- **`src/config`**: Configuration files.

## ✨ Key Features

### Authentication & Authorization
- Secure Login and Registration.
- Role-based access control (Student vs. Admin).
- Protected Routes to prevent unauthorized access.

### 🎓 Student Module
- **Dashboard**: Overview of current status.
- **Opportunities**: View and apply for Internships (*Pasantías*) and Community Service (*Vinculación*).
- **My Applications**: Track the status of submitted applications.
- **Profile**: Manage user profile information.

### 🛡️ Admin Module
- **Dashboard**: KPIs and system overview.
- **Requests Management**: Review and manage student applications.
- **Opportunities Management**: Create and edit internship/service offers.
- **Reports**: Export approved applicant data to Excel.

## 🛠️ Installation & Setup

1.  **Clone the repository**
    ```bash
    git clone <repository-url>
    cd fronted
    ```

2.  **Install dependencies**
    ```bash
    npm install
    ```

3.  **Run the development server**
    ```bash
    npm run dev
    ```
    The application will be available at `http://localhost:5173`.

4.  **Build for production**
    ```bash
    npm run build
    ```

5.  **Linting**
    ```bash
    npm run lint
    ```

## 📜 Scripts

- `dev`: Starts the development server.
- `build`: Builds the app for production.
- `lint`: Runs ESLint to check for code quality.
- `preview`: Locally preview the production build.
