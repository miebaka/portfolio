export function assertMailService(mailer) {
  if (!mailer || typeof mailer.sendContact !== "function") {
    throw new TypeError("mailer.sendContact must be a function");
  }
  return mailer;
}
