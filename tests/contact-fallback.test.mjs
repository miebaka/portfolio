import assert from "node:assert/strict";
import test from "node:test";
import { contactServiceConfigured, REQUIRED_CONTACT_ENV } from "../scripts/contact-config.mjs";
import { emailDraft } from "../js/core/form.js";

test("unconfigured deployments use draft mode; every provider variable is required", () => {
  const env = Object.fromEntries(REQUIRED_CONTACT_ENV.map(key => [key, "test"]));
  assert.equal(contactServiceConfigured(env), true);
  for (const key of REQUIRED_CONTACT_ENV) assert.equal(contactServiceConfigured({...env, [key]: ""}), false, key);
});

test("email draft has a fixed recipient, encoded fields and no injected headers", () => {
  const uri = emailDraft({name:"A & B",email:"ada@example.com",interest:"design-role",message:"Hello\r\n&bcc=attacker@example.com"});
  const parsed = new URL(uri);
  assert.equal(parsed.pathname, "miebakakiki@gmail.com");
  assert.equal(parsed.searchParams.has("bcc"), false);
  assert.match(parsed.searchParams.get("body"), /&bcc=attacker@example.com/);
});
