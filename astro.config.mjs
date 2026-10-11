import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// SITE_URL is set per environment in CI (staging on GitHub Pages, production on cPanel).
// Base path stays "/" everywhere (custom domain), see AGENTS.md.
// Stub/draft pages are noindex; keep them out of the sitemap too.
// Remove entries from STUBS as each real page lands.
const STUBS = ["/apply/", "/privacy/", "/terms/"]; // apply: form not built yet; privacy/terms: drafts pending review

export default defineConfig({
  site: process.env.SITE_URL || "http://localhost:4321",
  base: "/",
  output: "static",
  trailingSlash: "always",
  // Keep CSS in external files so the CSP never needs 'unsafe-inline' for styles.
  build: { inlineStylesheets: "never" },
  integrations: [
    sitemap({
      filter: (page) => !page.includes("/admin") && !STUBS.some((s) => page.endsWith(s)),
    }),
  ],
});
