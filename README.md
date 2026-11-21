# Lawyer Schedule

A private web app where a lawyer signs in, records their cases and keeps track of each case's hearing dates.

Built with Next.js 15 (App Router), PostgreSQL + Prisma, Auth.js and Tailwind CSS.

## Features

- Sign up with full name, email, WhatsApp / contact number, username and password; sign in with **username + password** (passwords hashed with scrypt). Email and phone are stored for future hearing reminders.
- Every page except `/login` and `/signup` requires sign-in; each lawyer only sees their own cases.
- **Cases**: title, case type (civil, criminal, family, property, etc.), case number, court, client name and phone, opposing party, status (active / on hold / closed), notes. Search and filter by status; the list shows each case's next hearing.
- **Hearings**: any number per case, each with a date, optional time, purpose, status (scheduled / held / adjourned / cancelled) and notes/outcome. Add the first hearing while creating the case; past dates are allowed so running and older cases can be recorded.
- **Calendar**: month view of all hearings across cases, a day panel, a "next 7 days" list, and a print-friendly layout.

## Data model

```
User (lawyer) 1 --< cases (lawyer_id) 1 --< case_hearings (case_id)
```

Deleting a user deletes their cases; deleting a case deletes its hearings.

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

> Upgrading from the earlier events version: the `20261120090000_cases_and_hearings` migration **drops the old `Event` table**. Existing accounts keep working and sign in with their old email address as the username.

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

- Hearing dates are stored as calendar dates (Postgres `DATE`) with an optional `HH:mm` time in `APP_TIMEZONE`.
- Sign-up is open to anyone who can reach the site. Add an approval step or invite codes before putting it on the public internet.
