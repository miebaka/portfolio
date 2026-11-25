import { readFile, writeFile } from "node:fs/promises";
import { createHash } from "node:crypto";
import { fileURLToPath } from "node:url";
import { join } from "node:path";
import { CONTENT, SITE } from "../../data/site.js";
import { assertValidContent } from "../validate-content.mjs";
import { renderCaseMarkup } from "../../js/render/case-markup.js";
import { googleClient, stableDocument } from "./fetch-document.mjs";
import { parseCaseDocument, planCaseUpdate, projectChapters } from "./parse-document.mjs";

const root = fileURLToPath(new URL("../../", import.meta.url));
const slug = "kiki-joshua-notepad"; // Pilot only. Never derive a file path from a document.
const dataPath = join(root, "data/case-studies.js");
const pagePath = join(root, "work", slug + ".html");
const fingerprint = value => createHash("sha256").update(JSON.stringify(value)).digest("hex");
const esc = value => String(value).replace(/[&<>"]/g, c => ({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"})[c]);

async function main() {
  const mode = process.argv[2] || "--check";
  if (!["--check","--apply","--verify"].includes(mode) || process.argv.length > 3) throw new Error("CMS_MODE_INVALID");
  if (process.env.CMS_SYNC_ENABLED !== "true") {
    if (mode !== "--check") throw new Error("CMS_DISABLED");
    console.log("CMS disabled; existing publication retained.");
    return;
  }
  if (mode === "--apply" && process.env.CMS_PUBLISH_ENABLED !== "true") throw new Error("CMS_PUBLISH_DISABLED");
  const documentId = process.env.CMS_KIKI_DOCUMENT_ID;
  const client = googleClient({token:process.env.CMS_GOOGLE_ACCESS_TOKEN});
  const {document,version} = await stableDocument(client,documentId);
  const parsed = parseCaseDocument(document);
  const study = CONTENT.caseStudies[slug];
  const plan = planCaseUpdate(study,parsed);
  if (mode === "--verify" && plan.kind !== "unchanged") throw new Error("CMS_DOCUMENT_NO_LONGER_MATCHES");
  if (plan.kind !== "changed") {
    console.log(plan.kind === "draft" ? "Draft or missing status; existing publication retained." : "Published narrative unchanged.");
    return;
  }
  const candidate = {...CONTENT.caseStudies,[slug]:plan.study};
  assertValidContent({...CONTENT,caseStudies:candidate});
  if (fingerprint(projectChapters(plan.study.chapters)) !== fingerprint(parsed.chapters)) throw new Error("CMS_FIDELITY_MISMATCH");
  const markup = renderCaseMarkup({...SITE,caseStudies:candidate},slug,"../");
  for (const chapter of parsed.chapters) {
    const paragraphs = chapter.body.map(p=>"<p>"+esc(p)+"</p>").join("");
    if (!markup.includes(paragraphs)) throw new Error("CMS_RENDER_FIDELITY_MISMATCH");
  }
  const originalData = await readFile(dataPath,"utf8");
  const prefix = "/* Public case studies content. */\nexport const caseStudies = ";
  if (!originalData.startsWith(prefix) || !originalData.trimEnd().endsWith(";")) throw new Error("CMS_DATA_FORMAT_CHANGED");
  const originalObject = JSON.parse(originalData.slice(prefix.length).trimEnd().slice(0,-1));
  if (JSON.stringify(originalObject) !== JSON.stringify(CONTENT.caseStudies)) throw new Error("CMS_DATA_MISMATCH");
  const data = prefix + JSON.stringify(candidate,null,2) + ";\n";
  const originalPage = await readFile(pagePath,"utf8");
  const articlePattern = /<article class="case" data-mount="case"(?: data-prerendered="true")?>[\s\S]*?<\/article>/g;
  if ([...originalPage.matchAll(articlePattern)].length !== 1) throw new Error("CMS_CASE_SHELL_MISMATCH");
  const page = originalPage.replace(articlePattern,()=>'<article class="case" data-mount="case">'+markup+"</article>");
  if (mode === "--check") {
    console.log("Published narrative differs and passed candidate validation; no files written.");
    return;
  }
  if (await client.version(documentId) !== version) throw new Error("CMS_DOCUMENT_CHANGED_BEFORE_WRITE");
  // Both writes stay in the disposable workflow checkout until all tests pass.
  await writeFile(dataPath,data);
  await writeFile(pagePath,page);
  console.log("Candidate prepared; publication still requires workflow validation and push.");
}

try { await main(); }
catch (error) {
  // Do not print raw API responses or private document text, even on failure.
  const code = /^CMS_[A-Z0-9_]+$/.test(error.message) ? error.message : "CMS_VALIDATION_OR_IO_FAILED";
  console.error(code);
  process.exitCode=1;
}
