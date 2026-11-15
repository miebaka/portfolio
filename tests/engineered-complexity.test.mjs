import test from "node:test";
import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import { dirname, join, resolve } from "node:path";
import { fileURLToPath } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const read = path => readFile(join(root, path), "utf8");

test("engineered complexity palette is exact and centrally owned", async () => {
  const foundations = (await read("styles/foundations.css")).replace(/\s+/g, "").toLowerCase();
  const expected = {
    "--ec-burgundy-900": "#3a0d1c",
    "--ec-burgundy-800": "#561226",
    "--ec-burgundy-700": "#6e1932",
    "--ec-burgundy-100": "#f2dde3",
    "--ec-sandalwood-700": "#765642",
    "--ec-sandalwood-300": "#c6a98f",
    "--ec-paper": "#f4f0e8",
    "--ec-paper-deep": "#e7ded1",
    "--ec-ink": "#171311",
    "--ec-charcoal": "#292320",
    "--ec-mist": "#d8d5ce",
    "--ec-forest": "#28382d",
    "--ec-storm": "#111827",
    "--ec-electric": "#e06046"
  };

  for (const [token, value] of Object.entries(expected)) {
    assert.ok(foundations.includes(`${token}:${value}`), `missing exact token ${token}: ${value}`);
  }
});

test("engineered complexity stylesheet is the final authored layer", async () => {
  const main = await read("styles/main.css");
  assert.match(main, /@layer[^;]*engineered;/);
  assert.match(
    main,
    /@import url\("engineered-complexity\.css"\) layer\(engineered\);\s*$/,
    "the personality layer must load last and remain isolated"
  );
});

test("route motion has explicit reduced-motion fallbacks", async () => {
  const css = await read("styles/engineered-complexity.css");
  assert.match(css, /\.ec-route-line/);
  assert.match(css, /\.ec-route-node/);
  assert.match(css, /@media\s*\(prefers-reduced-motion:\s*reduce\)/);
  assert.match(css, /html\[data-motion="reduced"\]/);
  assert.doesNotMatch(css, /transition\s*:\s*all/i);
});

test("engineered complexity source contains no raw colours outside foundations", async () => {
  const css = await read("styles/engineered-complexity.css");
  assert.doesNotMatch(css, /#[0-9a-f]{3,8}\b|rgba?\(|hsla?\(|oklch\(|lab\(/i);
});

test("homepage states the engineered complexity proposition", async () => {
  const home = await read("index.html");
  assert.match(home, /I turn complicated problems into clear creative systems\./);
  assert.match(home, /There is a system behind the complexity\./);
  assert.match(home, /Bring me the complicated part\./);
});

test("homepage thesis introduces the work without becoming the theme", async () => {
  const home = await read("index.html");
  const thesis = home.indexOf('class="ec-thesis');
  const selectedWork = home.indexOf('id="selected-work"');
  assert.ok(thesis > -1, "homepage thesis is missing");
  assert.ok(selectedWork > thesis, "the thesis must lead into selected work");
  assert.match(home, /<svg[^>]*aria-hidden="true"/);
  assert.doesNotMatch(home, /Takaosan[^<]*<img/i, "do not ship an unlicensed interchange image");
});

test("homepage practice route is a complete ordered-list fallback", async () => {
  const home = await read("index.html");
  const stages = ["Question", "Decide", "Design", "Test", "Equip"];
  assert.match(home, /<ol class="ec-practice-route"/);
  for (const stage of stages) assert.match(home, new RegExp(`<h3>${stage}<\\/h3>`));
  assert.doesNotMatch(home, /hidden[^>]*ec-practice-route|ec-practice-route[^>]*hidden/);
});

test("homepage includes the interdisciplinary practice thread", async () => {
  const home = await read("index.html");
  assert.match(home, /environmental systems/i);
  assert.match(home, /faith/i);
  assert.match(home, /storytelling/i);
  assert.match(home, /one useful whole/i);
});


test("about page leads with the approved personal proposition", async () => {
  const about = await read("about.html");
  assert.match(about, /My mind takes the long route\. My work should not make you do the same\./);
});

test("about page presents a shaped-practice timeline", async () => {
  const about = await read("about.html");
  assert.match(about, /<ol class="ec-practice-timeline"/);
  for (const milestone of ["Environmental systems", "Design practice", "Marketing systems", "Creative leadership"]) {
    assert.match(about, new RegExp(milestone, "i"));
  }
});

test("about page states four working principles", async () => {
  const about = await read("about.html");
  const section = about.match(/<ol class="about-principles">([\s\S]*?)<\/ol>/);
  assert.ok(section, "working principles list is missing");
  assert.equal((section[1].match(/<li>/g) || []).length, 4);
  assert.match(section[1], /Let the system handle repetition/i);
});

test("about page shows the person away from the file", async () => {
  const about = await read("about.html");
  assert.match(about, /Away from the file/i);
  for (const interest of ["comics", "movies", "Warhammer 40K", "photography", "faith"]) {
    assert.match(about, new RegExp(interest, "i"));
  }
  assert.doesNotMatch(about, /Cynthia|Nwanyi Oma|Ikorodu/i, "keep private personal details off the public portfolio");
});


test("notes page offers four thematic routes without inventing articles", async () => {
  const notes = await read("notes.html");
  for (const path of ["Design decisions", "Creative leadership", "Systems and tools", "Looking closely"]) {
    assert.match(notes, new RegExp(path, "i"));
  }
  assert.equal((notes.match(/writing\/[a-z0-9-]+\.html/g) || []).length, 2);
});

test("experiments page explains the role of unfinished work and keeps fallbacks", async () => {
  const experiments = await read("explorations.html");
  assert.match(experiments, /follow a question before I know whether it belongs in a case study/i);
  assert.match(experiments, /rough edges intact/i);
  assert.match(experiments, /class="nav-fallback"/);
  assert.match(experiments, /Take another route/i);
});

test("contact page makes fit, thought and follow-through explicit", async () => {
  const contact = await read("contact.html");
  for (const signal of ["Good fit", "Useful context", "Follow-through"]) assert.match(contact, new RegExp(signal, "i"));
  const submit = contact.indexOf(">Work with me</button>");
  const directEmail = contact.indexOf("Email me directly");
  assert.ok(submit > -1 && directEmail > submit, "primary project action must precede the direct-email alternative");
});
