# Frontend

This frontend uses Next.js and consumes the backend API.

## Environment Variables

1. Copy `frontend/.env.local.example` to `frontend/.env.local`
2. Adjust `NEXT_PUBLIC_API_URL` if your backend is not running on `http://localhost:4000`

## Development

```bash
npm ci
npm run dev
```

## Checks

```bash
npm run lint
npm run build
```

The main project guide lives in `../README.md`.
