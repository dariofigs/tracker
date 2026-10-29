# Tracker Build Checklist

Oct 28, 2026 · @Darío

## Decisions and scope

This is a single-user, phone-only app that logs pain, symptoms, exercise, activity, stress and sleep, then finds how earlier days affect later ones. Data lives in a free cloud database so a lost or reset phone does not lose history.

| Area          | Decision                                                                     |
| ------------- | ---------------------------------------------------------------------------- |
| Build         | Vite + React + TypeScript                                                    |
| Styling       | Tailwind CSS v4, Botanical Sanctuary tokens in `@theme`                      |
| Data          | Supabase (hosted Postgres), single user, locked down with Row Level Security |
| Routing       | React Router, 3 tabs: **Today · Insights · Settings**                        |
| Charts        | Hand-built SVG (two chart types only)                                        |
| Offline / PWA | Not needed. Only a web manifest so it can be added to the home screen        |
| Color modes   | Light Botanical Sanctuary only. The dark mode is dropped for now             |
| Tests         | Vitest + React Testing Library, focused on the correlation math              |

**Where the old plan changed**

- The Log tab is gone. Calendar and history become a second view inside Insights (a Trends / Calendar switch).
- Stress and sleep are now logged and fed into the correlation engine, not just exercise and activity.
- Offline mode, service worker and dim theme are removed.
- Backup and restore is now an add-on safety net rather than the main protection.

**What gets logged**

| When         | Fields                                                                                                                                               |
| ------------ | ---------------------------------------------------------------------------------------------------------------------------------------------------- |
| Morning (AM) | Waking pain 0–10, sleep hours, sleep quality, starting capacity %, optional note                                                  |
| Evening (PM) | End-of-day pain 0–10, exercise (type + minutes + effort), activity chips, symptom chips, stress 0–10, remaining capacity %, optional note |

**How to use this checklist**

- Each phase ends with a **Done when** line. A phase is not finished until it is met.
- Tick items as we go. Anything that comes up mid-build goes in the Parking lot at the end, not into the current phase.
- Source docs still apply: the Design System sheet for tokens and components, and the project brief for tone. `project_context.md` (the dark athletic app) is not part of this project.

## Hosting and data safety

Yes: a free cloud database fits this app easily, since one person logging twice a day produces well under 1 MB a year. I recommend **Supabase** for the data and a free static host (**Cloudflare Pages**, Netlify or Vercel) for the app itself.

| Option                     | Free tier fit                                                                                             | Catch                                                                                                                                                                                              |
| -------------------------- | --------------------------------------------------------------------------------------------------------- | -------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- |
| **Supabase** (recommended) | Hosted Postgres plus login. Far more storage than needed. Standard SQL, so data is easy to export or move | Free projects pause after about a week with no activity. Data is kept and it restarts with one click, but daily use avoids it. No automatic downloadable backups on free, so we add our own export |
| Firebase (Firestore)       | Generous free tier, no pausing, Google sign-in                                                            | Proprietary data format, harder to move later, and correlation queries are less natural                                                                                                            |
| Cloudflare D1 + Workers    | Free, SQLite-based                                                                                        | More custom backend code to write and maintain for little benefit                                                                                                                                  |

I would not use a plain cloud-storage file or spreadsheet as the database. They are free but fragile once two saves collide.

Because only you will use it, safety comes from three layers:

1. **Access:** one account, signups turned off, and database rules that only allow reads and writes for that account's id.
2. **Reliability:** if a save fails on a weak signal, keep the entry on the phone, show a clear "not saved yet" state, and retry automatically. This is not offline mode, just no lost entries.
3. **Backup:** an Export button in Settings (JSON for restore, CSV for spreadsheets), plus a reminder to export monthly. A scheduled automatic backup can be added later if wanted.

**Setup you will need to do (about 10 minutes, I will walk you through it):** create a free Supabase account, create a project, and create a free Cloudflare Pages (or Netlify) account. I will supply the SQL, the rules and the exact steps.

## Phase 0: Foundation

- [x] 0.1 Scaffold Vite + React + TypeScript; add Tailwind v4, ESLint, Prettier, Vitest
- [x] 0.2 Self-host Fraunces and DM Sans (500, 600, 700, 800)
- [x] 0.3 Register all 13 color tokens in `@theme`, plus type scale, 16–24px radii and a 48px min-touch utility
- [x] 0.4 Folder layout: `components/ui`, `features/{today,checkin,insights,settings}`, `lib`, `hooks`, `data`
- [x] 0.5 Temporary swatch page to compare against the Design System sheet
- [x] 0.6 Web manifest and app icon (typographic, no generated images) for home-screen install

**Done when:** a blank mobile-width page builds, uses the right fonts and colors, and `npm test` runs.

## Phase 1: Backend setup (Supabase)

- [x] 1.1 You create the Supabase project; I provide the steps. Keys go in `.env`, never committed
- [x] 1.2 Tables: `entries` (one row per day per period) and `custom_options` (your own symptoms, activities, exercise types)
- [x] 1.3 Unique constraint on date + period, so saving again edits instead of duplicating
- [x] 1.4 Row Level Security: only your user id can read or write; signups disabled
- [x] 1.5 Create your single login; decide between email magic link and password
- [x] 1.6 Save the schema as a SQL file in the repo so the database can be rebuilt

**Done when:** a test script can insert and read an entry while signed in, and is refused when signed out.

## Phase 2: Data layer (no screens yet)

- [x] 2.1 Types: pain 0–10 integer, capacity %, sleep hours and quality, stress 0–10, exercise (type from a custom list, minutes, effort), tags, note
- [x] 2.2 Supabase client plus sign-in flow with a minimal login screen
- [x] 2.3 Repository functions: upsert entry, get today, get date range, delete, custom options add, rename and hide
- [x] 2.4 Failed-save queue: keep unsent entries on the phone and retry; expose a "saved / saving / not saved yet" status
- [x] 2.5 Date helpers: local-day boundaries, AM/PM mode by time of day (before 12:00 = morning, adjustable in Settings)
- [x] 2.6 Dev-only seed script that creates about 60 days of data with a planted 18–24h lag, plus stress and sleep effects, written to a separate test project or flagged rows
- [ ] 2.7 Unit tests for date helpers and the repository logic
- [ ] 2.8 Timed logs: an optional, timestamped pain, symptom, activity or exercise log alongside the daily AM/PM check-ins, so lags can be measured in hours. Table, types, repository, seed and tests. Saved through the failed-save queue with a phone-made id, so a retry can't duplicate a log

**Done when:** entries round-trip from the app code to the database and back, and the failed-save queue is proven by a test that simulates a dropped connection.

## Phase 3: UI primitives

- [ ] 3.1 Card, Section Header, Status Chip (Balanced, Low Battery, DUE, Flare)
- [ ] 3.2 Pill Chip toggle: `+` inactive, `✓` active, Sage and Clay variants, 48px+ target
- [ ] 3.3 Primary and secondary pill buttons, including the full-width 50px Save Entry button
- [ ] 3.4 Pain Gauge 1A: 11 beads, 28px sage handle, tap and drag, keyboard and ARIA slider support, range labels. Reused for stress 0–10
- [ ] 3.5 Battery bar (8px pill track, sage to clay fill)
- [ ] 3.6 Bottom sheet: swipe or tap to dismiss, focus handling, safe-area padding
- [ ] 3.7 Bottom nav: floating pill with 3 tabs (Today, Insights, Settings)
- [ ] 3.8 Small stepper/segmented controls for sleep hours, sleep quality and effort

**Done when:** a throwaway gallery page shows every primitive in all states, and the gauge feels right on your real phone with tired hands.

## Phase 4: App shell and Today screen

- [ ] 4.1 Layout: linen canvas, safe-area insets, centered max width on desktop for testing
- [ ] 4.2 Routes and nav wiring; login gate in front of everything
- [ ] 4.3 Persistent Rapid Check-in button that opens the AM or PM sheet based on time of day
- [ ] 4.4 Header with date and greeting in Young Serif
- [ ] 4.5 AM/PM connected timeline card: morning node with ✓, time, pain and capacity; evening node with DUE tag that opens the PM sheet
- [ ] 4.6 Battery card reading the latest capacity
- [ ] 4.7 States: nothing logged, AM only, both done, load error, saving
- [ ] 4.8 Insight banner slot (wired to real data in Phase 6)

**Done when:** Today reads live data from the database and each state renders correctly using seed data.

## Phase 5: Check-in flows

- [ ] 5.1 Shared sheet shell with sticky bar (dismiss + Save Entry)
- [ ] 5.2 Morning check-in: waking pain, sleep hours, sleep quality, starting capacity
- [ ] 5.3 Evening check-in: end-of-day pain, exercise (type, minutes, effort), activity chips, symptom chips, stress, remaining capacity
- [ ] 5.4 Pre-fill defaults from your last entry so a minimal check-in is a few taps
- [ ] 5.5 Optional note field, collapsed by default
- [ ] 5.6 Save with quiet confirmation, then return to Today; show the failed-save state clearly
- [ ] 5.7 Edit mode: reopen and update an earlier entry, including past days
- [ ] 5.8 Component tests for the gauge, chips and both save flows
- [ ] 5.9 Count taps: morning at most 4, evening at most 6 for the fastest path; cut anything that does not earn its place

**Done when:** you can complete a real day of logging on your phone. **This is the first point you can start using it for real, and the point where data begins to build up.**

## Phase 6: Insights (Trends and Calendar)

Insights has two views behind a segmented switch: **Trends** and **Calendar**. The correlation engine is built and tested first, because it is the riskiest logic in the app.

**6A. Correlation engine (pure functions, unit tested)**

- [ ] 6.1 Pair each day's evening data (exercise minutes, activities, stress) with the next morning's pain
- [ ] 6.2 Pair each night's sleep (hours, quality) with the same morning's pain
- [ ] 6.3 Compare days with a factor against days without it, and report the percent difference with the number of days behind it
- [ ] 6.4 Test lags of 0, 1 and 2 days and report the strongest, so the 18–24h pattern is found by the data rather than assumed
- [ ] 6.5 Minimum sample rule (for example 10+ paired days) before any insight appears; otherwise say plainly that more days are needed
- [ ] 6.6 Tests using the seed data: the planted lag and sleep effect must be found, and pure noise must produce no insight

**6B. Trends view**

- [ ] 6.7 Lag curve card: paired daily bars (exertion in sage, next-day pain in clay/plum) with a 7 / 30 / 90-day filter
- [ ] 6.8 Sleep vs. pain chart and stress vs. pain chart
- [ ] 6.9 Insight cards in plain language, worded as patterns seen in your data, not medical conclusions
- [ ] 6.10 Weekly flare vs. good-day distribution
- [ ] 6.11 Wire the Today banner to the top current insight

**6C. Calendar view**

- [ ] 6.12 Monthly calendar with AM/PM split dots colored by pain band (sage 1–3, clay 4–6, plum 7–10)
- [ ] 6.13 Tap a day to see its entries, with edit and delete (delete asks to confirm)
- [ ] 6.14 Chronological history list, month navigation and an empty-month state

**Done when:** with seed data the engine finds the planted patterns and shows nothing for noise, and with your first real weeks of data Insights says clearly what it can and cannot tell yet.

## Phase 7: Settings and backup

- [ ] 7.1 Custom symptoms, activities and exercise types: add, rename, hide
- [ ] 7.2 AM/PM switch time (default 12:00)
- [ ] 7.3 Export all data as JSON (for restore) and CSV (for spreadsheets)
- [ ] 7.4 Import from JSON, with a preview and a duplicate check before anything is overwritten. Save one row per request via `repository.upsertEntries`, not a bulk upsert
- [ ] 7.5 Monthly backup reminder on the Today screen, dismissible, based on the last export date
- [ ] 7.6 Sign out and change login details
- [ ] 7.7 Optional doctor summary: printable page with date range, average pain, flare days, top activities and the main patterns found, plus CSV of raw entries

**Done when:** you can export, wipe a test database, import, and see identical data.

## Phase 8: Quality and launch

- [ ] 8.1 Accessibility pass: contrast on every token pair, focus order, screen-reader labels, reduced motion, 48px targets
- [ ] 8.2 Real-phone test on your device: gauge feel, sheet gestures, keyboard behavior, safe areas, bright and dim rooms
- [ ] 8.3 End-to-end smoke test: log AM, log PM, see it on Today, in the Calendar and in Insights
- [ ] 8.4 Error and loading states everywhere: no network, signed out, database paused, failed save
- [ ] 8.5 Remove or isolate seed data so test rows never reach your real history
- [ ] 8.6 Bundle size and load-time check on mobile data
- [ ] 8.7 Deploy to Cloudflare Pages (or Netlify) with environment variables set; add to your home screen
- [ ] 8.8 Lock down: confirm signups are off, rules are active, and the app URL is not indexed (noindex)
- [ ] 8.9 Write a short README with how to redeploy, rebuild the database from the SQL file, and restore from a backup

**Done when:** the live app works from your phone, an export has been taken, and a restore has been tested once.

## Milestones and risks

1. **M1 (Phases 0–2):** project, database and data layer working. Nothing to see yet, but the foundation is tested.
2. **M2 (Phases 3–5):** logging works end to end on your phone. Start using it daily here.
3. **M3 (Phase 6):** Insights and Calendar. Patterns get more useful as weeks of real data accumulate.
4. **M4 (Phases 7–8):** settings, export, polish and a tested restore.

**Risks**

- **Thin data.** Early insights will be noise, so the engine holds them back until enough days exist. Correlation is not cause, and wording stays careful.
- **Free-tier pausing.** Supabase pauses idle free projects. Daily logging prevents it; the app shows a clear message if it happens.
- **Weak signal.** The failed-save queue protects entries, and it needs a real test.
- **Private health data.** Keep keys out of the repo, keep signups off, and keep the app out of search indexes.
- **Gauge ergonomics.** Checked on your phone at the end of Phase 3, before anything is built on top of it.

## Parking lot

Ideas that come up mid-build go here instead of expanding the current phase.

- [ ] Weather and barometric pressure as a correlation factor
- [ ] Medication and supplement logging
- [ ] Scheduled automatic backup to a private repo
- [ ] Dark / low-light mode
