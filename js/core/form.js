/* Contact form — progressive mailto: handoff, no backend required.
   Swap in a real endpoint (Formspree, Netlify Forms, etc.) when ready. */
import { SITE } from "../../data/site.js";

export function initForm() {
  const form = document.querySelector(".contact__form");
  if (!form) return;
  const status = form.querySelector(".form-status");

  function setStatus(text) {
    if (!status) return;
    status.textContent = text;
    status.classList.remove("is-visible");
    void status.offsetWidth; /* force reflow so animation restarts on repeat submits */
    status.classList.add("is-visible");
  }

  form.addEventListener("submit", (e) => {
    e.preventDefault();
    const data = new FormData(form);
    const name = (data.get("name") || "").toString().trim();
    const email = (data.get("email") || "").toString().trim();
    const message = (data.get("message") || "").toString().trim();
    if (!name || !email) {
      setStatus("Add your name and email so I can reply.");
      return;
    }
    const to = SITE.email || "hello@miebaka.design";
    const subject = encodeURIComponent("Project enquiry from " + name);
    const body = encodeURIComponent(message + "\n\n— " + name + " (" + email + ")");
    window.location.href = "mailto:" + to + "?subject=" + subject + "&body=" + body;
    setStatus("Opening your email app…");
  });
}
