/* Contact form — progressive mailto: handoff, no backend required.
   Swap in a real endpoint (Formspree, Netlify Forms, etc.) when ready.

   Validation is per-field: the message appears under the input that caused it
   and the input is marked aria-invalid, so screen-reader users hear which
   field is wrong rather than a summary line detached from the control. */
import { SITE } from "../../data/site.js";

/* Deliberately permissive. The only thing worth rejecting here is an address
   that clearly cannot be delivered to; anything stricter starts refusing
   valid addresses, and the real check is whether the reply bounces. */
const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;

export function initForm() {
  const form = document.querySelector(".contact__form");
  if (!form) return;
  const status = form.querySelector(".form-status");

  /* Each field gets an error node once, reused on every submit. */
  function errorNodeFor(input) {
    const field = input.closest(".field");
    if (!field) return null;
    let node = field.querySelector(".field__error");
    if (!node) {
      node = document.createElement("p");
      node.className = "field__error";
      node.id = input.id + "-error";
      field.appendChild(node);
    }
    return node;
  }

  function setFieldError(input, message) {
    const field = input.closest(".field");
    const node = errorNodeFor(input);
    if (!node || !field) return;
    node.textContent = message || "";
    field.classList.toggle("field--invalid", Boolean(message));
    if (message) {
      input.setAttribute("aria-invalid", "true");
      input.setAttribute("aria-describedby", node.id);
    } else {
      input.removeAttribute("aria-invalid");
      input.setAttribute("aria-describedby", "form-status");
    }
  }

  function setStatus(text, state) {
    if (!status) return;
    status.textContent = text;
    status.dataset.state = state;
    status.classList.remove("is-visible");
    void status.offsetWidth; /* force reflow so the animation restarts */
    status.classList.add("is-visible");
  }

  const nameInput = form.querySelector("#name");
  const emailInput = form.querySelector("#email");
  const messageInput = form.querySelector("#message");

  /* Clear a field's error as soon as the user starts correcting it. Waiting
     for the next submit to clear it makes the form feel like it is arguing. */
  [nameInput, emailInput, messageInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid")) setFieldError(input, "");
    });
  });

  form.addEventListener("submit", (e) => {
    e.preventDefault();

    const name = (nameInput?.value || "").trim();
    const email = (emailInput?.value || "").trim();
    const message = (messageInput?.value || "").trim();

    let firstInvalid = null;
    const fail = (input, msg) => {
      setFieldError(input, msg);
      if (!firstInvalid) firstInvalid = input;
    };

    if (!name) fail(nameInput, "Add your name so I can reply.");
    else setFieldError(nameInput, "");

    if (!email) fail(emailInput, "Add your email so I can reply.");
    else if (!EMAIL_RE.test(email)) fail(emailInput, "That email address looks incomplete.");
    else setFieldError(emailInput, "");

    if (firstInvalid) {
      setStatus("Check the highlighted fields.", "error");
      firstInvalid.focus();
      return;
    }

    const to = SITE.email || "hello@miebaka.design";
    const subject = encodeURIComponent("Project enquiry from " + name);
    const body = encodeURIComponent(message + "\n\n" + name + " (" + email + ")");
    window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
    setStatus("Opening your email app...", "success");
  });
}
