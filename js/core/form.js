/* Contact form — enhanced submission to the same-origin Vercel endpoint.
   The HTML action and method remain usable without JavaScript. */
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
  const interestInput = form.querySelector("#interest");
  const messageInput = form.querySelector("#message");
  const submit = form.querySelector('button[type="submit"]');

  /* Clear a field's error as soon as the user starts correcting it. Waiting
     for the next submit to clear it makes the form feel like it is arguing. */
  [nameInput, emailInput, interestInput, messageInput].forEach((input) => {
    if (!input) return;
    input.addEventListener("input", () => {
      if (input.getAttribute("aria-invalid")) setFieldError(input, "");
    });
  });

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    const name = (nameInput?.value || "").trim();
    const email = (emailInput?.value || "").trim();
    const interest = (interestInput?.value || "").trim();
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

    if (!interest) fail(interestInput, "Choose what you are getting in touch about.");
    else setFieldError(interestInput, "");

    if (!message) fail(messageInput, "Add a short message so I know how to help.");
    else setFieldError(messageInput, "");

    if (firstInvalid) {
      setStatus("Check the highlighted fields.", "error");
      firstInvalid.focus();
      return;
    }

    submit?.setAttribute("aria-busy", "true");
    if (submit) { submit.disabled = true; submit.textContent = "SENDING…"; }
    setStatus("Sending your enquiry…", "loading");

    try {
      const response = await fetch(form.action, {
        method: "POST",
        headers: { "Content-Type": "application/json", "Accept": "application/json" },
        body: JSON.stringify({ name, email, interest, message, companySite: form.elements.companySite?.value || "" }),
      });
      const result = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(result.error || "The message could not be sent.");
      form.reset();
      setStatus("Your enquiry has been sent. I’ll reply by email.", "success");
    } catch {
      const to = SITE.email || "miebakakiki@gmail.com";
      setStatus("I couldn’t send that just now. Your message is still here; email " + to + " instead.", "error");
    } finally {
      submit?.removeAttribute("aria-busy");
      if (submit) { submit.disabled = false; submit.textContent = "SEND ENQUIRY"; }
    }
  });
}
