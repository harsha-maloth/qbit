# AI log

Chronological record of what AI agents did, decided, and left open. Newest at the bottom. Appended by `scripts/log.sh`. Each session ends with a Handoff block.

## Session 1 (2026-10-11): analysis, planning, backend, repo
- Owner uploaded 6 files of the original static site (index, Mission, Phillosophy, TEAM, form, styles.css). Reviewed all of them; findings in `docs/LEGACY_AUDIT.md`.
- Produced an industry-grade plan (Astro + Cloudflare/Vercel style stack), then re-planned for **GitHub Pages + Supabase** at the owner's request (`docs/PLAN.md`).
- Owner chose: **in-site admin page**, **Supabase free tier with keep-alive**, **magic link only** login.
- Wrote the Supabase migration, `apply` Edge Function, `config.toml`, `keepalive.yml`. Not executed or tested (no network in the authoring environment): test on a staging project first.
- Built this repo: legacy copy, docs, AGENTS.md, logging script, pre-commit hook, CI changelog check.

### Handoff (end of session 1)
- Done: legacy audit, plan, backend code, repo/logging system.
- Next step: scaffold the Astro project (Phase 1) and port design tokens from `legacy/styles.css`.
- Needs from owner: domain, GitHub repo name, logo/team photos, real bios, analytics choice.
- Caveat: backend code is untested. Run the checks in `supabase/README.md` before launch.

### 2026-10-11 12:47 UTC | chore | Initialize repo and logging system
Added AGENTS.md, log.sh, pre-commit hook, log-check workflow, docs, legacy copy, Supabase backend.

### 2026-10-11 12:47 UTC | chore | Make setup portable and store exec bits
README now uses 'bash scripts/setup.sh'; git index marks scripts and hook executable. Hook activates only after setup.sh so a fresh clone is never blocked by a non-executable hook.

### 2026-10-11 12:47 UTC | decision | Final hosting target is cPanel
Frontend ships as static files to cPanel (.htaccess for headers/redirects); GitHub Pages is dev/staging only; backend stays on Supabase pending owner confirmation. Updated DECISIONS, PROJECT_CONTEXT (cPanel go-live notes), ROADMAP (Phase 5b), AGENTS.md.

### 2026-10-11 12:54 UTC | docs | Phased deployment-readiness plan and config.toml fix
Rewrote ROADMAP into phases A-H (~4 weeks) with definition of ready to ship; backend verification (B) precedes UI. Fixed invalid '// test' line in supabase/config.toml (TOML parse error; verified with tomllib). Updated PROJECT_CONTEXT state. Not done: Phase A needs owner inputs (domain, repo name, assets, bios, analytics) and account setup.

### Handoff (end of session 2)
- Done: reviewed all docs and code; fixed invalid config.toml; ROADMAP rewritten as phases A-H with definition of ready to ship.
- Half-done: nothing.
- Exact next step: Phase A. Get owner inputs, create GitHub repo, create Supabase staging project, then Phase B (deploy migration + function to staging, write RLS and function tests).
- Open questions for owner: domain; GitHub org/repo name; logo + photos; real bios (6 members); analytics tool; confirm backend stays on Supabase.

### 2026-10-11 12:54 UTC | docs | Session 2 handoff
Handoff block appended.

### 2026-10-11 12:56 UTC | feat | Add anon-key verification script and record staging project
scripts/check-anon.sh covers ping, table reads, direct insert, admin RPCs, signup, apply origin/CORS/validation. Could not run: sandbox egress blocks supabase.co (403 from proxy), so project state is unverified. Staging ref recorded in PROJECT_CONTEXT; no keys committed.

### 2026-10-11 13:09 UTC | chore | Staging backend deployed and verified
Migration applied via SQL Editor (CLI db push blocked by network on DB ports). apply function deployed with ALLOWED_ORIGINS/SITE_URL/IP_HASH_SALT secrets. scripts/check-anon.sh: 16/16 pass. Still pending: Turnstile + Resend secrets, first admin invite, real submission test, migration repair, add staging origin.

### 2026-10-11 13:15 UTC | feat | Scaffold Astro site: tokens, layout, components, home, stubs
Phase C source: package.json (astro ^5, sitemap, fontsource inter, check), astro.config (static, base /, inlineStylesheets never, sitemap), design tokens ported from legacy CSS, BaseLayout (SEO, canonical, OG, prod-only meta CSP, skip link), accessible Header with JS-optional mobile menu, Footer, Button, Badge, FeatureCard, ProfileCard (initials fallback), CTAPanel, FormField, data files (site, programs, team), home page ported, 404, noindex stubs for mission/philosophy/team/programs/apply. NOT BUILT: sandbox cannot reach npm (403); owner must run npm install && npm run check && npm run build and report errors. Placeholders: logo.svg, og-image.png missing, robots.txt domain.

### 2026-10-11 13:17 UTC | chore | Add package-lock.json
First local npm install and successful build.

### 2026-10-11 13:21 UTC | fix | Fix astro check findings
FormField type narrowed to valid input types; removed unused import in Header. npm audit: 3 advisories (astro<=7.2.7 and deps), not reachable in static output; upgrade to Astro 7 tracked on a branch.

### 2026-10-11 13:25 UTC | chore | Upgrade to Astro 7
Upgraded astro 5 to 7.3.8, @astrojs/check and sitemap. check and build pass; npm audit clean.

### 2026-10-11 13:26 UTC | chore | Upgrade to Astro 7
astro 5.18 -> 7.3.8, @astrojs/check 0.9.10, @astrojs/sitemap 3.7.4. astro check 0 errors, build 7 pages, npm audit 0 vulnerabilities.

### 2026-10-11 13:28 UTC | feat | Add content pages: mission, philosophy, team, programs, faq; privacy/terms drafts
Ported legacy Mission/Philosophy text, Team from data file (initials fallback, 2 real bios kept), Programs from data, FAQ from decided facts only. Privacy/Terms are noindex drafts with OWNER TO CONFIRM markers, excluded from sitemap. New PageHeader and Panel components, .prose styles, footer links for FAQ/Privacy/Terms. Redirects for old URLs deferred to .htaccess. NOT BUILT: sandbox has no npm access; owner must run npm run check && npm run build.

### 2026-10-11 13:31 UTC | feat | Apply form UI, thanks page, and best-effort email in apply function
New /apply form (FormField, honeypot, consent, Turnstile explicit render, client validation with aria-invalid + live status, 422/429/captcha/413/network handling, single-use token reset, fallback link) and /apply/thanks/ (noindex). apply function: emails skipped when unconfigured, TEAM_NOTIFY_EMAIL optional, send errors swallowed (previously a missing TEAM_NOTIFY_EMAIL returned 500 after the row was saved). Added PUBLIC_CONTACT_EMAIL. NOT RUN: sandbox has no npm/Deno/Supabase access. Owner: run check/build, redeploy function, set Turnstile test secret, test a submission.

### 2026-10-11 13:37 UTC | decision | Switch to push-and-check-live workflow; add deploy.yml
No local npm. GitHub Actions runs npm ci, astro check, build and deploys to Pages. PUBLIC_* values from repo Variables. Not run yet. Staging origin must be added to ALLOWED_ORIGINS and Turnstile hostnames; base path / needs custom domain or user.github.io repo.
