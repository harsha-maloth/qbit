# Project context

_Last updated: 2026-10-11_

## What this is
Collective Qubits is a deep-tech incubator for founders, researchers, and hybrid teams (quantum systems, responsible AI, photonics, neurotech, systems design). The website explains the organization and converts visitors into applicants and Discord members.

Community link: https://discord.gg/eg5R8wyKSZ

## Goal
Replace the original 6-file static site (`legacy/`) with an industry-grade, deployable site.
Targets: Lighthouse 95+, WCAG 2.2 AA, reliable application storage with spam protection, automatic deploys from Git, no duplicated header/footer, content in data files.

## Stack (decided)
- Frontend: **Astro + TypeScript**, static output, **GitHub Pages**, custom domain (base path `/`)
- Backend: **Supabase** (Postgres, RLS, Auth, Edge Functions). **Free tier with keep-alive.**
- Form: browser -> Edge Function `apply` -> Postgres + Resend emails
- Spam: Cloudflare Turnstile + honeypot + rate limits (3/hour/IP, 1/day/email)
- Email: Resend (also custom SMTP for Supabase Auth magic links)
- Admin: in-site `/admin` page (static, client-side), Supabase Auth **magic link only**, invite-only, roles `admin` and `reviewer`
- Analytics: Plausible, Umami, or GoatCounter (cookie-free)
- Monitoring: UptimeRobot hitting `rpc/ping` (also a second keep-alive)

## Brand / design tokens (from legacy/styles.css)
bg `#08090b`, surface `#14191f`, text `#f8f4eb`, muted `#b3aa98`, accent gold `#ffb800` (dark `#f59f00`), radius 22px, font Inter (self-host), pill buttons, uppercase letter-spaced labels. Breakpoints 960px and 720px.

## Pages
Home, Mission, Philosophy (legacy typo "Phillosophy" fixed), Team, Programs (new), Apply, Apply/Thanks, FAQ (new), Privacy, Terms, 404, Admin. Old `.html` URLs get redirect stubs.

## Team (from legacy/TEAM.html, placeholder bios need replacing)
Saatwik Chatkara (Founder & CEO), Advait M Dhola (Technical Advisor), Mohamed Armoon Shaliq, Disha Parasu, Sudhi Sharma, Asmita Nama, Sukesh Nasina, Priyanshu Kumar, Aaryan Sharma (all Community & Operations, identical copied bio).

## Current state
- Done: legacy audit, plan, Supabase migration, `apply` Edge Function, config, keep-alive workflow, repo + logging system.
- Not started: Astro project, design system, pages, form UI, admin UI, CI/CD, launch.
- Not provided: image assets (Collectivequbits.jpg, saatwik.png, Adavit.png, Shaliq.png, Disha Parasu.jpeg, Sudhi Sharma.png, Priyanshu.jpeg) and `scripts.js`. Add images to `public/` or `src/assets/`.

## Open questions for the owner
1. Domain name and GitHub org/repo name?
2. Logo files (SVG preferred) and team photos?
3. Real bios for the 6 placeholder team members?
4. Which analytics tool?
5. Extra features wanted later (events, blog, startup showcase)?

## Environment variables
Frontend (public, build time): `PUBLIC_SUPABASE_URL`, `PUBLIC_SUPABASE_ANON_KEY`, `PUBLIC_TURNSTILE_SITE_KEY`
Edge Function secrets: `TURNSTILE_SECRET`, `RESEND_API_KEY`, `MAIL_FROM`, `TEAM_NOTIFY_EMAIL`, `ALLOWED_ORIGINS`, `IP_HASH_SALT`, `SITE_URL` (service role key and URL are provided by Supabase)
GitHub secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (keep-alive)
