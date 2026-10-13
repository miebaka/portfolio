import { pathToFileURL } from "node:url";
import { realpathSync } from "node:fs";
import { CONTENT } from "../data/site.js";
import { validateContent } from "./content-schema.mjs";

export function assertValidContent(content = CONTENT) {
  const result = validateContent(content);
  if (!result.ok) {
    throw new Error(`Content validation failed:\n${result.errors.map(error => `${error.path} [${error.code}]: ${error.message}`).join("\n")}`);
  }
  return result.value;
}

if (process.argv[1] && import.meta.url === pathToFileURL(realpathSync(process.argv[1])).href) {
  try {
    assertValidContent();
    console.log("Public content validated.");
  } catch (error) {
    console.error(error.message);
    process.exitCode = 1;
  }
}
