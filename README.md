# Collective Qubits

Website for Collective Qubits, a deep-tech incubator for founders and research teams.

- **Frontend:** Astro (static) on GitHub Pages, custom domain
- **Backend:** Supabase (Postgres + RLS + Auth magic link + Edge Functions)
- **Status:** backend written, frontend not yet started. See `docs/ROADMAP.md`.

## Start here (humans and AI agents)
| File | Purpose |
|---|---|
| `AGENTS.md` | Rules every AI agent must follow, including the update-log-on-every-change rule |
| `docs/PROJECT_CONTEXT.md` | What the project is, stack, constraints, current state |
| `docs/PLAN.md` | Full architecture and build plan |
| `docs/DECISIONS.md` | Decisions made and why |
| `docs/ROADMAP.md` | Checklist of phases and tasks |
| `docs/LEGACY_AUDIT.md` | Bugs found in the original static site |
| `docs/AI_LOG.md` | Session-by-session log of what the AI did |
| `CHANGELOG.md` | Every change, newest first |

## Layout
```
legacy/      original uploaded static site (reference only, do not edit)
supabase/    migrations, Edge Function, config (see supabase/README.md)
docs/        context, plan, decisions, roadmap, logs
scripts/     setup.sh, log.sh
.githooks/   pre-commit check that enforces changelog updates
.github/     keepalive.yml, log-check.yml
src/         (to be created) Astro site
```

## One-time setup
```bash
bash scripts/setup.sh    # makes scripts executable and enables the git hook that enforces logging
```

## Logging a change (agents and humans)
```bash
bash scripts/log.sh feat "Add Header component" "Accessible mobile menu, keyboard + focus handling"
```
This appends to `docs/AI_LOG.md`, adds a line to `CHANGELOG.md`, and commits everything.
