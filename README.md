# HRM

A production-grade Human Resource Management System built on the MERN stack (MongoDB, Express, React, Node.js). Covers the full employee lifecycle from recruitment to exit, with role-based access control, interactive dashboards, and Docker deployment.

## Features

### Core Modules
- **Dashboard** — Real-time stats (employee count, assets, open tickets, pending exits), interactive charts (PolarArea, Doughnut, Line, Bar), clickable stat cards with animated counters, pending leave and on-leave tables
- **Admin** — Users, Job Titles, Pay Grades, Work Shifts, Organization, Roles & Permissions
- **PIM (Personal Information Management)** — Employee list with CRUD, add employee with form validation, supervisor lookup
- **Leave** — Leave requests, types, entitlements, holidays
- **Time** — Timesheets, attendance tracking
- **Recruitment** — Vacancies, candidates
- **Performance** — Performance reviews
- **Training** — Course management, training records, enrollment
- **Assets** — Asset inventory (laptops, monitors, phones, etc.), assignment/return tracking, my-assets view
- **Help Desk** — Ticket management with priority/status state machine (open → assigned → in_progress → resolved → closed), category color-coding
- **Exit Management** — Resignation/termination/retirement requests, clearance checklist (IT, Finance, HR, Admin), Full & Final settlement with employee deactivation
- **Directory** — Employee directory
- **Buzz** — Social feed with posts and comments
- **Maintenance** — System maintenance tools

### Platform Features
- **Role-Based Access Control** — Admin (full access) and ESS (Employee Self-Service) roles with granular module-level permissions
- **Global Search** — Unified search across employees, users, courses, candidates, assets, tickets, and exit requests
- **Collapsible Sidebar** — Hamburger toggle with localStorage persistence, tooltips on collapsed state
- **Interactive Dashboard** — 9 stat cards + 4 chart types + real-time data
- **Responsive DataTable** — Reusable component with sorting, pagination, search, column visibility toggle, CSV export, skeleton loading
- **Dark/Light Theme** — Full theme support via ThemeContext
- **Error Boundaries** — Catch-and-recover UI crash protection
- **Code Splitting** — All 30+ pages lazy-loaded via `React.lazy` + `Suspense`
- **React Query** — `useApiQuery`/`useApiMutation` wrappers for data fetching
- **Security** — Helmet, rate limiting (200/15min global, 50/15min login), CORS, JWT auth with token refresh, input validation (express-validator)
- **Docker Deployment** — Multi-service setup with MongoDB 7, Nginx reverse proxy, health checks, graceful shutdown

## Tech Stack

| Layer    | Technology                                      |
| -------- | ----------------------------------------------- |
| Frontend | React 18, React Router v6, Chart.js, Axios, React Query, React Icons |
| Backend  | Node.js, Express 4, Mongoose 8, JWT, bcryptjs   |
| Database | MongoDB 7                                       |
| Testing  | Playwright (E2E), Page Object pattern            |
| DevOps   | Docker, Docker Compose, Nginx                    |

## Getting Started

### Prerequisites
- Node.js 18+
- MongoDB 7 (local or Docker)
- npm

### Local Development

```bash
# Install dependencies
npm install
cd server && npm install
cd ../client && npm install
cd ..

# Copy environment file
cp server/.env.example server/.env  # or create server/.env manually

# Seed the database with sample data
npm run seed

# Start both server (port 5000) and client (port 3000) concurrently
npm run dev
```

Default credentials after seeding:
| Username | Password  | Role  |
| -------- | --------- | ----- |
| admin    | admin123  | Admin |
| john     | john123   | ESS   |
| jane     | jane123   | ESS   |

### Docker Deployment

```bash
# Build and start all services
docker-compose up --build -d

# Seed database
docker-compose exec server node seeds/seed.js

# Access at http://localhost
```

### Running Tests

```bash
# Install Playwright browsers
npm run test:e2e:install

# Run E2E tests (server and client must be running)
npm run test:e2e
```

## Project Structure

```
├── client/                  # React frontend
│   └── src/
│       ├── components/       # Common components (DataTable, Layout, ErrorBoundary, etc.)
│       ├── context/          # Auth, Theme, Toast, Query context providers
│       ├── hooks/            # useApi, useFetch custom hooks
│       ├── pages/            # 16 module page directories
│       ├── services/         # Axios API client with interceptor
│       ├── styles/           # CSS stylesheets
│       └── utils/            # Validation helpers
├── server/                   # Express backend
│   ├── controllers/          # 15 module controllers
│   ├── middleware/            # Auth, validation, error handler
│   ├── models/               # 25 Mongoose models
│   ├── routes/               # API routes
│   ├── seeds/                # Database seed script
│   └── utils/                # Response helpers, env validation
├── e2e/                      # Playwright E2E tests
│   ├── pages/                # Page Objects (LoginPage, LogoutPage)
│   └── tests/                # Test specs
├── docker-compose.yml        # Multi-service Docker setup
├── Dockerfile.server         # Backend Docker image
├── Dockerfile.client         # Frontend Docker image
├── nginx.conf                # Nginx reverse proxy config
└── package.json              # Root workspace scripts
```

## API Overview

| Prefix              | Module       |
| ------------------- | ------------ |
| `GET /api/health`   | Health check |
| `/api/auth`         | Authentication |
| `/api/admin`        | Admin panel |
| `/api/pim`          | Employee management |
| `/api/leave`        | Leave management |
| `/api/time`         | Timesheets & attendance |
| `/api/recruitment`  | Vacancies & candidates |
| `/api/training`     | Courses & training records |
| `/api/performance`  | Performance reviews |
| `/api/assets`       | Asset inventory |
| `/api/helpdesk`     | Ticket management |
| `/api/exit`         | Exit requests |
| `/api/dashboard`    | Stats, charts & global search |
| `/api/directory`    | Employee directory |
| `/api/buzz`         | Social feed |
| `/api/roles`        | Role & permission management |

## Environment Variables

Create `server/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/indianic_hrm
JWT_SECRET=your_jwt_secret_key
JWT_EXPIRE=7d
CLIENT_URL=http://localhost:3000
NODE_ENV=development
```
