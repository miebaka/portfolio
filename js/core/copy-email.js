import { SITE } from "../../data/site.js";

async function copyText(value) {
  if (navigator.clipboard?.writeText) {
    try {
      await navigator.clipboard.writeText(value);
      return;
    } catch { /* An embedded or permission-limited page may still allow native copy. */ }
  }
  const active = document.activeElement;
  const field = document.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  field.style.position = "fixed";
  field.style.opacity = "0";
  document.body.append(field);
  try {
    field.select();
    if (!document.execCommand("copy")) throw new Error("Clipboard unavailable");
  } finally {
    field.remove();
    active?.focus({ preventScroll: true });
  }
}

export function initCopyEmail() {
  // Preserve mailto navigation while offering a clipboard alternative beside
  // the printed contact details and shared footer.
  const links = [...document.querySelectorAll('a[href^="mailto:"]')]
    .filter(link => link.textContent.includes("@") && !link.closest(".contact__handoff") &&
      !link.nextElementSibling?.matches(".copy-email"));
  const cleanups = links.map(link => {
    const button = document.createElement("button");
    button.type = "button";
    button.className = "copy-email";
    button.setAttribute("aria-label", "Copy address to clipboard");
    button.innerHTML = '<span data-copy-label>Copy</span><svg viewBox="0 0 16 16" aria-hidden="true"><path class="copy-email__copy" d="M5.5 5.5h6v7h-6zM4 10.5H2.5v-7h6V5"/><path class="copy-email__check" d="m3.5 8.5 2.6 2.6 6.2-6.2"/></svg><span class="sr-only" data-copy-status aria-live="polite"></span>';
    link.insertAdjacentElement("afterend", button);
    let timer = 0;
    const reset = () => {
      button.dataset.state = "idle";
      button.querySelector("[data-copy-label]").textContent = "Copy";
      button.querySelector("[data-copy-status]").textContent = "";
    };
    const onClick = async () => {
      clearTimeout(timer);
      try {
        await copyText(SITE.email);
        button.dataset.state = "copied";
        button.querySelector("[data-copy-label]").textContent = "Copied";
        button.querySelector("[data-copy-status]").textContent = "Email address copied.";
      } catch {
        button.dataset.state = "error";
        button.querySelector("[data-copy-label]").textContent = "Use link";
        button.querySelector("[data-copy-status]").textContent = "Copy unavailable. Use the email link.";
      }
      timer = window.setTimeout(reset, 1800);
    };
    button.addEventListener("click", onClick);
    return () => { clearTimeout(timer); button.removeEventListener("click", onClick); button.remove(); };
  });
  return { destroy() { cleanups.forEach(cleanup => cleanup()); } };
}
