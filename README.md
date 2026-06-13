# CostLens AI

AI-powered HR Cost Intelligence Engine for React Hyderabad x Masters' Union Buildathon.

This repository is built for Problem Statement #1:

HR Cost Intelligence Engine - Calendar-to-cost attribution via AI.

## 1. Problem Statement Context (PS #1)

Organizations run hundreds of meetings every month, but HR cost is usually tracked only as total payroll. CostLens bridges that gap by converting meeting activity into project-level cost insights.

Target outcomes from the problem statement:

- Attribute meetings to projects using AI signals from meeting context
- Map employees to hourly rates
- Compute cost per meeting and per project
- Detect anomalies and cost overrun risks
- Show this in an easy dashboard

## 2. What This Prototype Implements

### Current capabilities

- Dashboard with KPI cards, cost trends, department cost, and recent anomalies
- Meetings explorer with filtering and paginated API support
- AI attribution endpoint with Gemini first, rule-based fallback when API is unavailable
- Cost calculator endpoint for employee set + meeting duration
- Projects analytics view with budget utilization and risk signals
- Anomaly center for budget and attribution quality alerts
- Seeded demo dataset for quick hackathon demos

### Current assumptions for hackathon speed

- Calendar integration is simulated via seeded meeting data (no OAuth in this prototype)
- Employee hourly rates are configured in seed/database data
- Access control and privacy controls are simplified for prototype stage

## 3. Tech Stack

- Frontend: React, TypeScript, Vite, Tailwind, Recharts, React Query
- Backend: Node.js, Express, TypeScript
- Data layer: PostgreSQL + Prisma
- AI attribution: Google Gemini (gemini-2.5-flash)
- Monorepo: npm workspaces

## 4. Monorepo Structure

```text
costlens/
   apps/
      backend/
      frontend/
   packages/
      shared/
```

- apps/backend: REST API, attribution, cost logic, Prisma
- apps/frontend: Dashboard and analytics UI
- packages/shared: Shared types/schemas/constants used by frontend and backend

## 5. Prerequisites

- Node.js 20+ (tested with Node 24)
- npm 10+
- PostgreSQL (local or cloud)

## 6. Environment Setup

Create file:

- apps/backend/.env

You can copy values from apps/backend/.env.example:

```env
DATABASE_URL="postgresql://postgres:password@localhost:5432/costlens"
PORT=3001
NODE_ENV=development
GEMINI_API_KEY=your_gemini_api_key_here
FRONTEND_URL=http://localhost:5173
```

Notes:

- GEMINI_API_KEY is optional for local demos. If missing, attribution still works via rule-based fallback.
- FRONTEND_URL must match your frontend dev URL for CORS.

## 7. Install and Run (End-to-End)

From repository root:

```bash
npm install
```

Initialize database schema:

```bash
npm run db:push --workspace=apps/backend
```

Seed demo data:

```bash
npm run seed
```

Run frontend + backend together:

```bash
npm run dev
```

App URLs:

- Frontend: http://localhost:5173
- Backend health: http://localhost:3001/health
- Swagger UI: http://localhost:3001/api-docs
- Swagger JSON: http://localhost:3001/api-docs/swagger.json

## 8. Useful Scripts

Root scripts:

- npm run dev: run frontend and backend in parallel
- npm run dev:frontend: run only frontend
- npm run dev:backend: run only backend
- npm run build: build shared, backend, frontend
- npm run seed: run backend seed

Backend scripts:

- npm run db:push --workspace=apps/backend
- npm run db:migrate --workspace=apps/backend
- npm run db:generate --workspace=apps/backend
- npm run db:studio --workspace=apps/backend

Frontend scripts:

- npm run build --workspace=apps/frontend
- npm run preview --workspace=apps/frontend

## 9. API Surface

Base URL:

- http://localhost:3001/api

Routes:

- GET /dashboard
- GET /projects
- GET /projects/:id
- GET /meetings
- GET /anomalies
- POST /attribution
- POST /calculate-cost

### Meetings query params

- search
- projectId
- department
- dateFrom
- dateTo
- page
- pageSize

### Attribution request

```json
{
   "title": "Sprint Planning - Apollo",
   "description": "Roadmap and backlog for next sprint",
   "attendees": ["arjun@company.com", "priya@company.com"]
}
```

### Cost calculation request

```json
{
   "employeeIds": [1, 2, 3],
   "durationMinutes": 60
}
```

## 10. Swagger API Docs

Swagger has been added for the backend and is served directly by Express.

- UI: http://localhost:3001/api-docs
- JSON spec: http://localhost:3001/api-docs/swagger.json

Swagger source file:

- apps/backend/src/docs/swagger.json

How to keep docs updated when backend changes:

1. Update the route/controller.
2. Update matching path and schema in apps/backend/src/docs/swagger.json.
3. Restart backend if running in non-watch mode.
4. Verify endpoint in Swagger UI.

## 11. Frontend Pages and What To Demo

- /: Executive dashboard with total HR cost, project spend, trends
- /meetings: Search/filter meetings and inspect derived costs
- /attribution: Test AI mapping from meeting context to project
- /projects: Compare budget vs actual and see utilization risk
- /anomalies: Review flagged patterns (budget, confidence, expensive meetings)

Recommended demo flow:

1. Start at Dashboard and explain KPIs
2. Open Meetings and show filtering by project/department/date
3. Open Attribution and run sample attribution input
4. Open Projects and discuss overrun signals
5. Open Anomalies and explain interventions

## 12. Mapping to PS #1 Requirements

1) Calendar Integration

- Implemented as seeded meeting ingestion in this prototype.
- Next step: Google Calendar and Outlook connectors.

2) AI-Powered Project Attribution

- Implemented via Gemini model prompt + rule fallback.
- Returns project, confidence, and reason.

3) Employee Cost Mapping

- Implemented with employee hourly rates in database.
- Meeting cost computed from participants and duration.

4) Project Cost Dashboard

- Implemented across Dashboard and Projects pages.
- Includes project and department level cost visibility.

5) Anomaly Detection

- Implemented with anomaly records and filters.
- Covers budget exceeded, low confidence, expensive meetings, resource imbalance.

## 13. Data Model Summary

Core entities:

- Employee
- Project
- Meeting
- MeetingParticipant
- CostSummary
- Anomaly

These are defined in:

- apps/backend/prisma/schema.prisma
- packages/shared/src/types/index.ts

## 14. Known Constraints and Trade-offs

- Project status naming is normalized at UI level for display.
- Real calendar APIs are not integrated yet.
- Privacy controls are basic and not production-grade yet.
- Seeded data is optimized for demo realism, not historical correctness.

## 15. Troubleshooting

### Build failure on frontend

```bash
npm run build --workspace=apps/frontend
```

If TypeScript fails, run from root:

```bash
npm install
```

### Database connection issues

- Validate DATABASE_URL in apps/backend/.env
- Ensure PostgreSQL is running
- Re-run db push and seed

```bash
npm run db:push --workspace=apps/backend
npm run seed
```

### CORS errors in browser

- Ensure FRONTEND_URL in backend env matches frontend origin
- Keep frontend on http://localhost:5173 during local dev

## 16. Next Milestones

- Add real Google/Outlook calendar ingestion connectors
- Add confidence threshold workflow for human review
- Add role-based salary visibility controls
- Add per-team and per-role drill-down in analytics
- Add scheduled daily recomputation pipeline

## 17. Buildathon Alignment Note

This repository is focused on Problem Statement #1 only.

The implementation emphasizes:

- business clarity of HR cost visibility,
- practical AI attribution with fallback,
- dashboards that support quick executive decisions,
- and demo readiness under hackathon constraints.
