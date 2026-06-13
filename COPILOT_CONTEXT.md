# COSTLENS AI

## AI-Powered HR Cost Intelligence Platform

### Repository

costlens

### Tagline

Know what your meetings are costing you.

---

# PROJECT OVERVIEW

CostLens AI is an AI-powered HR Cost Intelligence platform that transforms calendar activity into project-level cost insights.

Organizations know their total payroll costs but often cannot answer:

- How much did Project Apollo cost this month?
- Which team consumes the most HR budget?
- Which meetings are expensive but low value?
- Which projects are exceeding allocated budgets?

CostLens AI solves this by:

1. Ingesting calendar meeting data
2. Using AI to attribute meetings to projects
3. Mapping employees to hourly rates
4. Calculating meeting costs
5. Aggregating project-level HR expenditure
6. Detecting anomalies and budget overruns
7. Providing executive dashboards

---

# HACKATHON OBJECTIVE

Build a working prototype in a limited timeframe.

Focus on:

- Excellent UI/UX
- Working AI attribution
- Cost calculation engine
- Visual dashboards
- Executive insights

Do NOT spend time on:

- Authentication
- Complex RBAC
- Real payroll integration
- Real Google OAuth

Use mock data.

---

# TECH STACK

## Frontend

React 19
TypeScript
Vite
TailwindCSS
shadcn/ui
Lucide Icons
Recharts
React Router DOM
React Hook Form
Zod
TanStack Query

## Backend

Node.js
Express.js
TypeScript

## Database

PostgreSQL

ORM:

Prisma

## AI

Google Gemini API

Model:

gemini-2.5-flash

## Deployment

Frontend:
Vercel

Backend:
Render

Database:
Neon PostgreSQL

---

# MONOREPO STRUCTURE

costlens/

apps/
frontend/
backend/

packages/
shared/

docs/

README.md

COPILOT_CONTEXT.md

---

# FOLDER STRUCTURE

apps/frontend/src

components/
pages/
layouts/
hooks/
services/
types/
data/
utils/
routes/

---

apps/backend/src

controllers/
routes/
services/
repositories/
middleware/
config/
utils/
prompts/

---

packages/shared

types/
constants/
schemas/

---

# CORE BUSINESS FLOW

Meeting Data
↓
AI Project Attribution
↓
Employee Cost Mapping
↓
Meeting Cost Calculation
↓
Project Aggregation
↓
Dashboard Analytics
↓
Anomaly Detection

---

# DOMAIN ENTITIES

## Employee

Represents an employee.

Properties:

id
name
email
designation
department
hourlyRate

Example:

{
"id":1,
"name":"John Doe",
"designation":"Software Engineer",
"hourlyRate":1200
}

---

## Project

Represents a project.

Properties:

id
name
code
budget
status

Example:

{
"id":1,
"name":"Apollo",
"code":"APOLLO",
"budget":100000
}

---

## Meeting

Represents a calendar meeting.

Properties:

id
title
description
durationMinutes
meetingDate
projectId
confidenceScore

---

## MeetingParticipant

Properties:

meetingId
employeeId

---

## CostSummary

Properties:

projectId
totalCost
meetingCount
hoursSpent

---

## Anomaly

Properties:

type
severity
description
projectId

---

# DATABASE SCHEMA

Tables:

employees

projects

meetings

meeting_participants

cost_summaries

anomalies

---

# FRONTEND ROUTES

/

Dashboard

---

/meetings

Meeting Explorer

---

/attribution

AI Attribution Playground

---

/projects

Project Cost Analytics

---

/anomalies

Anomaly Detection Center

---

# DASHBOARD REQUIREMENTS

Top KPI Cards:

Total HR Cost

Total Meetings

Active Projects

Cost Overruns

---

Charts:

Cost By Project

Cost By Department

Weekly Cost Trend

Project Utilization

---

Recent Activity Feed

Latest Meetings

Latest Cost Alerts

Latest Anomalies

---

# PAGE 1

Dashboard

Purpose:

Executive overview.

Components:

Metric Cards

Cost Charts

Top Cost Projects

Recent Anomalies

Meeting Trends

---

# PAGE 2

Meetings

Purpose:

Meeting management.

Features:

Search

Filters

Table

Cost breakdown

Project assignment

Confidence score

Columns:

Meeting

Project

Duration

Participants

Cost

Confidence

---

# PAGE 3

AI Attribution

Purpose:

Demonstrate AI capabilities.

Input:

Meeting Title

Meeting Description

Attendees

Output:

Predicted Project

Confidence Score

Reason

Example:

Sprint Planning Apollo

Output:

Project:
Apollo

Confidence:
94%

Reason:
Meeting title references Apollo and attendees belong to Apollo team.

---

# PAGE 4

Projects

Purpose:

Project cost intelligence.

Features:

Project Summary

Budget Usage

Cost Trends

Utilization

Project Details

---

# PAGE 5

Anomalies

Purpose:

Cost monitoring.

Types:

Cost Overrun

Unclassified Meeting

Resource Imbalance

High Cost Meeting

Budget Risk

---

# AI ATTRIBUTION ENGINE

Goal:

Map meetings to projects.

Input:

Meeting Title

Meeting Description

Attendees

Available Projects

Output:

{
"project":"Apollo",
"confidence":94,
"reason":"Meeting title strongly matches Apollo project."
}

---

# GEMINI SYSTEM PROMPT

You are an HR project attribution engine.

Your task is to classify meetings into projects.

Analyze:

- Meeting title
- Description
- Participants

Return JSON:

{
"project":"",
"confidence":0,
"reason":""
}

Only return valid JSON.

---

# COST CALCULATION ENGINE

Formula:

Meeting Cost =
SUM(employee hourly rates)
×
duration hours

Example:

John
1200/hr

Sarah
1800/hr

Duration:
1 hour

Cost:

3000 INR

---

# ANOMALY DETECTION RULES

Rule 1

Budget Exceeded

projectCost > projectBudget

---

Rule 2

Low Confidence Attribution

confidence < 70

---

Rule 3

Expensive Meeting

meetingCost > 10000

---

Rule 4

Resource Imbalance

employeeAllocation > 60%

---

# MOCK DATA

Generate:

20 Employees

5 Projects

100 Meetings

300 Meeting Participants

20 Anomalies

Use realistic names and departments.

---

# DESIGN SYSTEM

Theme:

Modern SaaS

Style:

Clean
Minimal
Executive
Data-heavy

Use:

shadcn/ui

Cards

Tables

Dialogs

Charts

Badges

Progress bars

Alerts

---

# COLOR PALETTE

Primary:
Blue

Success:
Green

Warning:
Amber

Danger:
Red

Neutral:
Slate

---

# RESPONSIVENESS

Support:

Desktop
Tablet
Mobile

Dashboard must remain usable on all screen sizes.

---

# API ENDPOINTS

GET /api/dashboard

GET /api/projects

GET /api/projects/:id

GET /api/meetings

GET /api/anomalies

POST /api/attribution

POST /api/calculate-cost

---

# DELIVERABLES

1. Working React Frontend

2. Node Express Backend

3. PostgreSQL Database

4. AI Attribution using Gemini

5. Dashboard with Charts

6. Cost Intelligence Engine

7. Anomaly Detection

8. README

---

# DEVELOPMENT PRIORITY

Priority 1

Dashboard

Priority 2

Mock Data

Priority 3

AI Attribution

Priority 4

Cost Calculation

Priority 5

Anomalies

Priority 6

Polish UI

---

# IMPORTANT

This is a hackathon project.

Optimize for:

- Demo impact
- Visual appeal
- Clear business value
- Fast development

Prefer working mock implementations over incomplete enterprise integrations.

A polished demo is more valuable than unfinished complex functionality.
