#!/usr/bin/env bash
# Phase B check: with ONLY the public anon key, protected tables must expose nothing,
# the apply function must reject bad origins/payloads, and signups must be disabled.
# Usage: SUPABASE_URL=https://xxxx.supabase.co SUPABASE_ANON_KEY=... ORIGIN=http://localhost:4321 bash scripts/check-anon.sh
set -uo pipefail
: "${SUPABASE_URL:?set SUPABASE_URL}"; : "${SUPABASE_ANON_KEY:?set SUPABASE_ANON_KEY}"
ORIGIN="${ORIGIN:-http://localhost:4321}"
fail=0
ok()  { echo "PASS  $1"; }
bad() { echo "FAIL  $1"; fail=1; }
H=(-H "apikey: $SUPABASE_ANON_KEY" -H "Authorization: Bearer $SUPABASE_ANON_KEY")

# 1. ping works for anon (keep-alive)
c=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$SUPABASE_URL/rest/v1/rpc/ping" "${H[@]}" -H 'Content-Type: application/json' -d '{}')
[ "$c" = 200 ] && ok "rpc/ping returns 200" || bad "rpc/ping returned $c (is the migration applied?)"

# 2. protected tables: must be an error, or an empty array, never rows
for t in applications application_events reviewers rate_limits applications_admin; do
  out=$(curl -s "$SUPABASE_URL/rest/v1/$t?select=*&limit=1" "${H[@]}")
  if [ "$out" = "[]" ] || echo "$out" | grep -qiE '"(code|message)"'; then ok "anon cannot read $t"; else bad "anon read from $t: $out"; fi
done

# 3. anon cannot insert directly
c=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$SUPABASE_URL/rest/v1/applications" "${H[@]}" -H 'Content-Type: application/json' -d '{"name":"x"}')
case "$c" in 401|403|404) ok "anon insert rejected ($c)";; *) bad "anon insert returned $c";; esac

# 4. anon cannot call admin RPCs or the rate limiter
for f in update_application check_rate_limit purge_declined is_admin; do
  c=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$SUPABASE_URL/rest/v1/rpc/$f" "${H[@]}" -H 'Content-Type: application/json' -d '{}')
  case "$c" in 400|401|403|404) ok "anon cannot execute $f ($c)";; 200|204) bad "anon executed $f ($c)";; *) bad "$f returned $c";; esac
done

# 5. signups disabled
c=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$SUPABASE_URL/auth/v1/signup" "${H[@]}" -H 'Content-Type: application/json' -d '{"email":"probe@example.com","password":"Probe-12345-xyz"}')
case "$c" in 400|401|403|422) ok "signup rejected ($c)";; *) bad "signup returned $c (must be disabled)";; esac

# 6. apply function: origin allowlist, CORS preflight, malformed body
F="$SUPABASE_URL/functions/v1/apply"
c=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$F" -H 'Origin: https://evil.example' -H 'Content-Type: application/json' -d '{}')
[ "$c" = 403 ] && ok "apply rejects foreign origin" || bad "apply foreign origin returned $c (expected 403)"
c=$(curl -s -o /dev/null -w '%{http_code}' -X OPTIONS "$F" -H "Origin: $ORIGIN")
[ "$c" = 204 ] && ok "apply CORS preflight 204" || bad "apply preflight returned $c"
c=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$F" -H "Origin: $ORIGIN" -H 'Content-Type: application/json' -d 'not json')
[ "$c" = 400 ] && ok "apply rejects invalid JSON" || bad "apply invalid JSON returned $c (expected 400)"
c=$(curl -s -o /dev/null -w '%{http_code}' -X POST "$F" -H "Origin: $ORIGIN" -H 'Content-Type: application/json' -d '{"name":"x"}')
[ "$c" = 422 ] && ok "apply rejects incomplete payload" || bad "apply incomplete payload returned $c (expected 422)"

echo; [ $fail = 0 ] && echo "ALL CHECKS PASSED" || echo "SOME CHECKS FAILED"; exit $fail
