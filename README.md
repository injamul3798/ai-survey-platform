# AI Survey Platform

Greenfield implementation of an AI-powered survey platform with:

- FastAPI backend
- React frontend
- PostgreSQL via Docker
- Async SQLAlchemy and Alembic
- OpenAI Responses API for survey generation
- Gmail SMTP invitations

## Project Layout

- `backend/` FastAPI app, migrations, tests, requirements
- `frontend/` React SPA with protected admin routes and public survey submission
- `create_admin.py` admin bootstrap entrypoint
- `docker-compose.yml` PostgreSQL container

## Setup Outline

1. Copy `.env.example` to `.env` and fill in real secrets.
2. Create a Python virtual environment and install `backend/requirements.txt`.
3. Install frontend dependencies inside `frontend/`.
4. Start PostgreSQL with Docker Compose.
5. Run Alembic migrations.
6. Run `python create_admin.py`.
7. Start backend and frontend dev servers.

See the final response from Codex for the exact commands.

