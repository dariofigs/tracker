# Tracker

A single-user, phone-first app that logs pain, symptoms, exercise, activity, stress and sleep twice a day, then looks for how earlier days affect later ones. React + TypeScript + Vite + Tailwind v4, with Supabase (hosted Postgres) for storage.

The build plan and decisions live in `context/Tracker Build Checklist.md`.

## Run it locally

```bash
npm install
cp .env.example .env   # then fill in the two Supabase values
npm run dev
```

`.env` holds `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` for the **real** project. The anon key is public by design; Row Level Security is what protects the data. Never commit `.env` or put a service-role key in the app.

`/dev` (development only) is a gallery of every component in all its states. It is not part of the production build.

## Tests

| Command                                                 | What it runs                                                                         |
| ------------------------------------------------------- | ------------------------------------------------------------------------------------ |
| `npm test`                                              | Unit and component tests (Vitest), including colour contrast of the design tokens    |
| `npm run test:live`                                     | Tests that talk to the **test** Supabase project                                     |
| `npm run test:e2e`                                      | Playwright against the test project: smoke, accessibility (axe), settings and backup |
| `npm run seed:test`                                     | Fills the test project with 60 days of planted-pattern data                          |
| `npm run lint`, `npm run format:check`, `npm run build` | Lint, formatting, type check and production build                                    |

Tests and seeding use a **separate** Supabase project, configured in `.env.test` (git-ignored): the same two keys pointing at the test project, plus `TEST_EMAIL`, `TEST_PASSWORD` and `SEED_ALLOWED_PROJECT_REF` (the part of the test URL before `.supabase.co`). The seed script refuses to run unless that ref matches and the URL differs from the one in `.env`. E2E specs only touch rows dated 1998 or labelled `e2e `.

## Rebuild the database

1. Create a Supabase project (free tier).
2. In the SQL editor, run `supabase/schema.sql`. It creates `entries`, `custom_options` and `timed_logs` with owner-only Row Level Security, and is safe to run again.
3. In **Authentication**, create your single user, then turn **signups off** (Authentication, Sign In / Providers, disable "Allow new users to sign up").
4. Put the project URL and anon key in `.env` (local) and in the host's environment variables (deployed).

Free projects pause after about a week without activity. Logging daily prevents it. If the app says it can't reach your data, open the Supabase dashboard and restore the project; nothing is lost.

## Deploy (Cloudflare Pages)

1. Push the repo to GitHub and create a Cloudflare Pages project from it.
2. Build command `npm run build`, output directory `dist`.
3. Add environment variables `VITE_SUPABASE_URL` and `VITE_SUPABASE_ANON_KEY` (Production).
4. Deploy. To redeploy, push to the main branch.

`public/_redirects` makes deep links like `/settings` work, and `public/_headers` plus the `robots` meta tag keep the site out of search indexes. Netlify reads the same two files.

On the phone, open the URL and use **Add to Home Screen**.

### After the first deploy, check

- `curl -I https://<your-app-url>/` shows `x-robots-tag: noindex, nofollow`.
- Opening `https://<your-app-url>/settings` directly loads the app, not a 404.
- Signing up with a new email in the Supabase API (or the dashboard form) is refused.
- Signed out, the Supabase REST API returns no rows for `entries`.

## Back up and restore

- **Back up:** Settings, Export. JSON is for restoring, CSV is for spreadsheets. The Today screen reminds you after 30 days.
- **Restore:** sign in to the (new or emptied) project, then Settings, Restore from backup file. A preview shows what will be added or changed before anything is written.
- To prove a backup works, restore it into the test project and compare.
