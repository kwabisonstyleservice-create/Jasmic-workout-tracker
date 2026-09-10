# JASMIC Workout Tracker

A mobile-first workout and body-progress tracker built with Next.js, TypeScript, PostgreSQL and Drizzle. The same application runs in a desktop browser, installs as a PWA on Android and Windows, and is prepared for an Android Trusted Web Activity package for Google Play.

## What is implemented

- Guided first-use checklist that leads members through their plan, baseline measurements and first completed workout.
- Confidence centre and getting-started guide with clear privacy, account-control and safe-use information.
- Timed workout sessions with set-completion progress, 90-second rest timer, local draft autosave and pause/resume recovery.
- Online/offline connection feedback and friendly loading/error recovery screens.
- Interactive dashboard with workout count, training volume, streak and body-weight change.
- Workout logger for repetitions and kilograms, with persistent set history.
- Six starter routines transcribed from the supplied images: biceps, back, shoulders, chest, legs and triceps.
- 45 editable starter exercises, plus user-created exercises without a code change.
- Body tracking for weight, neck, shoulders, chest, waist, hips, left/right biceps, left/right thighs, left/right calves and optional body-fat percentage.
- Training-volume and body-measurement progress charts.
- Personal weekly plans and a protected coach/admin plan-assignment API.
- Secure email/password accounts, salted `scrypt` password hashing, opaque database-backed sessions, protected cookies, request-origin checks, input validation and database-backed login throttling.
- Account deletion, audit events and a public privacy policy/deletion page for Play Store preparation.
- Responsive layouts for Android phones, tablets and Windows computers.
- PWA manifest, service worker, app icons and Digital Asset Links template.

The public `/` route is an interactive preview. Real account data is stored only after the user registers and enters `/app`.

## Technology

- Next.js App Router and React
- TypeScript and Tailwind CSS
- Neon PostgreSQL (or another standard hosted PostgreSQL database)
- Drizzle ORM and versioned SQL migrations
- Recharts for progress graphics
- Vercel for the web deployment
- PWA + Android Trusted Web Activity for Google Play

## Local setup

Requirements: Node.js 22 or later and a PostgreSQL database.

1. Copy `.env.example` to `.env.local`.
2. Add the pooled PostgreSQL connection string as `DATABASE_URL`.
3. Install dependencies:

   ```bash
   npm install
   ```

4. Create the database tables:

   ```bash
   npm run db:migrate
   ```

5. Load the 45 starter exercises and six workout templates:

   ```bash
   npm run db:seed
   ```

6. Start the application:

   ```bash
   npm run dev
   ```

Open `http://localhost:3000`.

## Vercel deployment

1. Push this directory to a new GitHub repository.
2. Import that repository in Vercel as a Next.js project.
3. Add `DATABASE_URL` in the Vercel project’s Production, Preview and Development environments.
4. Set `NEXT_PUBLIC_APP_URL` to the final HTTPS domain.
5. Run `npm run db:migrate` and `npm run db:seed` once against the production database before opening registration.
6. Deploy. Vercel will use `npm run build`.

Keep the Neon database region close to the Vercel function region. Do not place database credentials in GitHub or commit `.env.local`.

## Capacity for 3,000+ users

The application is stateless at the web-server layer and uses pooled HTTP database connections. User-owned tables are indexed around the real access patterns: account email, sessions, workout history, set logs, measurement dates and active plans. This is a sound starting architecture for 3,000 users; production limits should then be chosen from measured traffic rather than user count alone.

Before a public launch, add monitoring, automated backups, email verification/password recovery, abuse alerts and a tested restore procedure. A security review and load test should be completed before accepting paying customers.

## Google Play Android package

The codebase is already an installable PWA. The signed Android App Bundle must be generated only after the production HTTPS domain and Play signing certificate are known.

1. Deploy the application on its final domain.
2. Confirm the manifest, service worker, icons, responsive layout, offline fallback and account flows on a physical Android device.
3. Use Bubblewrap or PWABuilder to create a Trusted Web Activity with package name `com.jasmic.workouttracker`.
4. Obtain the SHA-256 fingerprint of the Play App Signing certificate.
5. Replace the placeholder in `android/assetlinks.json.example`, save the final file as `public/.well-known/assetlinks.json`, redeploy and verify the link.
6. Build and upload the `.aab` to a Play Console internal-testing track.
7. Complete the privacy-policy link, Data safety form, account-deletion URL, Health apps declaration, content rating and store listing.

Do not generate the release signing key inside a temporary or shared workspace. Store it in a protected password manager or secrets vault and back it up securely.

## Main data model

- `users`, `profiles`, `auth_sessions`, `auth_rate_limits`
- `exercises`, `workout_templates`, `workout_template_exercises`
- `training_plans`, `training_plan_days`, `training_plan_day_exercises`
- `workout_sessions`, `set_logs`
- `body_measurements`, `audit_events`

All user-created records carry or inherit a user identity. Coach plan assignment requires a server-verified `COACH` or `ADMIN` role.

## Useful commands

```bash
npm run dev
npm run typecheck
npm run lint
npm run build
npm run db:generate
npm run db:migrate
npm run db:seed
```

## Important launch notes

- The routines reproduce the supplied source material and are starter templates, not medical advice. Exercise selection, technique and loading should be reviewed by a qualified fitness professional.
- The source image for light deadlifts states “4 sets” but lists five rep targets (`10, 8, 6, 5, 4`); the seed data preserves that source exactly so it can be corrected by the product owner.
- Review the included privacy text against the final production providers and business process before release.
- Configure email verification and password recovery before public registration.

## v0.2 confidence release

Version 0.2 focuses on making first-time members feel informed and in control. It adds a visible setup path, plain-language help, workout draft protection, clearer connection state and recovery screens. Draft workout values are stored only in the member's current browser until the workout is submitted; successful submission removes the local draft.
