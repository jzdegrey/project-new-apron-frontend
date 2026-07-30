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
  - `page.tsx` — public marketing front page (navbar, hero, footer)
  - `sign-in/page.tsx` — combined sign-in / create-account screen
  - `welcome/page.tsx` — post-sign-in confirmation screen (server component;
    redirects to `/sign-in` if there's no valid session)
  - `authLayout.module.css` — shared centered-card layout used by the
    sign-in and welcome pages
  - `api/auth/*` — route handlers that proxy to the backend and set the
    session cookie (see Authentication below)
- `src/components` — shared React components (`Navbar`, `Footer`, `AuthForm`,
  `PasswordField`, `Toast`)
- `src/lib/validation.ts` — client-side field validation mirroring the
  backend's rules, used for live form feedback
- `src/lib/backendClient.ts` — typed fetch wrapper for the backend auth API
- `src/lib/session.ts` — session cookie helpers
- `src/proxy.ts` — redirects unauthenticated requests away from `/welcome`
- `src/config/globals.ts` — global, project-level configuration read from
  environment variables, including `APP_ENV` (`local` | `stg` | `prod`) and
  `API_BASE_URL` (the backend's base URL)
- `src/lib/logger.ts` — shared logger used on both the server and in the
  browser; writes structured JSON lines to `console`

## Authentication

Sign-in and account creation share one screen (`/sign-in`) that toggles
between the two modes. Form submission goes through this app's own
`/api/auth/*` route handlers rather than calling the backend directly from
the browser: they forward the request to the backend, then set the returned
JWT as an `httpOnly`, `sameSite=lax` cookie so the token is never exposed to
client-side JavaScript (mitigating XSS-based token theft). `/welcome` is a
server component that reads that cookie, verifies it against the backend,
and redirects back to `/sign-in` if it's missing or invalid. The public
front page (`/`) links to `/sign-in` from its navbar and its main
call-to-action.

## Configuration

All configuration and secrets are read from environment variables via a
`.env` file (see `.env.example`), never committed to source control.
`APP_ENV` must be one of `local`, `stg`, or `prod`; the app fails fast on
startup if it is missing or invalid. `API_BASE_URL` must point at a running
instance of the backend for sign-in/registration to work.
