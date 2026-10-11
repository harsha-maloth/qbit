# Collective Qubits: backend (Supabase)

## Deploy
1. Create a Supabase project, then `supabase link --project-ref <ref>`
2. `supabase db push`
3. Set function secrets:
   `supabase secrets set TURNSTILE_SECRET=... RESEND_API_KEY=... MAIL_FROM="Collective Qubits <apply@yourdomain.com>" TEAM_NOTIFY_EMAIL=team@yourdomain.com ALLOWED_ORIGINS=https://yourdomain.com IP_HASH_SALT=$(openssl rand -hex 32) SITE_URL=https://yourdomain.com`
4. `supabase functions deploy apply --no-verify-jwt`
5. Dashboard > Auth: disable signups, set custom SMTP (Resend), set Site URL and redirect allowlist to `https://yourdomain.com/admin`
6. Invite yourself (Auth > Users > Invite), then run the `insert into public.reviewers ...` statement at the bottom of the migration.
7. GitHub repo secrets: `SUPABASE_URL`, `SUPABASE_ANON_KEY` (used by keepalive.yml). Also point UptimeRobot at `<SUPABASE_URL>/rest/v1/rpc/ping` as a second keep-alive.

## Must-pass checks before launch
- With only the anon key, `select` on `applications`, `application_events`, `reviewers` returns nothing or an error.
- A signed-in user not in `reviewers` gets nothing.
- A reviewer cannot read `ip_hash`, edit applicant fields, or delete rows.
