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
