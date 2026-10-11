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
