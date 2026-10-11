-- Collective Qubits: schema, RLS, admin RPCs, audit log
-- Applicants never touch tables directly. Only the `apply` Edge Function (service role) inserts.

create type public.application_status as enum ('new', 'reviewing', 'accepted', 'declined');

-- ---------------------------------------------------------------- reviewers
create table public.reviewers (
  user_id uuid primary key references auth.users (id) on delete cascade,
  email text not null,
  role text not null default 'reviewer' check (role in ('admin', 'reviewer')),
  created_at timestamptz not null default now()
);
alter table public.reviewers enable row level security;

create function public.is_reviewer() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.reviewers where user_id = (select auth.uid())) $$;

create function public.is_admin() returns boolean
language sql stable security definer set search_path = ''
as $$ select exists (select 1 from public.reviewers where user_id = (select auth.uid()) and role = 'admin') $$;

revoke all on function public.is_reviewer(), public.is_admin() from public, anon;
grant execute on function public.is_reviewer(), public.is_admin() to authenticated;

revoke all on public.reviewers from anon, authenticated;
grant select on public.reviewers to authenticated;
grant insert, update, delete on public.reviewers to authenticated;

create policy "reviewers: read own row or admin reads all" on public.reviewers
  for select to authenticated using (user_id = (select auth.uid()) or public.is_admin());
create policy "reviewers: admin manages" on public.reviewers
  for all to authenticated using (public.is_admin()) with check (public.is_admin());

-- ------------------------------------------------------------- applications
create table public.applications (
  id uuid primary key default gen_random_uuid(),
  created_at timestamptz not null default now(),
  updated_at timestamptz not null default now(),
  name text not null check (char_length(name) between 2 and 120),
  email text not null check (char_length(email) <= 254 and email ~* '^[^@\s]+@[^@\s]+\.[^@\s]+$'),
  affiliation text not null check (char_length(affiliation) between 2 and 160),
  stage text not null check (stage in ('Early Prototype', 'Research Phase', 'Pre-launch')),
  focus text not null check (char_length(focus) between 2 and 200),
  summary text not null check (char_length(summary) between 20 and 4000),
  website text check (website is null or char_length(website) <= 300),
  team_size int check (team_size is null or team_size between 1 and 500),
  consent boolean not null check (consent = true),
  ip_hash text,
  status public.application_status not null default 'new',
  notes text check (notes is null or char_length(notes) <= 5000),
  reviewed_by uuid references auth.users (id) on delete set null
);
create index applications_status_created_idx on public.applications (status, created_at desc);
create index applications_email_idx on public.applications (lower(email));

alter table public.applications enable row level security;

-- Column-level grants: ip_hash is never readable by the browser.
revoke all on public.applications from anon, authenticated;
grant select (id, created_at, updated_at, name, email, affiliation, stage, focus, summary,
              website, team_size, consent, status, notes, reviewed_by)
  on public.applications to authenticated;
grant delete on public.applications to authenticated;

create policy "applications: reviewers read" on public.applications
  for select to authenticated using (public.is_reviewer());
create policy "applications: admins delete" on public.applications
  for delete to authenticated using (public.is_admin());
-- No insert/update policies: inserts come from the Edge Function, updates go through update_application().

create view public.applications_admin with (security_invoker = true) as
  select id, created_at, updated_at, name, email, affiliation, stage, focus, summary,
         website, team_size, consent, status, notes, reviewed_by
  from public.applications;
revoke all on public.applications_admin from anon, authenticated;
grant select on public.applications_admin to authenticated;

-- --------------------------------------------------------------- audit log
create table public.application_events (
  id bigint generated always as identity primary key,
  application_id uuid not null,            -- intentionally no FK: history survives deletion
  actor_id uuid,
  actor_email text,
  action text not null,                    -- status_change | note_update | deleted
  from_status public.application_status,
  to_status public.application_status,
  created_at timestamptz not null default now()
);
create index application_events_app_idx on public.application_events (application_id, created_at desc);
alter table public.application_events enable row level security;
revoke all on public.application_events from anon, authenticated;
grant select on public.application_events to authenticated;
create policy "events: reviewers read" on public.application_events
  for select to authenticated using (public.is_reviewer());

-- Reviewers can only change status + notes, via this RPC.
create function public.update_application(p_id uuid, p_status public.application_status, p_notes text)
returns void
language plpgsql security definer set search_path = ''
as $$
declare
  old_row public.applications%rowtype;
  who text;
begin
  if not public.is_reviewer() then
    raise exception 'forbidden' using errcode = '42501';
  end if;

  select * into old_row from public.applications where id = p_id for update;
  if not found then
    raise exception 'application not found' using errcode = 'P0002';
  end if;

  select email into who from auth.users where id = (select auth.uid());

  update public.applications
     set status = p_status,
         notes = p_notes,
         reviewed_by = (select auth.uid()),
         updated_at = now()
   where id = p_id;

  if old_row.status is distinct from p_status then
    insert into public.application_events (application_id, actor_id, actor_email, action, from_status, to_status)
    values (p_id, (select auth.uid()), who, 'status_change', old_row.status, p_status);
  end if;
  if old_row.notes is distinct from p_notes then
    insert into public.application_events (application_id, actor_id, actor_email, action)
    values (p_id, (select auth.uid()), who, 'note_update');
  end if;
end $$;

revoke all on function public.update_application(uuid, public.application_status, text) from public, anon;
grant execute on function public.update_application(uuid, public.application_status, text) to authenticated;

create function public.log_application_delete() returns trigger
language plpgsql security definer set search_path = ''
as $$
begin
  insert into public.application_events (application_id, actor_id, actor_email, action, from_status)
  values (old.id, (select auth.uid()),
          (select email from auth.users where id = (select auth.uid())),
          'deleted', old.status);
  return old;
end $$;
create trigger applications_log_delete before delete on public.applications
  for each row execute function public.log_application_delete();

-- -------------------------------------------------------------- rate limits
create table public.rate_limits (
  id bigint generated always as identity primary key,
  key text not null,
  created_at timestamptz not null default now()
);
create index rate_limits_key_created_idx on public.rate_limits (key, created_at desc);
alter table public.rate_limits enable row level security;
revoke all on public.rate_limits from anon, authenticated;

-- Returns true if allowed (and records the hit), false if the limit is exceeded.
create function public.check_rate_limit(p_key text, p_max int, p_window interval)
returns boolean
language plpgsql security definer set search_path = ''
as $$
declare hits int;
begin
  delete from public.rate_limits where created_at < now() - interval '2 days';
  select count(*) into hits from public.rate_limits
   where key = p_key and created_at > now() - p_window;
  if hits >= p_max then return false; end if;
  insert into public.rate_limits (key) values (p_key);
  return true;
end $$;
revoke all on function public.check_rate_limit(text, int, interval) from public, anon, authenticated;
grant execute on function public.check_rate_limit(text, int, interval) to service_role;

-- --------------------------------------------------------------- keep-alive
create function public.ping() returns timestamptz
language sql stable as $$ select now() $$;
grant execute on function public.ping() to anon, authenticated;

-- --------------------------------------------------------------- retention
-- Schedule with pg_cron or run manually: select public.purge_declined(12);
create function public.purge_declined(p_months int default 12) returns int
language plpgsql security definer set search_path = ''
as $$
declare n int;
begin
  delete from public.applications
   where status = 'declined' and updated_at < now() - make_interval(months => p_months);
  get diagnostics n = row_count;
  return n;
end $$;
revoke all on function public.purge_declined(int) from public, anon, authenticated;
grant execute on function public.purge_declined(int) to service_role;

-- To add the first admin (after inviting them in Auth > Users), run once:
-- insert into public.reviewers (user_id, email, role)
-- select id, email, 'admin' from auth.users where email = 'you@yourdomain.com';
