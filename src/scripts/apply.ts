// Apply form: native validation with accessible messages, Turnstile, and clear failure handling.
// The browser never writes to the database; it only calls the `apply` Edge Function.

interface TurnstileApi {
  render(el: HTMLElement, opts: Record<string, unknown>): string;
  reset(id?: string): void;
}
declare global {
  interface Window {
    turnstile?: TurnstileApi;
  }
}

const FIELD_LABELS: Record<string, string> = {
  name: "Full name",
  email: "Email address",
  affiliation: "Affiliation",
  stage: "Current stage",
  focus: "Project focus",
  summary: "Project description",
  website: "Website",
  team_size: "Team size",
  consent: "Consent",
};

const form = document.querySelector<HTMLFormElement>("#apply-form");
if (form) init(form);

function loadTurnstile(): Promise<void> {
  return new Promise((resolve, reject) => {
    if (window.turnstile) return resolve();
    const s = document.createElement("script");
    s.src = "https://challenges.cloudflare.com/turnstile/v0/api.js?render=explicit";
    s.async = true;
    s.onload = () => resolve();
    s.onerror = () => reject(new Error("turnstile failed to load"));
    document.head.appendChild(s);
  });
}

function init(form: HTMLFormElement) {
  const endpoint = form.dataset.endpoint ?? "";
  const siteKey = form.dataset.sitekey ?? "";
  const contact = form.dataset.contact ?? "";
  const status = document.getElementById("form-status") as HTMLElement;
  const box = document.getElementById("turnstile-box") as HTMLElement;
  const submit = form.querySelector<HTMLButtonElement>("button[type=submit]") as HTMLButtonElement;

  let widgetId: string | undefined;
  let token = "";

  const say = (msg: string, isError = false) => {
    status.textContent = msg;
    status.classList.toggle("is-error", isError);
  };
  const fallbackHint = contact ? ` You can also email ${contact}.` : " You can also reach us on Discord.";

  const errorEl = (el: Element) => document.getElementById(`${el.id}-error`);
  const clearErrors = () => {
    form.querySelectorAll<HTMLElement>("[aria-invalid]").forEach((el) => el.removeAttribute("aria-invalid"));
    form.querySelectorAll<HTMLElement>("p.error").forEach((p) => {
      p.textContent = "";
      p.hidden = true;
    });
  };
  const setError = (el: HTMLElement, msg: string) => {
    el.setAttribute("aria-invalid", "true");
    const p = errorEl(el);
    if (p) {
      p.textContent = msg;
      p.hidden = false;
    }
  };

  const resetCaptcha = () => {
    token = "";
    if (widgetId !== undefined) window.turnstile?.reset(widgetId);
  };

  if (!endpoint || !siteKey) {
    say("The application form is not configured yet." + fallbackHint, true);
    submit.disabled = true;
    return;
  }

  loadTurnstile()
    .then(() => {
      widgetId = window.turnstile!.render(box, {
        sitekey: siteKey,
        theme: "dark",
        callback: (t: string) => { token = t; },
        "expired-callback": () => { token = ""; },
        "error-callback": () => { token = ""; },
      });
    })
    .catch(() => say("The spam check could not load. Please reload the page." + fallbackHint, true));

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    clearErrors();
    say("");

    // 1. Client-side validation (the server validates again; this is for fast feedback).
    const invalid: HTMLElement[] = [];
    form.querySelectorAll<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>("input, select, textarea").forEach((el) => {
      if (el.name === "hp" || !el.willValidate || el.validity.valid) return;
      setError(el, el.validationMessage);
      invalid.push(el);
    });
    if (invalid.length) {
      say(`Please fix ${invalid.length === 1 ? "the highlighted field" : "the highlighted fields"}.`, true);
      invalid[0]!.focus();
      return;
    }
    if (!token) {
      say("Please complete the spam check below, then submit again.", true);
      return;
    }

    // 2. Build payload. Optional empty fields are omitted so server validation accepts them.
    const fd = new FormData(form);
    const text = (k: string) => String(fd.get(k) ?? "").trim();
    const payload: Record<string, unknown> = {
      name: text("name"),
      email: text("email"),
      affiliation: text("affiliation"),
      stage: text("stage"),
      focus: text("focus"),
      summary: text("summary"),
      consent: (form.elements.namedItem("consent") as HTMLInputElement).checked,
      turnstileToken: token,
      hp: text("hp"),
    };
    if (text("website")) payload.website = text("website");
    if (text("team_size")) payload.team_size = Number(text("team_size"));

    // 3. Send.
    submit.disabled = true;
    say("Sending…");
    const ctrl = new AbortController();
    const timer = window.setTimeout(() => ctrl.abort(), 20000);
    try {
      const res = await fetch(endpoint, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
        signal: ctrl.signal,
      });
      if (res.ok) {
        window.location.assign("/apply/thanks/");
        return;
      }
      const data = (await res.json().catch(() => ({}))) as { error?: string; fields?: Record<string, string[]> };

      if (res.status === 422 && data.fields) {
        let first: HTMLElement | null = null;
        for (const [name, msgs] of Object.entries(data.fields)) {
          const el = form.elements.namedItem(name);
          if (el instanceof HTMLElement) {
            setError(el, msgs?.[0] ?? `${FIELD_LABELS[name] ?? name} is not valid.`);
            first ??= el;
          }
        }
        say("Some details need another look.", true);
        first?.focus();
      } else if (res.status === 429) {
        say("You have reached the submission limit. Please try again later." + fallbackHint, true);
      } else if (res.status === 400 && data.error === "captcha_failed") {
        say("The spam check failed. Please complete it again and resubmit.", true);
      } else if (res.status === 413) {
        say("Your message is too long. Please shorten it and try again.", true);
      } else {
        say("Something went wrong on our side. Your application was not sent." + fallbackHint, true);
      }
    } catch {
      say("We could not reach the server. Check your connection and try again." + fallbackHint, true);
    } finally {
      window.clearTimeout(timer);
      submit.disabled = false;
      resetCaptcha(); // tokens are single-use
    }
  });
}

export {};
