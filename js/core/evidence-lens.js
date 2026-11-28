export function initEvidenceLens() {
  const lens = document.querySelector("[data-evidence-lens]");
  if (!lens) return;
  const controls = [...lens.querySelectorAll("[data-evidence-choice]")];
  const records = [...lens.querySelectorAll("[data-evidence-state]")];
  const select = (value) => {
    lens.dataset.evidenceFilter = value;
    controls.forEach((control) =>
      control.setAttribute("aria-pressed", String(control.dataset.evidenceChoice === value)),
    );
    records.forEach((record) =>
      record.toggleAttribute("data-evidence-muted", value !== "all" && record.dataset.evidenceState !== value),
    );
  };
  controls.forEach((control) => control.addEventListener("click", () => select(control.dataset.evidenceChoice)));
  select("all");
}
