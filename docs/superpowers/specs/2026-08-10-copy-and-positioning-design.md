# Copy & Positioning — Design Spec

**Phase 1 of 3** (copy → design → code). This document locks the positioning,
information flow, and final copy for every page. The visual re-direction (phase 2)
and code hardening (phase 3) build on top of what is settled here.

> Governs, and where they disagree, supersedes the voice/positioning sections of
> `engineering-specification.md`. Deviations from that document are marked **Changed**.

---

## 0. Decisions locked with the owner

- **Ambition:** bold re-direction. Existing copy is a starting point, not a constraint.
- **Protagonist:** hiring-led, project door open. The primary story converts a design
  lead / hiring manager at a remote-first team; a quiet secondary path invites project work.
- **Position:** craft and thinking lead. Lagos / African-brands is present and strong,
  but it is not the headline. It lives loudest on About and inside the work.
- **The one ask:** **"Work with me."** **Changed** — this replaces the spec's locked
  "Start a project" as the single canonical CTA everywhere.
- **Testimonial:** the block stays, wired and waiting for one real, attributed quote the
  owner will supply before launch. No quote is invented.
- **Claim latitude:** elevate freely; any claim the owner has not already made is flagged
  `[confirm]` and must be verified before it ships.

---

## 1. The guide — three lenses, distilled to rules

**Don Draper — sell the feeling, own one idea.** Advertising manufactures a feeling, not
a fact; the greatest asset is the imagination of the audience (the Heinz "Pass the Heinz"
pitch never showed the product). → *Lead with emotion and identity, commit to one big idea
per page, trust the reader to finish the thought.*

**Rory Sutherland — psycho-logic beats logic; reframe, don't out-spec.** People buy meaning,
not objects; perceived value is manufacturable. Don't make the train faster, make the
journey better. "The opposite of a good idea can be another good idea." → *Do not compete
on "prettier work." Reframe the axis. Make Lagos a proof of range, not a caveat. Signal
taste through restraint.*

**Seth Godin — be remarkable, market to the smallest viable audience.** A Purple Cow is
worth talking about; aim at the few who will love you and carry your story; the audience is
the hero and your work is the resolution. → *One worldview, one tribe, one story in which the
visitor is the protagonist. Stop hedging to please everyone.*

Sources: Sutherland — *Alchemy* / behavioural-economics summaries; Godin — *Purple Cow*,
*This Is Marketing* (smallest viable audience); Draper — Mad Men advertising philosophy
(feeling over fact, the consumer's imagination, "Pass the Heinz").

---

## 2. Positioning

- **Spine (internal, not shipped):** *World-class brand thinking, made in Lagos, for teams
  who want work that looks decided, not decorated.*
- **The one idea (shipped everywhere):** **Decided, not designed.** Craft is the visible
  residue of thinking.
- **The reframe:** the product is not logos. It is *decisions a brand can't unsee.*
- **The tribe:** teams building something real who are tired of design that drifts.

## 3. Voice & mechanics

Retained from `engineering-specification.md §13`:

- Sentence case everywhere except small uppercase interface labels.
- **No em-dashes or en-dashes** in any user-visible string. Use a comma, colon, period, or
  plain hyphen.
- One label per intent across the whole site.
- No scroll cues, no section-number eyebrows, no decorative status dots.
- At most one small-caps eyebrow per three sections.

**Changed:** the canonical contact CTA is **"Work with me"**, not "Start a project."
Every occurrence of the old label is replaced.

Register: inquisitive, warm, unhedged. Personality (comic books, dinosaurs, snakes, tasting
the difference in water) concentrated on About and in the writing; client-facing pages lead
with the work and the thinking.

---

## 4. Information architecture

**Home (AIDA, one idea per view):**
1. Hero — attention. The big idea + who you are + one soft entry (See the work).
2. Selected work — interest. Reframed as decisions, not a gallery.
3. Proof strip — the logo wall, relabelled as trust.
4. Testimonial — desire. One real, attributed quote. (Was empty; now required.)
5. What I do — the five capabilities, reframed as ways to help a brand decide.
6. About preview — the mission, made felt.
7. Contact — action. One ask: Work with me.

**Fix:** the testimonial currently renders empty and kills the desire beat. It is now a
required, populated block (see §6).

Per-page ask: every page ends on exactly one CTA, **Work with me**, except the hero (whose
job is attention, so it uses "See the work").

---

## 5. Full copy — Home

**Hero**
- Meta (two labels): `Brand & visual designer` · `Lagos, open worldwide`
- H1: **The best brands don't look designed. They look decided.**
- Lede *(new)*: I'm Miebaka Joshua. For seven years I've turned fuzzy briefs into identities
  that hold their shape, most recently in-house at Rise, shipping to more than 800,000 users.
  I'm looking for the right team to do that for next.
- CTA: **See the work →**

**Selected work**
- Label: `Selected work`
- Framing line *(new)*: Six brands, and the decision at the centre of each.

**Proof strip**
- Label: `Trusted with the work` **Changed** (was "Experience")

**Testimonial** `[confirm — needs one real attributed quote]`
- One quote, one name, one role. Structure ready; copy supplied by owner before launch.

**What I do**
- Label: `What I do`
- Framing line *(new)*: Five ways I help a brand decide what it is.
- Capabilities (retained, unchanged):
  - Brand identity — A system your team can grow into.
  - Brand strategy — The thinking that makes the design inevitable.
  - Visual & graphic design — Creative that earns attention before it asks for anything.
  - Art direction — Standards that survive the brief.
  - Editorial design — Print that earns its weight.

**About preview**
- Statement *(revised, mission made felt)*: Some of the most exciting brands in the world are
  being built in Africa right now. Most of them still don't look the part. I'm building the
  standard that closes that gap, from Lagos.
- Note (retained, lightly edited): My earliest memory of design is a games console: the moment
  I understood that form and function could conspire to make something irresistible. Seven
  years later I'm building creative for more than 800,000 users at Rise, and building an AI
  tool that scores where eyes actually land in an ad. If one word describes how I work:
  inquisitive. I question every brief until the idea underneath is inevitable.
- Link: More about me →

**Contact**
- Heading *(revised)*: Building something that needs to decide what it is?
- CTA: **Work with me**

---

## 6. Full copy — About

- Eyebrow: `About`
- H1 (retained): Brand strategist. Craft obsessive. Snake enthusiast, admittedly.
- Bio para 1 *(edited to add the hiring hook)*: My earliest memory of design is a games
  console: the moment I first understood that form and function could conspire to make
  something irresistible. That question hasn't left me. Seven years later I'm in-house at Rise,
  shipping creative for more than 800,000 users across six sub-teams, and I'm ready to bring
  that to a team full-time. `[confirm — "ready to bring that to a team full-time"]`
- Bio para 2 (retained): the "inquisitive" paragraph, unchanged.
- Bio para 3 (retained): the snakes / tasting water paragraph, unchanged.
- Mission block (retained, this is where the Africa position lives loudest): Africa has some of
  the most compelling brands in the world. Most of them don't look like it yet. I'm building a
  standard, not by borrowing from what works in New York or London, but by proving what's
  possible from Lagos.
- Experience list (retained, unchanged).
- Close *(revised to single ask)*: If that's the kind of thinking your team is missing,
  **Work with me** or see the work.

---

## 7. Full copy — Services

- Eyebrow: `Services`
- H1 (retained): Strategy, then craft.
- Lede *(revised, sell the outcome not the menu)*: Most brands don't need more design. They
  need to decide what they are, so everything after gets easier. That's where I start. The
  system that comes out gives your team something to grow into, not just a logo they paid for.
- Capabilities: the five from §5, rendered from data.
- Close *(revised)*: Have a brand that needs to know what it is? **Work with me**.

---

## 8. Full copy — Work index

- Intro line *(new)*: Every project here started as a question, not a logo.
- Case tiles render from data (titles, taglines retained).

---

## 9. Full copy — Contact

- Heading: Building something that needs to decide what it is?
- Supporting line *(new, permission/trust)*: Tell me what you're building. I read everything
  myself, and I reply.
- Message placeholder *(revised)*: What are you trying to decide?
- Submit button: **Work with me →** **Changed** (was "Send message")

---

## 10. Case-study micro-copy (light tightening, not rewrites)

Taglines and overviews are already strong and stay. Only two consistency edits:

- Every case study's next-project link and metrics keep their current voice.
- The single canonical CTA anywhere a case study invites contact is **Work with me**.

Full per-project copy is unchanged in this phase; any deeper case-study rewriting is deferred
to phase 2 once the visual template is settled.

---

## 11. What this changes in the build (pointers for implementation)

Not implemented in this phase. Listed so phase 2/3 can execute precisely.

- `data/site.js`
  - `testimonials`: populate one real entry (blocked on owner's quote).
  - No structural change to `projects`, `capabilities`, `clients`.
- Home `index.html`: hero lede added; work framing line; proof-strip label; capabilities
  framing line; about statement revised; contact heading revised; CTA label.
- `about.html`: bio para 1 hook; close CTA.
- `services.html`: lede revised; close CTA.
- `work.html`: intro line added.
- `contact.html`: supporting line; placeholder; submit label.
- Global: replace every "Start a project" / "Send message" with **Work with me**.

---

## 12. Open items (must resolve before launch)

- `[confirm]` One real, attributed testimonial quote (name + role).
- `[confirm]` About: "ready to bring that to a team full-time" — keep, soften, or cut.
- `[confirm]` Any metric stated as "more than 800,000 users" is accurate and current.
