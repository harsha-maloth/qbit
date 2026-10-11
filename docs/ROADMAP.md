# Roadmap

Legend: [x] done, [ ] todo. Update after every change. Target: ~4 weeks, one developer.
Order matters: prove the backend (B) before building UI on it. A and B need no frontend.

## Phase A: Unblock (days 1-2)
- [x] Audit legacy site (docs/LEGACY_AUDIT.md)
- [x] Plan written (docs/PLAN.md)
- [x] Repo with context, decisions, logs, agent rules
- [x] Fix invalid `// test` line in supabase/config.toml (was breaking TOML parse)
- [ ] OWNER: domain, GitHub repo name, logo (SVG), team photos, real bios, analytics choice, confirm backend stays on Supabase
- [ ] Create GitHub repo, push, enable Pages (Actions source), branch protection
- [x] Supabase staging project created (ref jmnerioqziikkqzuscpp; URL + anon key are public values). Prod project still todo
- [ ] Supabase prod project
- [ ] Resend domain (SPF/DKIM), Turnstile site
- [ ] Check cPanel plan: AutoSSL, SFTP/SSH, Apache .htaccess enabled

## Phase B: Prove the backend (days 2-4)
- [x] Migration: tables, RLS, rate limits, ping, purge (supabase/migrations)
- [x] Edge Function `apply`
- [x] Reviewers table, is_reviewer/is_admin, update_application RPC, audit log, admin view
- [x] Apply migration + deploy `apply` to staging (needs `supabase link` + DB password; owner or CI runs it)
- [x] scripts/check-anon.sh: anon-key RLS, RPC, signup and apply-function checks (owner runs it; sandbox cannot reach supabase.co)
- [ ] Add GH Pages staging origin to ALLOWED_ORIGINS
- [ ] Automated RLS tests: anon and non-reviewer get nothing from applications/application_events/reviewers; reviewer cannot read ip_hash, edit applicant fields, or delete
- [ ] Function tests: valid, duplicate email, honeypot, bad captcha, rate limit, oversized, wrong origin, Supabase down
- [ ] Review: record rate-limit hit only after earlier checks pass

## Phase C: Frontend foundation (days 4-8)
- [x] Phase C source written (UNBUILT: sandbox cannot reach npm; owner must run `npm install && npm run check && npm run build`, then tick the items below)
- [ ] Astro project scaffold (TypeScript)
- [ ] Tokens from legacy/styles.css as CSS variables
- [ ] Self-host Inter
- [ ] Components: Header (accessible mobile menu), Footer, Button, Badge, Card, ProfileCard, Section, CTAPanel, FormField
- [ ] BaseLayout (SEO meta, skip link, meta CSP)
- [ ] Team/program data in content files

## Phase D: Pages, form, admin (days 8-18)
- [x] Mission, Philosophy, Team, Programs pages built (unbuilt/unchecked until owner runs `npm run check && npm run build`)
- [ ] Create public/og-image.png (1200x630) and replace placeholder logo.svg; fix robots.txt sitemap domain
- [x] Home, Mission, Philosophy, Team, Programs, FAQ, 404 written
- [ ] Privacy + Terms: DRAFTS written (noindex, [OWNER TO CONFIRM] markers); owner/lawyer review, then remove from STUBS
- [ ] OWNER: real bios + photos for 7 team members; extra FAQ answers (cost, length, timeline)
- [ ] Optimized images with alt text
- [ ] Old-URL 301s (.html, Phillosophy) done in public/.htaccess (Phase F), not as Astro pages
- [x] Apply form UI written: validation, loading, Turnstile, error handling, thanks page, mailto/Discord fallback (UNTESTED end to end: owner runs check/build, redeploys function, sets Turnstile secret, submits a test)
- [x] apply function: email now truly best-effort (missing RESEND/TEAM_NOTIFY no longer 500s after insert) (needs redeploy)
- [ ] Replace Cloudflare TEST Turnstile keys with real ones before any public launch
- [ ] Admin UI island: magic-link login, access-denied state
- [ ] Applications table: pagination, search, filters
- [ ] Detail panel, status change, notes, activity history; open from email link (?id=)

## Redesign (palette C)
- [x] Step 1: tokens, fonts, global styles, header/footer/buttons/cards/forms restyled (UNBUILT: check the Actions run)
- [ ] Step 2: home page + wave hero (external canvas script, reduced-motion fallback)
- [ ] Step 3: inner pages (mission, philosophy, team, programs, FAQ) editorial layouts
- [ ] Step 4: apply form + thanks polish
- [ ] Step 5: contrast, keyboard, 360px, reduced-motion pass
- [ ] Regenerate package-lock.json (commit the one CI produces) and switch deploy.yml back to `npm ci`

## Phase E: Quality gates in CI (days 14-20)
- [x] keepalive.yml
- [x] log-check.yml
- [ ] ci.yml: lint, type-check, build, link check, Lighthouse CI (95+ enforced), axe, gitleaks secret scan
- [ ] SEO: meta, sitemap, robots (disallow /admin), canonical, OG, JSON-LD
- [ ] Manual a11y pass: gold-on-dark contrast, keyboard, screen reader, 360px, reduced motion
- [ ] Dependabot
- [ ] supabase.yml (migrations + functions deploy)
- [x] deploy.yml (GitHub Pages staging): written, NOT YET RUN. Owner: Settings > Pages > Source = GitHub Actions; add repo Variables SITE_URL, PUBLIC_SUPABASE_URL, PUBLIC_SUPABASE_ANON_KEY, PUBLIC_TURNSTILE_SITE_KEY (and optional PUBLIC_CONTACT_EMAIL)

## Phase F: Security and privacy (days 18-22)
- [ ] public/.htaccess: HTTPS, clean URLs, 301s, CSP (allow Supabase URL + challenges.cloudflare.com), HSTS, X-Content-Type-Options, Referrer-Policy, Permissions-Policy, caching, 404
- [ ] Admin MFA (TOTP)
- [ ] Privacy policy (India DPDP + GDPR), consent wording, retention routine for declined applications
- [ ] Secret rotation notes

## Phase G: Operations (days 20-24)
- [ ] backup.yml: encrypted weekly dump to private storage (never public artifacts)
- [ ] UptimeRobot: rpc/ping + form health, alerts to owner
- [ ] Auth custom SMTP via Resend
- [ ] Runbook (add team member, change form field, roll back)

## Phase H: Release (days 24-28)
- [ ] GH Pages staging: full end-to-end test
- [ ] cPanel deploy workflow (SFTP/FTPS, secrets in GitHub) or .cpanel.yml
- [ ] cPanel staging subdomain: check headers, redirects, form, magic link
- [ ] Production cutover: Supabase Auth Site URL + redirects, ALLOWED_ORIGINS, SITE_URL, Turnstile hostname, Resend domain
- [ ] Post-cutover checks; previous build kept for rollback

## Definition of ready to ship
- CI green; Lighthouse 95+ on every page; zero axe violations
- All RLS and function tests pass against production settings
- Real application end to end: form -> row -> both emails -> admin -> status change in audit log
- Backup restore verified; monitoring alerts reach the owner
- Docs, CHANGELOG, AI_LOG current

## Later (optional)
- CSV export, decision email, dashboard counts, events, blog, startup showcase
