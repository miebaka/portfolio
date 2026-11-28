const sectionIdForHeading = (heading) => {
  const section = heading?.closest?.("[id]");
  if (section?.id) return section.id;
  return String(heading?.id || "").replace(/-title$/u, "");
};

export function replaceSectionHash(id, { historyImpl = globalThis.history, locationImpl = globalThis.location } = {}) {
  if (!id || !historyImpl?.replaceState || !locationImpl?.href) return false;
  const next = new URL(locationImpl.href);
  if (next.hash === `#${id}`) return false;
  next.hash = id;
  historyImpl.replaceState(historyImpl.state, "", next);
  return true;
}

async function copyText(value, documentImpl = globalThis.document) {
  if (globalThis.navigator?.clipboard?.writeText) {
    await globalThis.navigator.clipboard.writeText(value);
    return;
  }
  const field = documentImpl.createElement("textarea");
  field.value = value;
  field.setAttribute("readonly", "");
  Object.assign(field.style, { position: "fixed", opacity: "0", pointerEvents: "none" });
  documentImpl.body.append(field);
  field.select();
  documentImpl.execCommand("copy");
  field.remove();
}

export function initSectionLinks({ root = globalThis.document, headingSelector = "h2[id]" } = {}) {
  if (!root?.querySelectorAll) return;
  for (const heading of root.querySelectorAll(headingSelector)) {
    const id = sectionIdForHeading(heading);
    if (!id || heading.parentElement?.querySelector?.(`.section-permalink[data-section="${CSS.escape(id)}"]`)) continue;
    const button = document.createElement("button");
    button.type = "button";
    button.className = "section-permalink";
    button.dataset.section = id;
    button.setAttribute("aria-label", `Copy link to ${heading.textContent.trim()}`);
    button.innerHTML = '<span aria-hidden="true">Copy link</span><span class="sr-only" aria-live="polite"></span>';
    button.addEventListener("click", async () => {
      const url = new URL(location.href);
      url.hash = id;
      try {
        await copyText(url.href);
        replaceSectionHash(id);
        const visible = button.querySelector('[aria-hidden="true"]');
        const status = button.querySelector("[aria-live]");
        if (visible) visible.textContent = "Copied";
        if (status) status.textContent = "Section link copied.";
        setTimeout(() => {
          if (visible) visible.textContent = "Copy link";
          if (status) status.textContent = "";
        }, 1600);
      } catch {
        const status = button.querySelector("[aria-live]");
        if (status) status.textContent = "Could not copy the section link.";
      }
    });
    heading.insertAdjacentElement("afterend", button);
  }
}
