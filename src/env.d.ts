/// <reference path="../.astro/types.d.ts" />
interface ImportMetaEnv {
  readonly PUBLIC_SUPABASE_URL?: string;
  readonly PUBLIC_SUPABASE_ANON_KEY?: string;
  readonly PUBLIC_TURNSTILE_SITE_KEY?: string;
  readonly PUBLIC_CONTACT_EMAIL?: string;
}
interface ImportMeta {
  readonly env: ImportMetaEnv;
}
