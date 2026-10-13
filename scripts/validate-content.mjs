import { pathToFileURL } from "node:url";
import { existsSync, realpathSync, statSync } from "node:fs";
import { resolve } from "node:path";
import { CONTENT } from "../data/site.js";
import { validateContent } from "./content-schema.mjs";

export function assertValidContent(content = CONTENT) {
  const result = validateContent(content);
  if (!result.ok) {
    throw new Error(`Content validation failed:\n${result.errors.map(error => `${error.path} [${error.code}]: ${error.message}`).join("\n")}`);
  }
  const cv = result.value.siteConfig.cv;
  if (cv) {
    const root = new URL("../", import.meta.url);
    const file = resolve(root.pathname, cv.href);
    if (!existsSync(file) || !statSync(file).isFile()) throw new Error(`Content validation failed:\nsiteConfig.cv.href [CV_FILE_MISSING]: ${cv.href} does not exist.`);
    const sizeLabel = `${Math.ceil(statSync(file).size / 1024)} KB`;
    if (cv.sizeLabel !== sizeLabel) throw new Error(`Content validation failed:\nsiteConfig.cv.sizeLabel [CV_SIZE_MISMATCH]: Expected ${sizeLabel}.`);
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
