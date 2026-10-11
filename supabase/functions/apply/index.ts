// Collective Qubits: public application endpoint.
// Flow: CORS -> parse/validate -> honeypot -> Turnstile -> rate limit -> insert -> emails.
import { createClient } from "npm:@supabase/supabase-js@2";
import { z } from "npm:zod@3";

const env = (k: string, required = true) => {
  const v = Deno.env.get(k);
  if (!v && required) throw new Error(`Missing env ${k}`);
  return v ?? "";
};

const supabase = createClient(env("SUPABASE_URL"), env("SUPABASE_SERVICE_ROLE_KEY"), {
  auth: { persistSession: false },
});

const allowedOrigins = env("ALLOWED_ORIGINS").split(",").map((s) => s.trim()).filter(Boolean);

const Schema = z.object({
  name: z.string().trim().min(2).max(120),
  email: z.string().trim().toLowerCase().email().max(254),
  affiliation: z.string().trim().min(2).max(160),
  stage: z.enum(["Early Prototype", "Research Phase", "Pre-launch"]),
  focus: z.string().trim().min(2).max(200),
  summary: z.string().trim().min(20).max(4000),
  website: z.string().trim().url().max(300).optional().or(z.literal("")),
  team_size: z.coerce.number().int().min(1).max(500).optional(),
  consent: z.literal(true),
  turnstileToken: z.string().min(10).max(4096),
  hp: z.string().optional(), // honeypot: real users leave it empty
});

function cors(origin: string | null) {
  const ok = origin && allowedOrigins.includes(origin);
  return {
    "Access-Control-Allow-Origin": ok ? origin! : allowedOrigins[0] ?? "",
    "Access-Control-Allow-Headers": "content-type, authorization, apikey, x-client-info",
    "Access-Control-Allow-Methods": "POST, OPTIONS",
    "Vary": "Origin",
  };
}

const json = (body: unknown, status: number, origin: string | null) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...cors(origin), "Content-Type": "application/json" },
  });

async function sha256(s: string) {
  const buf = await crypto.subtle.digest("SHA-256", new TextEncoder().encode(s));
  return [...new Uint8Array(buf)].map((b) => b.toString(16).padStart(2, "0")).join("");
}

const esc = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" }[c]!));

async function verifyTurnstile(token: string, ip: string) {
  const res = await fetch("https://challenges.cloudflare.com/turnstile/v0/siteverify", {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: new URLSearchParams({ secret: env("TURNSTILE_SECRET"), response: token, remoteip: ip }),
  });
  const data = await res.json();
  return data.success === true;
}

async function sendEmail(to: string, subject: string, html: string) {
  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${env("RESEND_API_KEY")}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from: env("MAIL_FROM"), to, subject, html }),
  });
  if (!res.ok) console.error("Resend error", res.status, await res.text());
}

Deno.serve(async (req) => {
  const origin = req.headers.get("origin");

  if (req.method === "OPTIONS") return new Response(null, { status: 204, headers: cors(origin) });
  if (req.method !== "POST") return json({ error: "method_not_allowed" }, 405, origin);
  if (!origin || !allowedOrigins.includes(origin)) return json({ error: "forbidden_origin" }, 403, origin);

  try {
    const raw = await req.text();
    if (raw.length > 20_000) return json({ error: "payload_too_large" }, 413, origin);

    let body: unknown;
    try { body = JSON.parse(raw); } catch { return json({ error: "invalid_json" }, 400, origin); }

    const parsed = Schema.safeParse(body);
    if (!parsed.success) {
      return json({ error: "validation_failed", fields: parsed.error.flatten().fieldErrors }, 422, origin);
    }
    const { turnstileToken, hp, website, team_size, ...fields } = parsed.data;

    // Honeypot: pretend success so bots learn nothing.
    if (hp) return json({ ok: true }, 200, origin);

    const ip = req.headers.get("cf-connecting-ip") ??
      req.headers.get("x-forwarded-for")?.split(",")[0].trim() ?? "unknown";

    if (!(await verifyTurnstile(turnstileToken, ip))) {
      return json({ error: "captcha_failed" }, 400, origin);
    }

    const salt = env("IP_HASH_SALT");
    const ipHash = await sha256(`${salt}:${ip}`);
    const emailHash = await sha256(`${salt}:${fields.email}`);

    const ipOk = await supabase.rpc("check_rate_limit", { p_key: `ip:${ipHash}`, p_max: 3, p_window: "1 hour" });
    const emailOk = await supabase.rpc("check_rate_limit", { p_key: `email:${emailHash}`, p_max: 1, p_window: "1 day" });
    if (ipOk.error || emailOk.error) throw new Error("rate limit check failed");
    if (!ipOk.data || !emailOk.data) return json({ error: "rate_limited" }, 429, origin);

    const { data: row, error } = await supabase
      .from("applications")
      .insert({
        ...fields,
        website: website || null,
        team_size: team_size ?? null,
        ip_hash: ipHash,
      })
      .select("id")
      .single();
    if (error) {
      console.error("insert failed", error.message);
      return json({ error: "server_error" }, 500, origin);
    }

    // Emails are best-effort: a mail outage must not lose or fail the application.
    const siteUrl = env("SITE_URL");
    await Promise.allSettled([
      sendEmail(
        fields.email,
        "We received your Collective Qubits application",
        `<p>Hi ${esc(fields.name)},</p>
         <p>Thanks for applying to Collective Qubits. Our team will review your application and get back to you.</p>
         <p>Reference: ${row.id}</p>`,
      ),
      sendEmail(
        env("TEAM_NOTIFY_EMAIL"),
        `New application: ${fields.name} (${fields.affiliation})`,
        `<p><strong>${esc(fields.name)}</strong> from ${esc(fields.affiliation)} applied (${esc(fields.stage)}).</p>
         <p>Focus: ${esc(fields.focus)}</p>
         <p><a href="${siteUrl}/admin?id=${row.id}">Open in admin</a></p>`,
      ),
    ]);

    return json({ ok: true }, 201, origin);
  } catch (e) {
    console.error("apply error", e);
    return json({ error: "server_error" }, 500, origin);
  }
});
