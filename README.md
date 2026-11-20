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

Edit `backend/.env` with the local MySQL database name, user, password, strong JWT secrets, and allowed frontend origins:

```env
DB_HOST=localhost
DB_PORT=3306
DB_NAME=nclc_crm
DB_USER=root
DB_PASSWORD=your_local_database_password
JWT_ACCESS_SECRET=generate_a_long_random_value
JWT_REFRESH_SECRET=generate_a_different_long_random_value
CORS_ORIGINS=http://localhost:5173
```

Never commit `.env` or place real credentials in the repository. The tracked `backend/.env.example` and `frontend/.env.example` files are safe templates only.

### Deployment environment variables

For a deployed backend, add the backend variables from `backend/.env.example` in the hosting provider's environment settings. Set `CORS_ORIGINS` to the public frontend origin, for example:

```env
CORS_ORIGINS=https://abinbinoy7306-cloud.github.io
```

For the GitHub Pages frontend, add this repository secret under **Settings → Secrets and variables → Actions**:

```text
VITE_API_BASE_URL=https://your-deployed-backend.example.com/api
```

Replace the example URL with the actual public backend URL. `VITE_API_BASE_URL` is embedded into the frontend during the GitHub Actions build. Do not put database passwords, JWT secrets, or API keys in frontend variables.

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

The workflow in `.github/workflows/deploy.yml` publishes the frontend to GitHub Pages whenever `master` is updated. Before the first deployment, open the repository [Pages settings](https://github.com/abinbinoy7306-cloud/MyBlocks_Test_Abin_Binoy_Final/settings/pages) and select **GitHub Actions** under **Build and deployment**. Also add the repository secret `VITE_API_BASE_URL` containing the deployed backend URL, for example `https://api.example.com/api`.

GitHub Pages hosts only the static frontend. Deploy the Node.js backend and MySQL database separately, then point `VITE_API_BASE_URL` at that backend. The backend must allow the GitHub Pages origin in its CORS configuration.

For the backend deployment, set `CORS_ORIGINS=https://abinbinoy7306-cloud.github.io` (comma-separate additional frontend origins if needed).

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
