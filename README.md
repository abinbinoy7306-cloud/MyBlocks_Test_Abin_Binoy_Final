# NCLC CRM

NCLC is a multi-tenant CRM platform with firm administration, API-key pools, task-specific LLM routing, and configurable autonomous AI-agent definitions.

## Developer quick start

### Requirements

- Node.js 20 or newer
- npm 10 or newer
- MySQL 8+ (or compatible MySQL/MariaDB server)

### 1. Install dependencies

```powershell
cd backend
npm ci

cd ..\frontend
npm ci
```

`node_modules` is intentionally excluded from Git and distribution archives.

### 2. Configure the backend

```powershell
cd ..\backend
Copy-Item .env.example .env
```

Edit `backend/.env` with the local MySQL database name, user, password, and strong JWT secrets. Never commit `.env`.

### 3. Initialize the database

```powershell
npm run db:sync
npm run db:seed
```

The seed creates demo accounts:

| Role | Email | Password |
|---|---|---|
| Super Admin | `admin@nclc.com` | `Admin@123` |
| Firm Admin | `admin@acme.com` | `Admin@123` |
| Manager | `manager@acme.com` | `Manager@123` |
| Team User | `user@acme.com` | `User@1234` |

Change demo credentials before using a shared environment.

### 4. Run the application

Terminal 1:

```powershell
cd backend
npm run dev
```

Terminal 2:

```powershell
cd frontend
npm run dev
```

Open [http://localhost:5173](http://localhost:5173). The API health check is [http://localhost:5000/health](http://localhost:5000/health).

## GitHub Pages deployment

The workflow in `.github/workflows/deploy.yml` publishes the frontend to GitHub Pages whenever `master` is updated. In the repository settings, enable **Pages → Build and deployment → GitHub Actions** and add the repository secret `VITE_API_BASE_URL` containing the deployed backend URL, for example `https://api.example.com/api`.

GitHub Pages hosts only the static frontend. Deploy the Node.js backend and MySQL database separately, then point `VITE_API_BASE_URL` at that backend. The backend must allow the GitHub Pages origin in its CORS configuration.

## Features

- Settings → API Keys: multiple keys, task-type assignment, active-key selection, token accounting, and automatic fallback.
- Settings → AI Agents: predefined recruiter, screener, verifier, invoice, support, follow-up, analyst, and compliance agents.
- LLM routing: text → `llm1`, image/OCR → `llm2`, audio → `llm3`, video → `llm4`.
- Tenant-scoped authentication and role-based access control.

## Safe distribution and Git workflow

The root `.gitignore` excludes dependencies, environment files, logs, build output, coverage, and generated archives. Use the checked-in `.env.example` templates to configure a new machine.

Create a source-only backup from committed files with:

```powershell
git archive --format=zip --output=NCLC-developer-backup-YYYYMMDD.zip HEAD
```

The archive contains source code and documents only; install dependencies with `npm ci` after extraction.
