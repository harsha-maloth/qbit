// Loaded synchronously in <head> (external file, so CSP needs no inline script).
// Lets CSS tell "JS available" from "no JS" before first paint, so the mobile menu never flashes.
document.documentElement.classList.add("js");
