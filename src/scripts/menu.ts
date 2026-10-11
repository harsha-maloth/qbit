// Accessible mobile menu: button toggles aria-expanded, Escape and outside click close it.
const toggle = document.querySelector<HTMLButtonElement>(".menu-toggle");
const nav = document.getElementById("primary-nav");

if (toggle && nav) {
  const setOpen = (open: boolean, returnFocus = false) => {
    toggle.setAttribute("aria-expanded", String(open));
    nav.dataset.open = String(open);
    if (!open && returnFocus) toggle.focus();
  };

  toggle.addEventListener("click", () => {
    setOpen(toggle.getAttribute("aria-expanded") !== "true");
  });

  document.addEventListener("keydown", (e) => {
    if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") setOpen(false, true);
  });

  document.addEventListener("click", (e) => {
    if (!(e.target instanceof Node)) return;
    if (!nav.contains(e.target) && !toggle.contains(e.target)) setOpen(false);
  });

  nav.querySelectorAll("a").forEach((a) => a.addEventListener("click", () => setOpen(false)));

  window.matchMedia("(min-width: 961px)").addEventListener("change", (m) => {
    if (m.matches) setOpen(false);
  });
}
