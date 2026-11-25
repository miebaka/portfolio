import test from "node:test";
import assert from "node:assert/strict";
import { CASE_STORY_STRUCTURE as CHAPTERS } from "../data/case-story-structure.js";
import { parseCaseDocument, planCaseUpdate } from "../scripts/cms/parse-document.mjs";

function fixture(status="Published"){
  const p=(content,kind="NORMAL_TEXT",style={})=>({paragraph:{paragraphStyle:{namedStyleType:kind},elements:[{textRun:{content:content+"\n",textStyle:style}}]}});
  return {suggestionsViewMode:"PREVIEW_WITHOUT_SUGGESTIONS",tabs:[{documentTab:{body:{content:[{sectionBreak:{}},p("Publication status: "+status),...CHAPTERS.flatMap(({label},i)=>[p(label,"HEADING_1"),p("Original  text "+i+" — it's exact. "),p("Repeated."),p("Repeated.")]),p("Working Notes","HEADING_1"),p("PRIVATE NEVER PUBLISH")]}}}]};
}

function contract(assert){
  const published=parseCaseDocument(fixture());
  assert(published.status==="Published","publish");
  assert(published.chapters.length===6,"six chapters");
  assert(published.chapters[0].body[0]==="Original  text 0 — it's exact. ","verbatim");
  assert(published.chapters[0].body[1]===published.chapters[0].body[2],"duplicates retained");
  assert(!JSON.stringify(published).includes("PRIVATE"),"notes excluded");
  assert(parseCaseDocument(fixture("Draft")).status==="Draft","draft frozen");
  assert(parseCaseDocument(fixture("Unknown")).status==="Draft","invalid status");
  const bad=fixture();bad.tabs[0].documentTab.body.content.splice(2,1);let rejected=false;try{parseCaseDocument(bad)}catch(e){rejected=true}assert(rejected,"missing heading rejects");
  const rich=fixture();rich.tabs[0].documentTab.body.content[3].paragraph.elements[0].textRun.textStyle.bold=true;rejected=false;try{parseCaseDocument(rich)}catch(e){rejected=true}assert(rejected,"rich text rejects");
  const wrong=fixture();wrong.suggestionsViewMode="SUGGESTIONS_INLINE";rejected=false;try{parseCaseDocument(wrong)}catch(e){rejected=true}assert(rejected,"suggestions reject");
  const study={status:"published",hero:"asset",chapters:published.chapters.map(c=>({...c,media:["asset"]}))};
  assert(planCaseUpdate(study,published).kind==="unchanged","no-op");
  const changed=JSON.parse(JSON.stringify(published));changed.chapters[0].body[0]="New exact text";
  const next=planCaseUpdate(study,changed);
  assert(next.kind==="changed"&&next.study.hero==="asset"&&next.study.chapters[0].media[0]==="asset"&&next.study.chapters[0].body[0]==="New exact text","preserve assets");
  assert(planCaseUpdate(study,{status:"Draft"}).kind==="draft","keep snapshot");
}

test("CMS pilot publication contract", () => contract((ok,label)=>assert.ok(ok,label)));
