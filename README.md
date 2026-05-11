# AI Survey Platform

AI Survey Platform is an admin-only survey management system for creating participants, generating surveys with AI, sending invitation emails, and collecting survey submissions through public survey links.

https://github.com/user-attachments/assets/633092aa-6921-414e-aaa1-2e30f7ee9313

## Functionality

- Admin login with JWT authentication
- Participant management with active/inactive status
- AI-powered survey generation using the OpenAI Responses API
- Manual survey review and editing before saving
- Survey list and survey detail view
- Invitation sending to active participants only
- Public survey submission through emailed invitation links
- PostgreSQL-backed storage with Alembic migrations

## Tech Stack

- Backend: FastAPI
- Frontend: React + Vite + TypeScript
- Database: PostgreSQL
- ORM: SQLAlchemy Async
- Migrations: Alembic
- Authentication: JWT
- AI Integration: OpenAI Responses API
- Email: Gmail SMTP
- Container: Docker Compose

## How To Run

### 1. Go to the project

```powershell
cd F:\servery\servery
```

### 2. Activate Python environment

If you are using your existing environment:

```powershell
& F:\ai-interviewer\venv\Scripts\Activate.ps1
```

Or activate this project's local environment if you created one:

```powershell
.\.venv\Scripts\Activate.ps1
```

### 3. Install backend dependencies

```powershell
python -m pip install -r backend\requirements.txt
```

### 4. Create environment files

```powershell
if (!(Test-Path .env)) { Copy-Item .env.example .env }
if (!(Test-Path frontend\.env)) { Copy-Item frontend\.env.example frontend\.env }
```

### 5. Fill required values in `.env`

Required values include:

```env
DATABASE_URL=
ALEMBIC_DATABASE_URL=
JWT_SECRET_KEY=
OPENAI_API_KEY=
SMTP_EMAIL=injamulhaque9117@gmail.com
SMTP_PASSWORD=
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
FRONTEND_BASE_URL=http://localhost:5173
ADMIN_EMAIL=
ADMIN_PASSWORD=
```

### 6. Start PostgreSQL

```powershell
docker compose up -d
```

### 7. Run database migration

```powershell
alembic -c backend\alembic.ini upgrade head
```

### 8. Create the admin user

```powershell
python create_admin.py
```

### 9. Start the backend

```powershell
uvicorn backend.app.main:app --reload
```

Backend URLs:

- API: `http://127.0.0.1:8000`
- Docs: `http://127.0.0.1:8000/docs`

### 10. Start the frontend

Open a new terminal:

```powershell
cd F:\servery\servery\frontend
npm install
npm run dev
```

Frontend URL:

- `http://localhost:5173`

### 11. Use the system

- Login with `ADMIN_EMAIL` and `ADMIN_PASSWORD`
- Create participants
- Generate and save surveys
- Send invitations
- Open the survey link from email
- Submit survey responses

Created by Injamul Haque
