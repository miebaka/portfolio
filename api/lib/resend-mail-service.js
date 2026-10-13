import { assertMailService } from "./mail-service.js";

const escapeHtml = (value) => String(value).replace(/[&<>"']/gu, (character) => ({
  "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;"
})[character]);

function providerClass(status) {
  if (status === 429) return "rate_limited";
  if (status >= 500) return "server_error";
  if (status >= 400) return "request_error";
  return "success";
}

export function createResendMailService({
  apiKey = process.env.RESEND_API_KEY,
  from = process.env.CONTACT_FROM_EMAIL,
  to = process.env.CONTACT_TO_EMAIL,
  fetchImpl = fetch,
  timeoutMs = 8_000
} = {}) {
  const service = {
    async sendContact(contact, { signal, requestId } = {}) {
      if (!apiKey || !from || !to) throw Object.assign(new Error("Mail service is not configured"), { providerClass: "configuration" });
      const timeoutSignal = AbortSignal.timeout(timeoutMs);
      const combinedSignal = signal ? AbortSignal.any([signal, timeoutSignal]) : timeoutSignal;
      const interest = contact.interest || "Not specified";
      const text = `Portfolio contact\n\nName: ${contact.name}\nEmail: ${contact.email}\nInterest: ${interest}\nRequest: ${requestId}\n\n${contact.message}`;
      const html = `<h1>Portfolio contact</h1><p><strong>Name:</strong> ${escapeHtml(contact.name)}</p><p><strong>Email:</strong> ${escapeHtml(contact.email)}</p><p><strong>Interest:</strong> ${escapeHtml(interest)}</p><p><strong>Request:</strong> ${escapeHtml(requestId || "")}</p><p>${escapeHtml(contact.message).replaceAll("\n", "<br>")}</p>`;
      const response = await fetchImpl("https://api.resend.com/emails", {
        method: "POST",
        headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
        body: JSON.stringify({ from, to: [to], reply_to: contact.email, subject: `Portfolio enquiry from ${contact.name}`, text, html }),
        signal: combinedSignal
      });
      if (!response.ok) throw Object.assign(new Error("Mail provider rejected request"), { providerClass: providerClass(response.status) });
      const result = await response.json();
      if (!result?.id) throw Object.assign(new Error("Mail provider returned an invalid response"), { providerClass: "invalid_response" });
      return { providerId: result.id };
    }
  };
  return assertMailService(service);
}

export { escapeHtml };
