import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";

import { createContactForm, submitContact } from "../js/core/form.js";

class FakeNode {
  constructor({ name = "", value = "", type = "text", id = "" } = {}) {
    this.name = name;
    this.value = value;
    this.type = type;
    this.id = id || name;
    this.disabled = false;
    this.textContent = "";
    this.dataset = {};
    this.attributes = new Map();
    this.listeners = new Map();
    this.focused = false;
  }
  addEventListener(type, listener) { this.listeners.set(type, listener); }
  removeEventListener(type) { this.listeners.delete(type); }
  setAttribute(name, value) { this.attributes.set(name, String(value)); }
  getAttribute(name) { return this.attributes.get(name) ?? null; }
  removeAttribute(name) { this.attributes.delete(name); }
  focus() { this.focused = true; }
  closest() { return null; }
}

function fixture(overrides = {}) {
  const fields = Object.fromEntries([
    ["name", "Ada"], ["email", "ada@example.com"], ["interest", "brand-identity"],
    ["message", "A considered project enquiry."], ["website", ""], ["startedAt", "1000"]
  ].map(([name, value]) => [name, new FakeNode({ name, value, type: name === "email" ? "email" : "text" })]));
  Object.entries(overrides).forEach(([name, value]) => { fields[name].value = value; });
  const errors = Object.fromEntries(["name", "email", "interest", "message"].map((name) => [name, new FakeNode({ id: `${name}-error` })]));
  const helps = Object.fromEntries(["name", "email", "interest", "message"].map((name) => [name, new FakeNode({ id: `${name}-help` })]));
  const status = new FakeNode({ id: "form-status" });
  const button = new FakeNode({ type: "submit" });
  button.textContent = "Work with me";
  const listeners = new Map();
  const transitions = [];
  const dataset = new Proxy({}, { set(target, property, value) { target[property] = value; if (property === "state") transitions.push(value); return true; } });
  const form = {
    dataset, fields, errors, helps, status, button, transitions,
    addEventListener(type, listener) { listeners.set(type, listener); },
    removeEventListener(type) { listeners.delete(type); },
    querySelector(selector) {
      const match = selector.match(/^\[name="(.+)"\]$/);
      if (match) return fields[match[1]];
      if (selector === "#form-status") return status;
      if (selector === '[type="submit"]') return button;
      const error = selector.match(/^#(.+)-error$/);
      if (error) return errors[error[1]];
      return null;
    },
    reset() { Object.values(fields).forEach((field) => { field.value = ""; }); },
    async submit() { await listeners.get("submit")?.({ preventDefault() {} }); }
  };
  for (const name of ["name", "email", "interest", "message"]) {
    fields[name].setAttribute("aria-describedby", `${name}-help`);
  }
  return form;
}

test("submitContact posts JSON and returns the stable response envelope", async () => {
  let request;
  const result = await submitContact({ name: "Ada" }, {
    signal: new AbortController().signal,
    fetchImpl: async (url, options) => {
      request = { url, options };
      return { status: 202, json: async () => ({ ok: true, requestId: "req_1" }) };
    }
  });
  assert.equal(request.url, "/api/contact");
  assert.equal(request.options.method, "POST");
  assert.equal(request.options.headers["Content-Type"], "application/json");
  assert.deepEqual(JSON.parse(request.options.body), { name: "Ada" });
  assert.deepEqual(result, { status: 202, ok: true, requestId: "req_1" });
});

test("HTML keeps a complete native email fallback when JavaScript is disabled", async () => {
  const html = await readFile(new URL("../contact.html", import.meta.url), "utf8");
  assert.match(html, /<form[^>]+action="mailto:miebakakiki@gmail\.com"[^>]+method="post"[^>]+enctype="text\/plain"/u);
  assert.doesNotMatch(html.match(/<form[^>]+>/u)?.[0] || "", /novalidate/u);
  for (const field of ["name", "email", "interest", "message", "website", "startedAt"]) assert.match(html, new RegExp(`name="${field}"`, "u"));
  assert.match(html, /<textarea[^>]+name="message"[^>]+required/u);
  assert.match(html, /<noscript>[\s\S]+mailto:miebakakiki@gmail\.com/u);
});

test("required message, merged descriptions and first-invalid focus", async () => {
  const form = fixture({ name: "", email: "bad", message: "" });
  const controller = createContactForm(form, { submitContact: async () => { throw new Error("must not submit"); }, now: () => 5000 });
  await form.submit();
  assert.equal(controller.state, "validation-error");
  assert.deepEqual(form.transitions.slice(-2), ["validating", "validation-error"]);
  assert.equal(form.fields.name.focused, true);
  assert.equal(form.fields.name.getAttribute("aria-invalid"), "true");
  assert.equal(form.fields.name.getAttribute("aria-describedby"), "name-help name-error");
  assert.match(form.errors.message.textContent, /message/i);
});

test("prevents duplicate submits and clears only after a 202 success", async () => {
  const form = fixture();
  let resolve;
  let calls = 0;
  const pending = new Promise((done) => { resolve = done; });
  const controller = createContactForm(form, { submitContact: async () => { calls += 1; return pending; }, now: () => 5000 });
  const first = form.submit();
  const second = form.submit();
  assert.equal(controller.state, "submitting");
  assert.equal(form.button.disabled, true);
  assert.equal(form.button.getAttribute("aria-busy"), "true");
  assert.equal(form.button.textContent, "Sending…");
  assert.deepEqual(form.transitions.slice(-2), ["validating", "submitting"]);
  resolve({ status: 202, ok: true, requestId: "req_1" });
  await Promise.all([first, second]);
  assert.equal(calls, 1);
  assert.equal(controller.state, "success");
  assert.equal(form.button.getAttribute("aria-busy"), null);
  assert.equal(form.fields.name.value, "");
  assert.equal(form.status.textContent, "Message sent. I’ll reply by email.");
});

test("server field errors retain inputs and merge stable error descriptions", async () => {
  const form = fixture();
  const controller = createContactForm(form, { submitContact: async () => ({ status: 422, ok: false, code: "INVALID_REQUEST", fieldErrors: { email: "Enter a valid email address." } }), now: () => 5000 });
  await form.submit();
  assert.equal(controller.state, "validation-error");
  assert.equal(form.fields.name.value, "Ada");
  assert.equal(form.fields.email.value, "ada@example.com");
  assert.equal(form.fields.email.getAttribute("aria-describedby"), "email-help email-error");
  assert.equal(form.fields.email.focused, true);
});

test("maps rate limit, provider, server and network failures without clearing values", async (t) => {
  const cases = [
    [() => ({ status: 429, ok: false, code: "RATE_LIMITED" }), "rate-limited", "Too many attempts just now. Please wait and try again, or email me directly."],
    [() => ({ status: 503, ok: false, code: "PROVIDER_UNAVAILABLE" }), "unavailable", "The form is temporarily unavailable. Your message is still here; email me directly or try again."],
    [() => ({ status: 500, ok: false, code: "INTERNAL_ERROR" }), "error", "That didn’t send. Your message is still here; try again or email me directly."],
    [() => { throw new TypeError("offline"); }, "error", "That didn’t send. Your message is still here; try again or email me directly."],
    [() => { throw new DOMException("timed out", "AbortError"); }, "error", "That didn’t send. Your message is still here; try again or email me directly."]
  ];
  for (const [response, state, copy] of cases) await t.test(copy.slice(0, 18), async () => {
    const form = fixture();
    const controller = createContactForm(form, { submitContact: async () => response(), now: () => 5000, timeoutMs: 1 });
    await form.submit();
    assert.equal(controller.state, state);
    assert.equal(form.fields.message.value, "A considered project enquiry.");
    assert.equal(form.status.textContent, copy);
    assert.match(form.status.textContent, /email me directly/i);
  });
});

test("destroy removes handlers and aborts an in-flight request", async () => {
  const form = fixture();
  let aborted = false;
  const controller = createContactForm(form, { submitContact: (_payload, { signal }) => new Promise((_resolve, reject) => signal.addEventListener("abort", () => { aborted = true; reject(new DOMException("aborted", "AbortError")); })), now: () => 5000 });
  const pending = form.submit();
  controller.destroy();
  await pending;
  assert.equal(aborted, true);
});

test("the client timeout aborts the request and preserves the message", async () => {
  const form = fixture();
  const controller = createContactForm(form, {
    submitContact: (_payload, { signal }) => new Promise((_resolve, reject) => signal.addEventListener("abort", () => reject(new DOMException("timed out", "AbortError")))),
    now: () => 5000,
    timeoutMs: 1
  });
  await form.submit();
  assert.equal(controller.state, "error");
  assert.equal(form.fields.message.value, "A considered project enquiry.");
});
