# project-new-apron-frontend

Frontend code for Project New Apron — a Next.js (TypeScript, App Router) web app.

## Getting started

1. Copy `.env.example` to `.env` and fill in real values.
2. Install dependencies and run the dev server:

   ```bash
   npm install
   npm run dev
   ```

   The app runs at http://localhost:3000.

Or via Docker Compose (make sure `.env` exists first):

```bash
docker compose up
```

## Scripts

- `npm run dev` — start the dev server
- `npm run build` — production build
- `npm run start` — run a production build
- `npm run lint` — lint with ESLint
- `npm test` — run the Jest test suite

## Project structure

- `src/app` — Next.js App Router pages/layouts
- `src/components` — shared React components
- `src/config/globals.ts` — global, project-level configuration read from
  environment variables, including `APP_ENV` (`local` | `stg` | `prod`)
- `src/lib/logger.ts` — shared logger used on both the server and in the
  browser; writes structured JSON lines to `console`

## Configuration

All configuration and secrets are read from environment variables via a
`.env` file (see `.env.example`), never committed to source control.
`APP_ENV` must be one of `local`, `stg`, or `prod`; the app fails fast on
startup if it is missing or invalid.
