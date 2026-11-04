const formatter = new Intl.DateTimeFormat("en-GB", {
  timeZone: "Africa/Lagos",
  hour: "2-digit",
  minute: "2-digit",
  hour12: false
});

export function initLagosTime(doc = document, win = window) {
  const clocks = [...doc.querySelectorAll("[data-lagos-time]")];
  if (!clocks.length) return { destroy() {} };

  const update = () => {
    const now = new Date();
    const value = formatter.format(now).replace(":", ".");
    clocks.forEach(clock => {
      clock.dateTime = now.toISOString();
      clock.textContent = value + " WAT";
    });
  };

  update();
  const timer = win.setInterval(update, 30_000);
  return { destroy() { win.clearInterval(timer); } };
}
