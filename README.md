# Pokemon Project

Full-stack application with:

- `backend`: Express API with MySQL
- `frontend`: Next.js interface
- `infrastructure`: Docker Compose, Nginx, and the initial schema
- `testing`: backend tests and load-testing scripts

## Environment Variables

Use these files as templates:

- `backend/.env.example` -> copy to `backend/.env` for local backend development
- `frontend/.env.local.example` -> copy to `frontend/.env.local` for local frontend development
- `infrastructure/.env.example` -> copy to `infrastructure/.env` when running Docker Compose

Most important variables:

- `JWT_SECRET`: required outside tests
- `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME`: MySQL connection
- `NEXT_PUBLIC_API_URL`: public backend URL used by the frontend
- `SENTRY_DSN`: optional
- `EMAIL_USER`, `EMAIL_PASS`: optional, used for welcome emails
- `RESTATE_URL`: Restate service URL

## Database

The current schema lives in `infrastructure/db.sql`.

Tables expected by the app:

- `users`
- `user_pokemons`
- `email_logs`

## Local Development

### Backend

```bash
cd backend
npm ci
npm run dev
```

The backend runs on `http://localhost:4000`.

### Frontend

```bash
cd frontend
npm ci
npm run dev
```

The frontend runs on `http://localhost:3000`.

## Docker

```bash
cd infrastructure
docker compose up -d --build
```

Before starting Docker, create `infrastructure/.env` from `infrastructure/.env.example`.

## Useful Checks

```bash
cd backend
npm test -- --runInBand
```

```bash
cd frontend
npm run lint
npm run build
```

Frontend end-to-end tests require these environment variables:

- `E2E_LOGIN_IDENTIFIER`
- `E2E_LOGIN_PASSWORD`
- `E2E_LOGIN_NICKNAME`

Performance scripts require these environment variables:

- `API_URL`
- `TOKEN`

## Security Note

If the real credentials currently stored in `.env` files were ever committed or shared, rotate them.
