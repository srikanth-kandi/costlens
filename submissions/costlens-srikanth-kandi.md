# CostLens AI - HR Cost Intelligence Engine

## Project Overview

**CostLens AI** is a comprehensive HR Cost Intelligence platform designed to help organizations track, analyze, and optimize meeting costs and resource allocation. The platform leverages AI-powered attribution to intelligently assign meetings to projects, providing actionable insights into organizational expenses.

### Live Deployment
- **Frontend**: https://costlens.srikanthkandi.dev
- **Backend API**: https://costlens-backend.vercel.app
- **GitHub Repository**: https://github.com/Srikanth-Kandi/costlens

---

## Technology Stack

### Frontend
- **React 18** with TypeScript (strict mode)
- **Vite 5** for fast bundling and development
- **React Router v6** for SPA routing
- **TanStack Query (React Query)** for server state management
- **Tailwind CSS** for styling
- **Shadcn/ui** components for consistent UI
- **Recharts** for data visualization
- **Lucide React** for icons
- **Axios** for HTTP client

### Backend
- **Node.js + Express.js** with TypeScript (strict mode)
- **Prisma ORM v5** for database management
- **PostgreSQL** (hosted on Render)
- **Google Generative AI SDK** for meeting attribution
- **Zod** for schema validation
- **Helmet** for security headers
- **CORS** middleware for cross-origin requests
- **Morgan** for HTTP request logging

### Database
- **PostgreSQL** on Render
- **Prisma migrations** for schema management
- **Automated seed data** for development

### Deployment
- **Vercel** for frontend and backend hosting
- **Render PostgreSQL** for database persistence
- **npm workspaces** for monorepo structure

---

## Key Features

### 1. **Dashboard Analytics**
- Real-time visualization of key metrics
- Meeting cost summaries by project and department
- Top projects and employees by cost
- Interactive charts and graphs
- Monthly cost trends

### 2. **Meeting Management**
- CRUD operations for meetings
- Participant cost calculation (hourly rates × duration)
- Meeting attribution to projects
- Confidence scoring system
- Full-text search and filtering

### 3. **AI-Powered Attribution** 
- Google Gemini integration for intelligent meeting-to-project mapping
- Rule-based fallback when AI is unavailable
- Confidence scoring for attribution accuracy
- Learning from user corrections
- Graceful degradation with database resilience

### 4. **Project Management**
- Project CRUD with budget tracking
- Status management (planning, active, completed)
- Team size and timeline tracking
- Cost summaries and anomaly detection
- Transaction-based deletion with cascade cleanup

### 5. **Employee Management**
- Employee directory with hourly rates
- Department and designation tracking
- Avatar support for team visibility
- Bulk operations for admin
- Email validation and unique constraints

### 6. **Anomaly Detection**
- Automated detection of unusual meeting patterns
- Department and cost-based anomaly scoring
- Visual anomaly badges in UI
- Actionable insights for cost optimization

### 7. **Admin Dashboard**
- Comprehensive HR data management interface
- Multi-section CRUD UI (Employees, Projects, Meetings)
- Form validation and error handling
- Pagination and search filters
- Bulk operations support

### 8. **Security & Authentication**
- Login/logout functionality with session management
- Protected routes for authorized users
- CORS policy enforcement with production domain
- Helmet security headers
- Error handling with operational vs. unknown errors

---

## Architecture

### Monorepo Structure
```
costlens/
├── apps/
│   ├── backend/          # Express API server
│   │   ├── src/
│   │   │   ├── index.ts              # Entry point with middleware
│   │   │   ├── config/database.ts    # Prisma singleton
│   │   │   ├── controllers/          # Request handlers
│   │   │   ├── routes/               # Express routes
│   │   │   ├── middleware/           # CORS, error handling
│   │   │   └── prompts/              # AI prompt templates
│   │   ├── prisma/
│   │   │   ├── schema.prisma         # Database schema
│   │   │   └── seed.ts               # Seed data
│   │   └── package.json
│   │
│   └── frontend/         # React SPA
│       ├── src/
│       │   ├── App.tsx               # Main routing component
│       │   ├── pages/                # Route components
│       │   ├── components/           # Reusable UI components
│       │   ├── hooks/useApi.ts       # React Query hooks
│       │   ├── services/api.ts       # Axios client
│       │   └── layouts/              # Layout components
│       ├── vite.config.ts            # Code splitting config
│       ├── vercel.json               # SPA routing config
│       └── package.json
│
└── packages/
    └── shared/           # Shared types and constants
        ├── src/
        │   ├── types/index.ts        # TypeScript contracts
        │   ├── schemas/index.ts      # Zod validation
        │   └── constants/index.ts    # Shared constants
        └── package.json
```

### Data Flow
1. **Frontend** → React Query hooks call Axios client
2. **Axios** → HTTP requests to backend API
3. **Backend** → Express routes dispatch to controllers
4. **Controllers** → Business logic with Prisma ORM
5. **Database** → PostgreSQL persists data
6. **Response** → JSON returned to frontend
7. **Frontend** → React Query caches and React rerenders

### Error Handling
- Backend: Centralized error middleware logs all errors
- Production: Generic error messages for security
- Frontend: Try-catch blocks with user-friendly notifications
- Database: Connection validation at startup with health check

### Performance Optimizations
- **Frontend**:
  - Lazy-loaded routes with React.Suspense
  - Manual code splitting for vendor chunks
  - Separate bundles for React, Query, Charts, Icons, UI utils
  - React Query caching and stale-while-revalidate
  
- **Backend**:
  - Prisma global singleton for serverless functions
  - Connection pooling on Render
  - Transaction-based operations for data consistency
  - Indexed database queries for fast lookups

---

## API Endpoints

### Dashboard
- `GET /api/dashboard` - Fetch dashboard metrics

### Projects
- `GET /api/projects` - List all projects
- `POST /api/projects` - Create project
- `PUT /api/projects/:id` - Update project
- `DELETE /api/projects/:id` - Delete project (cascades)

### Meetings
- `GET /api/meetings` - List meetings with filters
- `POST /api/meetings` - Create meeting
- `PUT /api/meetings/:id` - Update meeting
- `DELETE /api/meetings/:id` - Delete meeting

### Employees
- `GET /api/employees` - List all employees
- `POST /api/employees` - Create employee
- `PUT /api/employees/:id` - Update employee
- `DELETE /api/employees/:id` - Delete employee

### Attribution (AI)
- `GET /api/attribution/prefill` - Get AI-suggested project attribution
- `POST /api/attribution/calculate` - Calculate meeting costs

### Health
- `GET /api/health` - Database connection status

---

## Setup & Installation

### Prerequisites
- Node.js 18+
- npm 9+
- PostgreSQL 12+ (or use Render hosted)

### Local Development

1. **Clone repository**
   ```bash
   git clone https://github.com/Srikanth-Kandi/costlens.git
   cd costlens
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Configure environment**
   
   Backend `.env`:
   ```
   DATABASE_URL="postgresql://user:password@localhost:5432/costlens"
   PORT=3001
   NODE_ENV=development
   GEMINI_API_KEY=your_api_key_here
   FRONTEND_URL=http://localhost:5173
   ```

   Frontend `.env.local`:
   ```
   VITE_API_BASE_URL=http://localhost:3001/api
   ```

4. **Setup database**
   ```bash
   npm run --workspace=apps/backend db:push
   npm run --workspace=apps/backend db:seed
   ```

5. **Run development servers**
   ```bash
   # Terminal 1: Backend
   npm run dev --workspace=apps/backend
   
   # Terminal 2: Frontend
   npm run dev --workspace=apps/frontend
   ```

6. **Access application**
   - Frontend: http://localhost:5173
   - Backend API: http://localhost:3001
   - Swagger UI: http://localhost:3001/api-docs (dev only)

### Production Deployment

**Vercel (Frontend & Backend)**
1. Connect GitHub repository to Vercel
2. Set environment variables in Vercel dashboard
3. Backend deploys as serverless functions
4. Frontend static assets cached globally

**Database (Render PostgreSQL)**
1. Create PostgreSQL instance on Render
2. Set `DATABASE_URL` in environment
3. Run migrations: `prisma migrate deploy`
4. Seed data: `prisma db seed`

---

## Build & Test

```bash
# Build all packages
npm run build --workspace=packages/shared
npm run build --workspace=apps/backend
npm run build --workspace=apps/frontend

# Lint frontend
npm run lint --workspace=apps/frontend

# Type check
npm run build --workspace=apps/backend
npm run build --workspace=apps/frontend

# Production build
npm run build --workspace=apps/frontend
```

---

## Key Design Decisions

### 1. **Monorepo with npm workspaces**
   - Shared types between frontend and backend
   - Single version control for entire application
   - Coordinated releases and dependency management

### 2. **Prisma ORM**
   - Type-safe database operations
   - Automatic migrations
   - Strong relationship management
   - Seed data support

### 3. **React Query for state management**
   - Server state vs. UI state separation
   - Automatic caching and refetching
   - Optimistic updates
   - Reduced prop drilling

### 4. **AI-powered attribution with fallback**
   - Google Gemini for intelligent project mapping
   - Rule-based fallback for resilience
   - Graceful degradation when services unavailable
   - Database validation at startup

### 5. **Lazy-loaded routes**
   - Faster initial page load
   - Code splitting per route
   - Manual chunk splitting for vendors
   - Suspense boundaries for loading states

### 6. **TypeScript strict mode**
   - Catch type errors at compile time
   - Better IDE support and autocomplete
   - Explicit type annotations for clarity
   - Safer refactoring

---

## Challenges & Solutions

### Challenge 1: Prisma Client Generation on Vercel
**Problem**: TypeScript compilation failed because Prisma client wasn't generated
**Solution**: Added `"prebuild": "prisma generate"` to generate client before tsc

### Challenge 2: SPA Routing 404s
**Problem**: Direct URL navigation (e.g., /admin) returned 404
**Solution**: Created `vercel.json` with SPA rewrite rule

### Challenge 3: AI Attribution Resilience
**Problem**: API failed if Gemini API key missing or database unavailable
**Solution**: Added try-catch with fallback to rule-based attribution

### Challenge 4: Bundle Size Warning
**Problem**: Frontend bundle exceeded 500KB after minification
**Solution**: Implemented manual code splitting for React, Query, Charts, Icons

### Challenge 5: Environment Variable Access
**Problem**: Frontend couldn't access VITE_API_BASE_URL at runtime
**Solution**: Added vite-env.d.ts type declarations for import.meta.env

---

## Future Roadmap

1. **Advanced Analytics**
   - Predictive cost modeling
   - Department-level budgeting
   - Expense forecasting

2. **Integration**
   - Calendar sync (Google Calendar, Outlook)
   - Email auto-detection
   - Slack notifications

3. **Reporting**
   - Custom report builder
   - PDF exports
   - Scheduled email digests

4. **Machine Learning**
   - Improved attribution accuracy over time
   - Anomaly pattern learning
   - Cost optimization recommendations

5. **Multi-tenant**
   - Organization management
   - Role-based access control
   - Audit logging

---

## Development Team

- **Developer**: Srikanth Kandi
- **Architecture & Implementation**: Full-stack TypeScript
- **Deployment**: Vercel + Render

---

## License

This project is part of the Buildathon program and follows the specified licensing terms.

---

## Contributing

See [CONTRIBUTING.md](../CONTRIBUTING.md) for contribution guidelines.

---

## Support

For issues, questions, or feature requests:
- GitHub Issues: https://github.com/Srikanth-Kandi/costlens/issues
- Email: [Contact information]

---

**Last Updated**: January 2025
**Live Demo**: https://costlens.srikanthkandi.dev
