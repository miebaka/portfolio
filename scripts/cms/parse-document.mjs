import { CASE_STORY_STRUCTURE as CHAPTERS } from "../../data/case-story-structure.js";

function fail(code){throw new Error(code)}

function paragraphText(paragraph,strict=false){
  if(!paragraph||!Array.isArray(paragraph.elements)||paragraph.bullet)fail("CMS_UNSUPPORTED_PARAGRAPH");
  let text="";
  for(const element of paragraph.elements){
    const run=element.textRun;
    if(!run||typeof run.content!=="string")fail("CMS_UNSUPPORTED_ELEMENT");
    const style=run.textStyle||{};
    if(strict&&(style.link||style.bold||style.italic||style.underline||style.strikethrough||style.smallCaps||["SUPERSCRIPT","SUBSCRIPT"].includes(style.baselineOffset)))fail("CMS_UNSUPPORTED_INLINE_FORMAT");
    text+=run.content;
  }
  if(!text.endsWith("\n"))fail("CMS_INVALID_PARAGRAPH_TERMINATOR");
  return text.slice(0,-1);
}

function readStatus(element){
  if(element?.paragraph){
    const s=paragraphText(element.paragraph);
    return s==="Publication status: Published"?"Published":s==="Publication status: Draft"?"Draft":null;
  }
  if(element?.table){
    const rows=element.table.tableRows;
    if(rows?.length!==1||rows[0].tableCells?.length!==2)return null;
    const [a,b]=rows[0].tableCells.map(cell=>{
      if(cell.content?.length!==1)return null;
      return paragraphText(cell.content[0].paragraph);
    });
    return a==="Publication status"&&["Draft","Published"].includes(b)?b:null;
  }
  return null;
}

export function parseCaseDocument(document,structure=CHAPTERS){
  if(document.suggestionsViewMode!=="PREVIEW_WITHOUT_SUGGESTIONS")fail("CMS_UNSAFE_SUGGESTION_MODE");
  if(document.tabs?.length!==1||document.tabs[0].childTabs?.length)fail("CMS_EXPECTED_ONE_TAB");
  const items=document.tabs[0].documentTab?.body?.content;
  if(!Array.isArray(items))fail("CMS_BODY_MISSING");
  let cursor=0;
  while(items[cursor]?.sectionBreak)cursor++;
  if(items[cursor]?.paragraph?.paragraphStyle?.namedStyleType==="TITLE")cursor++;
  const status=readStatus(items[cursor]);
  if(status!=="Published")return {status:"Draft",reason:status==="Draft"?"draft":"missing-or-invalid-status"};
  const chapters=[];
  let current=null, hasSubtitle=false;
  for(const item of items.slice(cursor+1)){
    if(!item.paragraph)fail("CMS_UNSUPPORTED_BLOCK");
    const p=item.paragraph;
    const kind=p.paragraphStyle?.namedStyleType||"NORMAL_TEXT";
    const value=paragraphText(p);
    if(kind==="HEADING_1"&&value==="Working Notes")break;
    if(kind==="HEADING_1"){
      const expected=structure[chapters.length];
      if(!expected||value!==expected.label)fail("CMS_CHAPTER_ORDER");
      current={id:expected.id,label:expected.label,title:expected.label,body:[]};
      chapters.push(current);hasSubtitle=false;
      continue;
    }
    if(!current){if(value==="")continue;fail("CMS_CONTENT_OUTSIDE_CHAPTER")}
    if(kind==="HEADING_2"&&current.body.length===0&&!hasSubtitle&&value.trim()){
      current.title=value;hasSubtitle=true;continue;
    }
    if(kind!=="NORMAL_TEXT")fail("CMS_UNSUPPORTED_HEADING");
    const exact=paragraphText(p,true);
    if(exact==="")continue;
    if(!exact.trim()||/[\u0000-\u0008\u000B-\u001F]/u.test(exact))fail("CMS_INVALID_TEXT");
    current.body.push(exact);
  }
  if(chapters.length!==structure.length||chapters.some(c=>!c.body.length))fail("CMS_INCOMPLETE_CASE");
  return {status:"Published",chapters};
}

export function projectChapters(chapters){return chapters.map(({id,label,title,body})=>({id,label,title:title||label,body}))}

export function planCaseUpdate(study,parsed){
  if(parsed.status!=="Published")return {kind:"draft"};
  if(study?.status!=="published")fail("CMS_EXISTING_CASE_REQUIRED");
  const current=projectChapters(study.chapters);
  if(current.length!==parsed.chapters.length||current.some((c,i)=>c.id!==parsed.chapters[i].id||c.label!==parsed.chapters[i].label))fail("CMS_EXISTING_CHAPTER_MISMATCH");
  if(JSON.stringify(current)===JSON.stringify(parsed.chapters))return {kind:"unchanged"};
  const next={...study,chapters:study.chapters.map((chapter,i)=>({...chapter,title:parsed.chapters[i].title,body:[...parsed.chapters[i].body]}))};
  return {kind:"changed",study:next};
}
