# Agent instructions (read fully before doing anything)

This repo is the Collective Qubits website. The owner does not want to repeat context between sessions. Everything an agent needs is in `docs/`. Keep it current.

## 1. At the start of every session
Read, in this order:
1. `docs/PROJECT_CONTEXT.md`
2. `docs/ROADMAP.md` (find the next unchecked task)
3. `docs/DECISIONS.md`
4. The last 5 entries of `docs/AI_LOG.md`
Do not re-ask questions that the docs already answer. Do not re-propose rejected options.

## 2. After EVERY change (mandatory, no exceptions)
A "change" is any file added, edited, moved, or deleted, or any decision made.
1. Run `./scripts/log.sh <type> "<summary>" "<details>"`
   - types: feat, fix, docs, refactor, chore, security, decision
   - this appends to `docs/AI_LOG.md`, adds a line to `CHANGELOG.md`, and commits.
2. Tick or add items in `docs/ROADMAP.md`.
3. If a choice was made, add an entry to `docs/DECISIONS.md` (date, decision, why, alternatives rejected).
4. If a project fact changed (stack, status, URLs, env vars), update `docs/PROJECT_CONTEXT.md`.
5. Commit message format: `type: short summary` (conventional commits).
A pre-commit hook and the `log-check` CI workflow reject commits that change code without touching `CHANGELOG.md`.

## 3. At the end of every session
Append a "Handoff" block to `docs/AI_LOG.md`: what is done, what is half-done, exact next step, open questions for the owner.

## 4. Non-negotiable engineering rules
- **Never commit secrets** (service role key, Resend key, Turnstile secret). Only `PUBLIC_*` values may be in the frontend.
- **Security lives in Supabase RLS**, not in hiding pages. The anon key must never be able to read `applications`, `application_events`, or `reviewers`.
- The browser never inserts applications directly. It calls the `apply` Edge Function.
- `ip_hash` is never exposed to the browser. Reviewers can only change status and notes via `update_application()`.
- Public signups stay disabled. Reviewers log in by **magic link only** (no OAuth).
- `legacy/` is reference only. Do not edit it.
- Every page needs unique title and description, accessible markup (WCAG 2.2 AA), and works at 360px width.
- Final hosting is **cPanel (static files + .htaccess)**; GitHub Pages is dev/staging only. GitHub Pages cannot set headers, so keep a meta CSP as a fallback and put real headers/redirects in `public/.htaccess`. Keep base path `/`.
- Never commit cPanel/FTP credentials.
- Free-tier Supabase pauses when idle: do not remove `keepalive.yml`.

## 5. Style
- TypeScript, Astro components, CSS variables from the design tokens (gold `#ffb800` on dark `#08090b`, Inter font, self-hosted).
- No duplicated header/footer markup. Team and program data live in content files, not HTML.
- Prefer small, reviewable commits.

## 6. When unsure
Ask the owner one short question, and record the answer in `docs/DECISIONS.md`.
