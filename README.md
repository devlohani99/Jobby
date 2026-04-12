# Jobby

Jobby is a full-stack recruitment platform that lets employers post openings, track applicants, and gives job seekers a personalized board that blends internal listings with real-time remote jobs from external APIs. The project is split into a Vite + React frontend and an Express + MongoDB backend, with automated health checks for Render and deploy-ready configs for Vercel.

## Tech Stack

| Layer      | Technology |
|------------|------------|
| Frontend   | React 19, Vite, Tailwind utility classes |
| Backend    | Node 18+, Express 4, Mongoose 8 |
| Auth       | JWT + bcryptjs |
| Storage    | MongoDB Atlas (or any MongoDB 6+) |
| APIs       | Remotive, Serper (Google SERP) |
| Tooling    | Axios, Multer, Nodemon |

## Feature Highlights

### Job Seekers
- Unified job search with keyword, location, employment type, and work-style filters.
- Toggle between internal (database) jobs and remote roles sourced from Remotive + Serper.
- Realtime refresh: interval polling plus a browser event when new jobs are posted.
- Application history with status badges (submitted, selected, rejected).
- Smart fallbacks that keep showing relevant suggestions even if third-party APIs fail.

### Employers
- Role-gated dashboard with KPI cards (jobs, applications, views, response rate).
- Quick “Post New Job” modal with salary + location normalization and server-side validation.
- Manage jobs (edit, soft delete, stats) and inspect applicant summaries per posting.
- Automatic refresh when new postings are created from any session.

### Platform
- JWT-authenticated APIs with layered role authorization middleware.
- Rich job filters handled server-side (text search, location regex, salary bounds, experience, pagination, sorting).
- Remote job aggregator that merges external APIs, caches results, and falls back to curated mock data when needed.
- Market intelligence endpoints that transform Serper search results into insights (salary trends, demand, skills, top employers) and power the dashboard widget.
- Health endpoint (`/api/health`) for Render/Vercel uptime checks.

## Project Structure

```
Jobby/
├── backend/         # Express API, Mongo models, controllers, routes
│   ├── controllers/
│   ├── middleware/
│   ├── model/
│   ├── routes/
│   ├── services/
│   └── server.js
├── frontend/        # Vite + React app
│   ├── src/
│   │   ├── components/
│   │   └── services/
│   └── vite.config.js
├── render.yaml      # Render service config sample
└── vercel.json      # Vercel deployment settings
```

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|----------|-------------|
| `PORT` | API port (defaults to 5000) |
| `MONGODB_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret for signing access tokens |
| `SERPER_API_KEY` | Key for google.serper.dev search API |
| `FRONTEND_ORIGIN` | (Optional) Comma-separated additional CORS origins |

### Frontend (`frontend/.env`)

| Variable | Description |
|----------|-------------|
| `VITE_API_BASE_URL` | Points to the running backend (e.g., `http://localhost:5000/api`) |

> Never commit secrets. Use `.env.local` files or platform-specific secret managers in production.

## Getting Started

### Prerequisites
- Node.js 18+
- npm 9+
- MongoDB instance (local or Atlas)
- Serper API key (optional, required for live Google SERP data)

### Clone & Install

```bash
# Clone the repository
git clone https://github.com/devlohani99/Jobby.git
cd Jobby

# Install backend deps
cd backend
npm install

# Install frontend deps
cd ../frontend
npm install
```

### Run the Backend

```bash
cd backend
cp .env.example .env   # create and fill in values if you maintain an example file
npm run dev            # or npm start for production mode
```

The API boots on `http://localhost:5000`. Confirm with `GET /api/health`.

### Run the Frontend

```bash
cd frontend
npm run dev
```

Vite serves the UI on `http://localhost:5173` (or next free port). Set `VITE_API_BASE_URL` to your backend origin if it differs.

### Recommended Workflow
1. Start MongoDB and the backend (`npm run dev`).
2. Start the frontend (`npm run dev`).
3. Sign up two users: one `jobseeker`, one `employer`.
4. Publish a job via the employer dashboard; the seeker view will refresh automatically.

## Key API Endpoints

| Method | Path | Description |
|--------|------|-------------|
| `POST` | `/api/auth/signup` | Create account and receive JWT |
| `POST` | `/api/auth/signin` | Authenticate and receive JWT |
| `POST` | `/api/auth/logout` | Invalidate session client-side |
| `GET`  | `/api/jobs` | List jobs with filters/pagination |
| `POST` | `/api/jobs` | Create job (employer) |
| `PUT`  | `/api/jobs/:id` | Update job (employer) |
| `DELETE` | `/api/jobs/:id` | Soft delete job |
| `GET` | `/api/jobs/employer/my-jobs` | Employer’s postings |
| `GET` | `/api/jobs/employer/stats` | Aggregate dashboard metrics |
| `GET` | `/api/remotive-jobs` | Aggregated remote roles (Remotive + Serper + fallback) |
| `GET` | `/api/market-intelligence/:jobTitle/:location` | Serper-backed insights |
| `GET` | `/api/health` | Liveness probe |

Additional routes exist for applications and market stats—use the source for the exact contract.

## Deployment Notes

- **Backend (Render/Fly/Any Node host):** use `npm install && npm run start`, set all environment variables, and ensure MongoDB is reachable. The included `render.yaml` shows a sample service definition with health check.
- **Frontend (Vercel/Netlify):** build with `npm run build`; set `VITE_API_BASE_URL` to the deployed backend URL. The repo includes a `vercel.json` for clean routing.
- **CORS:** update `backend/server.js` origins to include any new frontend domains.

## Troubleshooting

| Issue | Fix |
|-------|-----|
| `Network error - backend server may be unavailable` | Confirm backend is running and `VITE_API_BASE_URL` is correct. |
| `Token expired` responses | Re-authenticate; tokens last 7 days by default. |
| No remote jobs returned | Verify `SERPER_API_KEY` and network access to Remotive. The UI will fall back to curated data if both fail. |
| Mongo connection errors | Ensure `MONGODB_URI` is correct and accessible from your environment. |

## Contributing

1. Fork the repo and create a feature branch.
2. Follow the existing code style (lint before committing).
3. Add or update documentation/tests when introducing changes.
4. Open a Pull Request with a clear summary and screenshots/GIFs where helpful.

## License

This project is released under the ISC license. Feel free to build on it, but attribution is appreciated.

---
Feel free to open issues for bugs, questions, or feature requests. Happy building!
