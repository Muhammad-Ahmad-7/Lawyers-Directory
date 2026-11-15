# Lawyer Schedule

A private web app where a lawyer signs in and manages their monthly schedule: client appointments, court hearings, client meetings, deadlines and other events.

Built with Next.js 15 (App Router), PostgreSQL + Prisma, Auth.js and Tailwind CSS.

## Features

- Sign up (name, email, password) and sign in; passwords are stored hashed (scrypt) in the database; every page except `/login` and `/signup` requires sign-in
- Each lawyer only sees and edits their own events
- Month calendar with previous / next / today navigation and colour-coded event types
- Add, edit and delete events; court-hearing fields (court, case number) and client fields
- Event status: scheduled, completed, adjourned, cancelled
- Day agenda panel and a "next 7 days" list
- Filter the calendar by event type
- Warning when a new event overlaps an existing one (you can still save)
- Print-friendly month view (Print button, landscape)
- Works on phones (calendar shows dots; tap a day to see its events)

## Setup

1. Install Node.js 20+ and have a PostgreSQL database (local install, or a hosted one such as Neon).
2. Copy `.env.example` to `.env` and fill in:
   - `DATABASE_URL` – your Postgres connection string
   - `AUTH_SECRET` – a long random string (`npx auth secret` generates one)
   - Optional `APP_TIMEZONE` (e.g. `Asia/Karachi`); defaults to the server's timezone
3. Install and set up the database:

   ```bash
   npm install
   npx prisma migrate deploy
   ```

4. Start the app: `npm run dev`, open http://localhost:3000 and choose **Create an account**.

## Deploying to Vercel

1. Push the repository to GitHub and import it in Vercel (it detects Next.js; no build settings to change).
2. In **Project → Settings → Environment Variables** add:
   - `DATABASE_URL` – your Postgres connection string (e.g. the Neon pooled URL)
   - `AUTH_SECRET` – a long random string
   - `APP_TIMEZONE` – e.g. `Asia/Karachi`. Required: Vercel servers run in UTC, so without it times are shown and saved in UTC.
3. Make sure the database schema is up to date before deploying: `npx prisma migrate deploy` (run locally against the production `DATABASE_URL`).
4. Deploy. The Prisma client is generated during install (`postinstall` script).

## Production (other hosts)

```bash
npm run build
npx prisma migrate deploy
npm start
```

Set the same environment variables on the host. Set `APP_TIMEZONE` explicitly, since servers usually run in UTC.

## Notes

- Events are single-day (a start and end time on one date, or all day).
- Sign-up is open to anyone who can reach the site. Add an approval step or invite codes before putting it on the public internet.
