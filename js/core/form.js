/* Contact form — progressively enhances a usable email fallback with the
   portfolio's JSON contact endpoint. Values are cleared only after the server
   confirms acceptance with HTTP 202. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/u;
const FIELD_NAMES = ["name", "email", "interest", "message"];
const NETWORK_COPY = "That didn’t send. Your message is still here; try again or email me directly.";

export async function submitContact(payload, { signal, fetchImpl = globalThis.fetch } = {}) {
  if (typeof fetchImpl !== "function") throw new TypeError("fetch is unavailable");
  const response = await fetchImpl("/api/contact", {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify(payload),
    credentials: "same-origin",
    signal
  });
  let envelope = {};
  try { envelope = await response.json(); } catch { /* malformed server reply */ }
  return { ...envelope, status: response.status };
}

const words = (value) => String(value || "").trim();
const describedByWithoutError = (input) => words(input?.getAttribute("aria-describedby"))
  .split(/\s+/u).filter((id) => id && !id.endsWith("-error"));

export function createContactForm(form, { submitContact: send = submitContact, now = Date.now, timeoutMs = 10_000 } = {}) {
  if (!form) throw new TypeError("form is required");
  /* Native constraint validation remains available when JavaScript is off;
     once enhanced, the stable inline errors below own the experience. */
  form.noValidate = true;
  const fields = Object.fromEntries([...FIELD_NAMES, "website", "startedAt"].map((name) => [name, form.querySelector(`[name="${name}"]`)]));
  const errors = Object.fromEntries(FIELD_NAMES.map((name) => [name, form.querySelector(`#${name}-error`)]));
  const status = form.querySelector("#form-status");
  const button = form.querySelector('[type="submit"]');
  const defaultButtonText = button?.textContent || "Send message";
  const descriptions = Object.fromEntries(FIELD_NAMES.map((name) => [name, describedByWithoutError(fields[name])]));
  let state = "idle";
  let activeController = null;
  let destroyed = false;
  if (fields.startedAt && !words(fields.startedAt.value)) fields.startedAt.value = String(now());

  function transition(next, message = "") {
    state = next;
    form.dataset.state = next;
    if (status) { status.textContent = message; status.dataset.state = next; }
    if (button) { button.disabled = next === "submitting"; button.textContent = next === "submitting" ? "Sending…" : defaultButtonText; }
  }
  function setFieldError(name, message = "") {
    const input = fields[name]; const error = errors[name];
    if (!input || !error) return;
    error.textContent = message;
    const ids = [...descriptions[name]];
    if (message) { input.setAttribute("aria-invalid", "true"); ids.push(error.id || `${name}-error`); }
    else input.removeAttribute("aria-invalid");
    if (ids.length) input.setAttribute("aria-describedby", ids.join(" ")); else input.removeAttribute("aria-describedby");
  }
  const clearErrors = () => FIELD_NAMES.forEach((name) => setFieldError(name));
  function clientErrors() {
    const result = {}; const name = words(fields.name?.value); const email = words(fields.email?.value); const message = words(fields.message?.value);
    if (!name) result.name = "Add your name."; else if (name.length > 120) result.name = "Keep your name under 120 characters.";
    if (!email) result.email = "Add your email address."; else if (email.length > 254 || !EMAIL_RE.test(email)) result.email = "Enter a valid email address.";
    if (!message) result.message = "Add a message."; else if (message.length > 5_000) result.message = "Keep your message under 5,000 characters.";
    return result;
  }
  function showErrors(fieldErrors) {
    clearErrors(); let first = null;
    for (const name of FIELD_NAMES) if (fieldErrors?.[name]) { setFieldError(name, fieldErrors[name]); first ||= fields[name]; }
    first?.focus();
  }
  const payload = () => ({
    name: words(fields.name?.value), email: words(fields.email?.value), interest: words(fields.interest?.value),
    message: words(fields.message?.value), website: words(fields.website?.value), startedAt: Number(fields.startedAt?.value)
  });
  async function onSubmit(event) {
    event.preventDefault();
    if (destroyed || state === "submitting") return;
    transition("validating");
    const validation = clientErrors();
    if (Object.keys(validation).length) { showErrors(validation); transition("validation-error", "Check the highlighted fields."); return; }
    clearErrors(); transition("submitting", "Sending your message…"); activeController = new AbortController();
    const timer = setTimeout(() => activeController?.abort(), timeoutMs);
    try {
      const response = await send(payload(), { signal: activeController.signal });
      if (destroyed) return;
      if (response.status === 202 && response.ok === true) {
        form.reset(); if (fields.startedAt) fields.startedAt.value = String(now()); transition("success", "Message sent. I’ll reply by email.");
      } else if (response.status === 422 && response.fieldErrors) {
        showErrors(response.fieldErrors); transition("validation-error", response.fieldErrors.form || "Check the highlighted fields.");
      } else if (response.status === 429 || response.code === "RATE_LIMITED") {
        transition("rate-limited", "Too many attempts just now. Please wait and try again, or email me directly.");
      } else if (response.status === 503 || response.code === "PROVIDER_UNAVAILABLE") {
        transition("unavailable", "The form is temporarily unavailable. Your message is still here; email me directly or try again.");
      } else transition("error", NETWORK_COPY);
    } catch { if (!destroyed) transition("error", NETWORK_COPY); }
    finally { clearTimeout(timer); activeController = null; }
  }
  function onInput(event) {
    const name = event?.target?.name;
    if (FIELD_NAMES.includes(name) && event.target.getAttribute("aria-invalid")) setFieldError(name);
  }
  form.addEventListener("submit", onSubmit); form.addEventListener("input", onInput); transition("idle");
  return { get state() { return state; }, destroy() { destroyed = true; activeController?.abort(); form.removeEventListener("submit", onSubmit); form.removeEventListener("input", onInput); } };
}

export function initForm() {
  const form = document.querySelector(".contact__form");
  return form ? createContactForm(form) : null;
}
