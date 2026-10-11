// Prefix internal paths with the configured base (BASE_PATH env at build time).
// Staging on a GitHub Pages project site uses "/qbit"; cPanel production uses "/".
const base = import.meta.env.BASE_URL.replace(/\/+$/, "");

export function withBase(path: string): string {
  if (/^(https?:|mailto:|tel:|#|\/\/)/.test(path)) return path;
  return base + (path.startsWith("/") ? path : `/${path}`);
}
