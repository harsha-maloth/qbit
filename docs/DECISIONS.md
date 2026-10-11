# Decisions log

Format: date | decision | why | rejected alternatives. Newest at the bottom.

| Date | Decision | Why | Rejected |
|---|---|---|---|
| 2026-10-11 | Astro (static) for the frontend | Fast, components remove duplicated header/footer, content collections for team data | WordPress (heavy, security burden), full Next.js (overkill for 5 pages + 1 form) |
| 2026-10-11 | Host on GitHub Pages | Owner's choice, free, CDN, HTTPS | Cloudflare Pages / Vercel (offer headers and previews, but owner chose GH Pages) |
| 2026-10-11 | Supabase as backend | Owner's choice, Postgres + Auth + Edge Functions | Airtable, Notion, Sheets |
| 2026-10-11 | Form posts to an Edge Function, not directly to the table | Anon key is public, so secrets (Turnstile, Resend) and rate limiting must live server-side | Direct browser insert with RLS only |
| 2026-10-11 | Turnstile + honeypot + DB-backed rate limits | Privacy-friendlier than reCAPTCHA, protects an open form | reCAPTCHA |
| 2026-10-11 | Admin is an in-site `/admin` page | Owner's choice. Security is RLS, not hiding the route | Supabase Studio only |
| 2026-10-11 | Supabase free tier + keep-alive (GitHub Action every 2 days + UptimeRobot) | Owner's choice. Free projects pause after ~7 days idle; GH cron stops after 60 days without commits, so a second ping is needed | Pro from day one (recommended to upgrade once real applicants arrive) |
| 2026-10-11 | Reviewer login by **magic link only**, signups disabled | Simplest, no OAuth setup. Invite-only | Google sign-in |
| 2026-10-11 | Custom SMTP via Resend for Auth emails | Built-in Supabase mailer is heavily rate-limited | Default mailer |
| 2026-10-11 | Reviewers change data only through `update_application()` RPC | Prevents editing applicant-submitted fields; gives audit trail | Direct UPDATE policy |
| 2026-10-11 | `ip_hash` blocked via column-level grants; admin reads from `applications_admin` view | Privacy | Exposing raw table |
| 2026-10-11 | Audit table has no FK to applications | History must survive deletion | FK with cascade |
| 2026-10-11 | Keep repo public; no secrets in it | GH Pages on free plan needs public repo | Private repo (paid) |
| 2026-10-11 | Backups: weekly encrypted `pg_dump` to private storage, never as public artifacts | Free tier has no backups; dumps contain applicant data | Plain dump artifacts |
| 2026-10-11 | Repo carries AGENTS.md + log scripts + hook + CI check | Owner does not want to repeat context; every change must be logged | Relying on chat history |
| 2026-10-11 | **Final production hosting is cPanel** (static Astro build uploaded to public_html). GitHub Pages is used only for development/staging until everything is finalised and tested | Owner's plan. Static files run fine on cPanel; .htaccess gives real headers (CSP, HSTS), 301 redirects and clean URLs, which GH Pages could not | Staying on GH Pages permanently |
| 2026-10-11 | Backend stays on Supabase for now; cPanel serves only the frontend. **OPEN: confirm whether the backend should also move to cPanel (PHP + MySQL)** | Moving it means rewriting the Edge Function, RLS-based admin and magic-link auth. Not recommended | Rewriting backend for cPanel |
| 2026-10-11 | CSS always external (`build.inlineStylesheets: never`), no inline scripts or style attributes; `js` class set by external `public/js/js-flag.js` | Lets the CSP use `style-src 'self'` / no `unsafe-inline`; avoids mobile-menu flash | Inline styles/scripts with CSP hashes or unsafe-inline |
| 2026-10-11 | Unfinished pages ship as temporary `noindex` stubs excluded from the sitemap | Header nav must not 404 during staging; half-built pages must not be indexed | Dead nav links; indexing placeholders |
| 2026-10-11 | Meta CSP emitted only in production builds | Astro dev HMR needs inline/ws; real headers live in .htaccess | CSP in dev (breaks HMR) |
| 2026-10-11 | Old `.html` / `Phillosophy` URLs redirect via `.htaccess` 301s (Phase F), not Astro redirect pages | Production is cPanel, which gives real 301s; the old site never lived on GH Pages | Meta-refresh stub pages |
| 2026-10-11 | Privacy and Terms ship as noindex drafts with visible [OWNER TO CONFIRM] markers; FAQ answers only facts already decided | Legal text and program facts (cost, timeline) must come from the owner, not be invented | Publishing generic legal text as final |
| 2026-10-11 | Team bios: only the two non-duplicated legacy bios kept | Seven members shared one copied paragraph | Repeating the placeholder bio |
| 2026-10-11 | Apply form posts JSON to the `apply` function only; optional empty fields are omitted; Turnstile token is single-use so the widget resets after every attempt; failures show a visible fallback (mailto if PUBLIC_CONTACT_EMAIL set, else Discord) | Matches server validation (empty team_size would coerce to 0 and fail); avoids silent failure | Direct DB insert; sending empty strings |
| 2026-10-11 | Function emails are optional: skipped with a warning if RESEND_API_KEY/MAIL_FROM/TEAM_NOTIFY_EMAIL unset | Allows staging tests before Resend exists; never fail a saved application over mail | Throwing on missing mail config |
| 2026-10-11 | **No local tooling. Owner pushes to GitHub and checks the live staging site; GitHub Actions is the only build/check environment** (`deploy.yml`: npm ci, astro check, build, deploy to Pages). All PUBLIC_* values come from GitHub repository Variables | Owner's workflow choice; sandbox also has no npm/Deno access | Local npm install/build/dev |
| 2026-10-11 | Base path configurable via BASE_PATH (staging `/qbit`, production `/`); internal links use `withBase()` | Staging repo is a GitHub Pages project site (harsha-maloth/qbit); production on cPanel stays at `/` | Custom domain just for staging; hardcoded `/` |
| 2026-10-11 | Visual redesign: corporate light theme, palette C (indigo and steel), Bricolage Grotesque + Instrument Sans, square-ish components, no all-caps labels, gold retired | Owner disliked the dark/gold template look; wants modern corporate | Palettes A (navy/azure), B (graphite/teal), D (forest/stone); keeping gold |
| 2026-10-11 | deploy.yml uses `npm install` instead of `npm ci` until package-lock.json is regenerated | New font packages were added without network access to update the lockfile | Blocking the build on a stale lockfile |
| 2026-10-11 | Home page: wave-ridge canvas hero (external script, pauses off-screen, static under reduced-motion); card grids replaced by ruled rows; eyebrow badges and the 'Fields' section dropped (programs list covers it); headline shortened to 'Where deep research meets the founders who build with it.' | Redesign plan: one memorable element, quieter everything else | Repeated card grids; image hero (no assets yet) |
| 2026-10-11 | Inner pages share `.rows` (ruled list) and `.statement` styles in global.css; no card grids on content pages; FAQ accordion uses a +/- marker; no copy changed | Consistency and fewer repeated-card layouts | Per-page scoped copies of the same CSS |
| 2026-10-11 | Apply page: form grouped into two fieldsets (About you, Your project) beside a 'What happens next' aside using only facts already in the FAQ; Turnstile theme set to light | Calmer, clearer form on the light theme; no invented program facts | Single long ungrouped form |
