# UCE Internship Platform - Frontend

Modern React-based web application for managing student internships and community service programs at Universidad Central del Ecuador (UCE).

## Overview

The frontend provides separate interfaces for students (apply to opportunities, manage profile) and administrators (review applications, generate reports). Built with modern React patterns including hooks, context, and component-driven architecture.

**Key Features:**
- ✅ Role-based dashboards (Student & Admin)
- ✅ Real-time vacancy tracking with color-coded indicators
- ✅ Modern UI with toast notifications and custom modals
- ✅ Google OAuth integration
- ✅ Excel report generation
- ✅ Responsive design with Tailwind CSS

## Tech Stack

### Core Technologies
- **[React 18](https://react.dev/)** - JavaScript library for building user interfaces
- **[Vite 6](https://vitejs.dev/)** - Next generation frontend build tool
- **[Tailwind CSS 3](https://tailwindcss.com/)** - Utility-first CSS framework
- **[React Router 6](https://reactrouter.com/)** - Declarative routing
- **[TanStack Query (React Query) 5](https://tanstack.com/query/latest)** - Powerful async state management

### Additional Libraries
- **[React Hook Form](https://react-hook-form.com/)** - Performant form validation
- **[React Hot Toast](https://react-hot-toast.com/)** - Beautiful toast notifications
- **[Lucide React](https://lucide.dev/)** - Consistent icon toolkit
- **[Recharts](https://recharts.org/)** - Chart library for dashboards
- **[XLSX (SheetJS)](https://sheetjs.com/)** - Excel file generation
- **[jsPDF](https://github.com/parallax/jsPDF)** - PDF generation for CVs
- **[@react-oauth/google](https://www.npmjs.com/package/@react-oauth/google)** - Google Sign-In integration

## Project Structure

```
fronted/
├── public/                      # Static assets
├── src/
│   ├── components/              # Reusable UI components
│   │   └── Navbar.jsx          # Main navigation bar (role-based)
│   ├── config/
│   │   └── api.js              # Centralized API_URL configuration
│   ├── context/
│   │   └── AuthContext.jsx     # Authentication context provider
│   ├── layouts/
│   │   └── MainLayout.jsx      # Global layout wrapper
│   ├── pages/
│   │   ├── Login.jsx           # Authentication page (811 lines)
│   │   ├── Register.jsx        # User registration (673 lines)
│   │   ├── student/            # Student role pages
│   │   │   ├── StudentDashboard.jsx    # Student home
│   │   │   ├── Opportunities.jsx       # Browse internships/opportunities
│   │   │   ├── MyApplications.jsx      # Track applications
│   │   │   ├── Profile.jsx             # User profile management
│   │   │   ├── useProfile.js           # Profile business logic
│   │   │   └── components/             # Student-specific components (14 files)
│   │   └── panel_control/      # Admin role pages
│   │       ├── AdminDashboard.jsx      # Admin home with stats
│   │       ├── AdminRequests.jsx       # Review applications
│   │       ├── AdminOpportunities.jsx  # Manage job postings
│   │       ├── Postulantes.jsx         # Daily reports (Excel)
│   │       ├── useAdminDashboard.js    # Dashboard logic
│   │       ├── useAdminRequests.js     # Requests management logic
│   │       ├── useAdminOpportunities.js # Opportunities logic
│   │       ├── usePostulantes.js       # Reports logic
│   │       └── components/             # Admin-specific components (21 files)
│   ├── App.jsx                 # Main app with routing
│   ├── main.jsx               # Entry point
│   └── index.css              # Global styles + Tailwind
├── Dockerfile                  # Production container
├── package.json               # Dependencies
└── vite.config.js             # Vite configuration
```

## Architecture Patterns

### 1. Component-Driven Design
Each major page is broken down into:
- **Page Component** - Main view (e.g., `AdminDashboard.jsx`)
- **Custom Hook** - Business logic (e.g., `useAdminDashboard.js`)
- **Sub-components** - Reusable UI pieces (e.g., `AdminStatsGrid.jsx`)

**Benefits:**
- Separation of concerns
- Easier testing
- Code reusability

### 2. Custom Hooks Pattern
Business logic is extracted into custom hooks:
```javascript
// useAdminDashboard.js
export const useAdminDashboard = () => {
  const { data, form, modal } = /* logic */;
  return { data, form, modal };
};
```

### 3. Modern UI Components
- **No native browser dialogs** - Custom modals and toast notifications
- **ConfirmModal** - Reusable confirmation dialog
- **react-hot-toast** - Consistent success/error notifications

## Key Features Explained

### 1. Role-Based Access Control
- **Protected Routes** in `App.jsx` check user role
- Admin-only routes redirect students to dashboard
- Navbar adapts links based on `user.role`

### 2. Vacancy Tracking
Opportunities display real-time vacancy status:
- 🟢 **Green**: 3+ vacancies available
- 🟠 **Orange**: 1-2 vacancies (almost full)
- 🔴 **Red**: 0 vacancies (full)

Button automatically disables when no vacancies remain.

### 3. Excel Report Generation
Admins can export daily approved applicants to Excel:
- Uses `XLSX` library (SheetJS)
- Filters by approval date
- Includes student info, company, tutor status

### 4. Centralized API Configuration
All API calls use `API_URL` from `config/api.js`:
```javascript
export const API_URL = window.location.hostname === 'localhost'
  ? 'http://localhost:5000'
  : `http://${window.location.hostname}:5000`;
```

This prevents hardcoded localhost URLs in production.

### 5. Modern Authentication
- JWT token stored in `localStorage`
- `AuthContext` provides `user`, `login`, `logout`, `authFetch`
- Google OAuth support via `@react-oauth/google`

## Installation & Setup

### Prerequisites
- Node.js 18+ and npm
- Backend API running (see backend README)

### Local Development

1. **Clone repository:**
```bash
git clone <repo>
cd fronted
```

2. **Install dependencies:**
```bash
npm install
```

3. **Configure API URL (optional):**
Edit `src/config/api.js` if needed.

4. **Run development server:**
```bash
npm run dev
```

App runs at `http://localhost:5173`

5. **Build for production:**
```bash
npm run build
```

Output goes to `dist/` folder.

### Docker Setup

Build and run with Docker:
```bash
docker build -t uce-frontend:latest .
docker run -p 5173:5173 uce-frontend:latest
```

Or use Docker Compose (recommended):
```bash
docker-compose up -d
```

## Available Scripts

| Command | Description |
|---------|-------------|
| `npm run dev` | Start development server (HMR enabled) |
| `npm run build` | Build for production |
| `npm run preview` | Preview production build locally |
| `npm run lint` | Run ESLint |

## Routing Structure

### Public Routes
- `/` - Login page
- `/register` - User registration

### Student Routes (Protected)
- `/dashboard` - Student dashboard
- `/practicas` - Internship opportunities (pasantías)
- `/vinculacion` - Community service opportunities
- `/mis-postulaciones` - My applications
- `/perfil` - User profile

### Admin Routes (Protected, admin-only)
- `/dashboard` - Admin dashboard with stats
- `/admin/solicitudes` - Review applications
- `/admin/postulantes` - Export approved applicants (Excel)
- `/admin/ofertas` - Manage job postings
- `/perfil` - Admin profile

## Component Architecture

### Student Pages
Each student page follows this pattern:
- **Page Component** - Renders UI
- **Custom Hook** - Handles data fetching, mutations
- **Sub-components** - Modular UI pieces

**Example: Profile Page**
```
Profile.jsx (95 lines)
├── useProfile.js (237 lines) - Business logic
└── components/
    ├── ProfileHeader.jsx
    ├── ExperienceList.jsx
    ├── EducationList.jsx
    ├── FormalizationList.jsx
    ├── ManagementStats.jsx (for admins)
    └── EditProfileModal.jsx
```

### Admin Pages
Similar pattern with admin-specific components:

**Example: Admin Dashboard**
```
AdminDashboard.jsx (56 lines)
├── useAdminDashboard.js (94 lines) - Stats, mutations
└── components/
    ├── AdminHeader.jsx
    ├── AdminStatsGrid.jsx
    ├── QuickActionsCard.jsx
    ├── TutorWorkloadChart.jsx
    ├── AppointmentsSection.jsx
    ├── ActivityTrendChart.jsx
    └── NewOpportunityModal.jsx
```

## State Management

### TanStack Query (React Query)
All server data is managed with React Query:
```javascript
const { data: opportunities, isLoading } = useQuery({
  queryKey: ['opportunities'],
  queryFn: async () => (await authFetch(`${API_URL}/api/opportunities`)).json()
});
```

**Benefits:**
- Automatic caching
- Background refetching
- Optimistic updates
- Loading/error states

### Context API
Global state (authentication) uses React Context:
- `AuthContext` - User session, login/logout, authenticated fetch

## Styling Guidelines

### Tailwind CSS
All components use Tailwind utility classes:
- **Consistent spacing**: `p-4`, `gap-6`, `mb-8`
- **Color palette**: `slate-*`, `blue-*`, `emerald-*`
- **Shadows**: `shadow-lg`, `shadow-xl`
- **Rounded corners**: `rounded-2xl`, `rounded-xl`

### Common Patterns
- **Cards**: `bg-white rounded-2xl shadow-lg p-6`
- **Buttons**: `bg-slate-900 text-white px-6 py-3 rounded-xl hover:bg-slate-800`
- **Badges**: `bg-blue-100 text-blue-700 px-3 py-1 rounded-full`

## UI/UX Improvements

### Modernization (v10)
All native browser dialogs replaced with:
- ✅ **Custom ConfirmModal** - Consistent confirmation dialogs
- ✅ **react-hot-toast** - Beautiful notifications
- ✅ **Smooth animations** - Tailwind transitions

### Key Components
- **ConfirmModal** - Reusable confirmation dialog
- **OpportunityFormModal** - Create/edit opportunities
- **TutorAssignmentModal** - Assign tutors to students
- **StudentProfileModal** - View student details

## Environment Configuration

### API URL
Configured in `src/config/api.js`:
- **Development**: `http://localhost:5000`
- **Production**: Dynamically detects server IP

### Google OAuth
Add client ID to `Login.jsx`:
```javascript
<GoogleOAuthProvider clientId="YOUR_GOOGLE_CLIENT_ID">
  {/* ... */}
</GoogleOAuthProvider>
```

## Building for Production

### Local Build
```bash
npm run build
```

Output in `dist/` folder.

### Docker Build
```bash
docker build -t gdmuzo/uce-frontend:v10 .
docker push gdmuzo/uce-frontend:v10
```

### Environment Variables
No build-time env vars required. API URL is dynamically configured.

## Deployment

### Docker Deployment

1. **Build image:**
```bash
docker build -t gdmuzo/uce-frontend:v10 .
```

2. **Push to Docker Hub:**
```bash
docker push gdmuzo/uce-frontend:v10
```

3. **Deploy on server:**
```bash
docker pull gdmuzo/uce-frontend:v10
docker run -d -p 5173:5173 gdmuzo/uce-frontend:v10
```

### Production Checklist
- [ ] Set correct API_URL for production
- [ ] Configure Google OAuth client ID
- [ ] Build with `npm run build`
- [ ] Test all routes and protected pages
- [ ] Verify API connectivity
- [ ] Enable HTTPS (recommended)

## Development Guidelines

### Code Style
- Use functional components with hooks
- Extract business logic into custom hooks
- Keep components under 200 lines
- Use descriptive variable names
- Add comments for complex logic only

### Component Organization
```
Page.jsx (UI only)
├── usePage.js (business logic)
└── components/
    ├── Component1.jsx
    └── Component2.jsx
```

### Best Practices
- ✅ Use TanStack Query for server state
- ✅ Extract reusable components
- ✅ Keep custom hooks focused
- ✅ Use TypeScript JSDoc for hints
- ✅ Implement error boundaries

## Troubleshooting

### API Connection Issues
- Verify backend is running on port 5000
- Check `API_URL` in `src/config/api.js`
- Inspect browser network tab for errors
- Ensure CORS is enabled on backend

### Google OAuth Not Working
- Verify client ID in `Login.jsx`
- Check Google Console allowed origins
- Ensure backend `/api/google-login` works

### Build Errors
- Clear node_modules: `rm -rf node_modules && npm install`
- Clear Vite cache: `rm -rf dist && npm run build`
- Check for missing dependencies

### Styling Issues
- Verify Tailwind config is correct
- Check if `index.css` imports Tailwind directives
- Run `npm run build` to see CSS output size

## Performance Optimization

### Code Splitting
Vite automatically code-splits by route:
- Each page is a separate chunk
- Lazy loading for better performance

### Bundle Size
Current optimized build:
- ~500KB gzipped (with all dependencies)
- TanStack Query: ~40KB
- Recharts: ~200KB (only in admin)

### Optimization Tips
- Use `React.memo()` for expensive components
- Implement virtualization for long lists
- Optimize images (WebP format)
- Enable HTTP/2 on server

## Testing

### Manual Testing
1. Test all routes for both roles
2. Verify protected routes redirect correctly
3. Test form validation
4. Check API error handling
5. Test on mobile devices

### Automated Testing
```bash
npm run test  # (when implemented)
```

## Contributing

1. Create feature branch: `git checkout -b feature/new-feature`
2. Follow code style guidelines
3. Test thoroughly
4. Commit with descriptive messages
5. Push and create pull request

## Future Enhancements

- [ ] Add unit tests (Vitest)
- [ ] Implement E2E tests (Playwright)
- [ ] Add PWA support
- [ ] Optimize bundle size further
- [ ] Add dark mode
- [ ] Implement real-time notifications (WebSockets)

## License

All rights reserved © Universidad Central del Ecuador

## Contact

For questions or support, contact the UCE IT department.

---

**Last Updated:** February 2026  
**Current Version:** v10  
**Maintainer:** UCE Development Team
