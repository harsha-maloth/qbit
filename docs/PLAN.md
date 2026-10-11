# Build plan: GitHub Pages + Supabase

## Architecture
```
Browser
 |- GitHub Pages: static Astro build, custom domain, HTTPS
 |- Apply form -> Supabase Edge Function /apply
 |     verify Turnstile -> validate (Zod) -> rate limit -> insert -> Resend emails
 |- /admin (static page) -> supabase-js, magic-link auth, RLS decides access
```

## GitHub Pages constraints and mitigations
| Constraint | Mitigation |
|---|---|
| No custom HTTP headers | Meta CSP; optionally Cloudflare (free) in front |
| No _redirects | Redirect stub pages for old .html and Phillosophy URLs |
| No per-PR previews | Build/test on every PR; staging branch + staging Supabase project if needed |
| Free Supabase pauses after ~7 idle days | GH Action ping every 2 days + UptimeRobot every 5 min; upgrade to Pro when applicants arrive |
| GH cron disabled after 60 days no commits | UptimeRobot is the second ping |
| Private repo Pages needs paid plan | Public repo, no secrets in it |
| Project-site base path | Custom domain, base `/` |

## Supabase
Tables: `applications`, `reviewers`, `application_events`, `rate_limits`. RLS on everything; anon has no access. Edge Function (service role) inserts. Reviewers update only status/notes via `update_application()`. Admin delete is admin-only and audited. `ip_hash` hidden by column grants. Daily-ish backups via encrypted `pg_dump` (free tier has none).

## Admin (in-site)
Static `/admin` page; security is entirely RLS. Magic link only, signups off, invite reviewers manually. MVP: login, access-denied state, applications table (pagination/search/filters), detail panel, status + notes, activity history. Phase 2: CSV export, assignment/scoring, decision email, dashboard counts, TOTP MFA for admins. Mark `noindex`, disallow in robots.txt (hygiene only).

## Phases and estimates
| Phase | Work | Time |
|---|---|---|
| 0 | Repo, domain, Supabase, Resend, Turnstile | 2 days |
| 1 | Design system | 3-4 days |
| 2 | Public pages and content | 4-5 days |
| 3 | Application pipeline | 3-4 days |
| 3b | Admin | 4-5 days |
| 4 | SEO, a11y, CSP, security tests | 3 days |
| 5 | CI/CD, keep-alive, backups, launch | 2 days |
Total about 4-5 weeks for one developer.

## Cost
GitHub Pages $0, Supabase free ($25/mo Pro later), Resend free up to 3,000 emails/month, Turnstile/Cloudflare free, domain about $10-15/year.

## Risks
Silent form failure (alerting + visible mailto fallback), personal-data compliance (privacy policy, consent, deletion; GDPR and India DPDP may apply), RLS misconfiguration (automated anon-key test), Supabase default mailer limits (custom SMTP).

## Test checklist
Anon key and non-reviewer users get nothing from protected tables; reviewers cannot read ip_hash, edit applicant fields, or delete; signups confirmed disabled; magic links arrive via Resend; every status change appears in audit log; form: valid, duplicate, bot, rate limit, oversized, Supabase down.
