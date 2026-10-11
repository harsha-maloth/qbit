import { defineConfig } from "astro/config";
import sitemap from "@astrojs/sitemap";

// SITE_URL is set per environment in CI (staging on GitHub Pages, production on cPanel).
// Base path is "/" in production (cPanel). Staging on a GitHub Pages project site sets BASE_PATH=/qbit.
// Stub/draft pages are noindex; keep them out of the sitemap too.
// Remove entries from STUBS as each real page lands.
const STUBS = ["/apply/thanks/", "/privacy/", "/terms/"]; // thanks: noindex utility page; privacy/terms: drafts pending review

export default defineConfig({
  site: process.env.SITE_URL || "http://localhost:4321",
  base: process.env.BASE_PATH || "/",
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
