# Roadmap

Legend: [x] done, [ ] todo. Update after every change.

## Phase 0: Setup
- [x] Audit legacy site (docs/LEGACY_AUDIT.md)
- [x] Plan written (docs/PLAN.md)
- [x] Repo with context, decisions, logs, agent rules
- [ ] Create GitHub repo, push, enable Pages (Actions source), branch protection
- [ ] Domain + DNS + CNAME file
- [ ] Supabase staging + prod projects
- [ ] Resend domain (SPF/DKIM), Turnstile site

## Phase 1: Design system
- [ ] Astro project scaffold (TypeScript)
- [ ] Tokens from legacy/styles.css as CSS variables
- [ ] Self-host Inter
- [ ] Components: Header (accessible mobile menu), Footer, Button, Badge, Card, ProfileCard, Section, CTAPanel, FormField
- [ ] BaseLayout (SEO meta, skip link, meta CSP)

## Phase 2: Pages and content
- [ ] Home, Mission, Philosophy, Team, Programs, FAQ, Privacy, Terms, 404
- [ ] Team data in content file; real bios; optimized images with alt text
- [ ] Old-URL redirect stubs (.html and Phillosophy)

## Phase 3: Public application pipeline
- [x] Migration: tables, RLS, rate limits, ping, purge (supabase/migrations)
- [x] Edge Function `apply`
- [ ] Apply form UI (validation, loading, Turnstile, success page, mailto fallback)
- [ ] Function tests: valid, duplicate email, bot, rate limit, oversized, Supabase down

## Phase 3b: Admin
- [x] Reviewers table, is_reviewer/is_admin, update_application RPC, audit log, admin view
- [ ] Admin UI island (magic-link login, access denied state)
- [ ] Applications table: pagination, search, filters
- [ ] Detail panel, status change, notes, activity history
- [ ] Optional: MFA for admins, CSV export, decision email, dashboard counts

## Phase 4: Quality and security
- [ ] SEO: meta, sitemap, robots (disallow /admin), canonical, OG, JSON-LD
- [ ] Accessibility pass (contrast of gold on dark, focus, screen reader)
- [ ] RLS tests with anon key and non-reviewer user
- [ ] Secret scan in CI

## Phase 5: CI/CD and launch
- [x] keepalive.yml
- [x] log-check.yml
- [ ] ci.yml (lint, type-check, build, link check, Lighthouse, axe)
- [ ] deploy.yml (GitHub Pages)
- [ ] supabase.yml (migrations + functions deploy)
- [ ] backup.yml (encrypted weekly dump)
- [ ] UptimeRobot monitors, Auth custom SMTP, DNS cutover

## Phase 6: Operations
- [ ] Runbook (add team member, change form field, roll back)
- [ ] Dependabot, quarterly secret rotation, privacy retention routine
