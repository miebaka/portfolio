# LLM Council — Earning Readiness Review
**Site:** Miebaka Joshua Portfolio · miebaka.design
**Version:** v1.0.0 | **Date:** 2026-06-29
**Question:** Is this website good enough for a designer looking to start earning globally?

---

## Council Composition

Five independent evaluator lenses. Each examines the site from their professional frame. Final verdict is synthesized from all five.

| Evaluator | Frame | Weight |
|-----------|-------|--------|
| 🧑‍💼 The Hiring Manager | Would I shortlist this person? | Critical |
| 💼 The Potential Client | Would I reach out for a project? | Critical |
| 🌍 The Global Remote Recruiter | Would I forward this to a team? | High |
| ♿ The Accessibility Auditor | Does this site meet professional standards? | Medium |
| 🎨 The Creative Director | Does this portfolio show range and taste? | Critical |

---

## Evaluator 1 — The Hiring Manager

*"I have 40 portfolios to review this week. I'll spend 90 seconds on yours before deciding whether you make the second pass."*

**What I see in 90 seconds:**
The URL resolves instantly. No loader, no splash, no gimmick — the portfolio opens directly onto the hero, which says THE BEST BRANDS DON'T LOOK DESIGNED. THEY LOOK DECIDED. A strong, ownable thesis. The navigation is clean: Work, About, Services, Playground, Contact. The name "Miebaka Joshua" and "Brand & visual designer / Lagos, Nigeria" are visible. The availability status says "Open to remote roles worldwide." Good.

**What stops me:**
I click "Work." I see four project tiles — Rivo, Poster A Week, TEDx RSU, ChopBox. Good names. Good categories. Then I click Rivo. I read the case study — the strategy narrative is genuinely compelling. Then I scroll to where I expect to see the work itself, and I hit three grey placeholder bands with text labels. No images. No logos. No mockups. No colour system. Nothing visual at all.

At this point I close the tab.

**Verdict:**
> A designer's portfolio without design work visible is not a portfolio. It is a CV with better typography.

**Score: 4 / 10** — Strong positioning, fatal content gap. Would not shortlist. Would shortlist immediately if visuals were present.

---

## Evaluator 2 — The Potential Client

*"A startup founder looking for a brand designer for a Series A rebrand. Budget: $4,000–$8,000. I found this site via LinkedIn."*

**What I'm evaluating:**
- Do they understand brand strategy, not just aesthetics? ✅ Yes — the copy, the case study framing, the articles all demonstrate strategic thinking.
- Do they have experience in my category (tech/fintech)? ✅ Yes — Rivo is a fintech brand; the case narrative shows they understand the category.
- Can I see what the final work actually looks like? ❌ No — I can read about it. I cannot see it.
- Would I trust them with $5,000? Undecided — the case study narrative says "Founder sign-off, first round" in the metrics. That's a good signal. But I need to see what they actually built.
- Do I feel they're credible? The writing is unusually good. The site is unusually well-made. I have a positive prior — but I cannot close.

**What I would do:**
Message on LinkedIn asking for portfolio samples. Whether they come back determines the outcome. The site itself does not close me.

**Verdict:**
> Creates genuine interest but cannot convert without imagery. The site opens a conversation; it cannot complete it.

**Score: 6 / 10** — Better than most designers I've reviewed. Loses the close because of missing visuals.

---

## Evaluator 3 — The Global Remote Recruiter

*"I source design talent for distributed-first teams in the US, EU, and APAC. I see 200 portfolios a month."*

**What I'm looking for:**
- Professionalism of presentation: ✅ Excellent. The typography, the layout, the dark mode, the scroll behavior — this site presents at the level of a mid-level designer at a top agency. Better than 90% of what I see.
- Clarity of positioning: ✅ Brand & visual designer. Brand strategy. Visual & graphic design. Art direction. Clear.
- Proof of output: ❌ The work is described but not shown. I have four case study titles and no finished work to validate against.
- Remote-readiness signals: ✅ "Open to remote roles worldwide." Lagos, Nigeria — timezone noted. English is fluent (the copy quality proves it).
- Years of experience stated: ✅ 7+ years.
- Client names visible: ✅ Anakle, Grey Finance, Rise, WellaHealth Technologies, Celebration Church — real names with logo marks. This is a credibility signal.

**The gap I'm trying to close:**
Teams hiring globally at competitive rates ($2,000–$4,000+/month USD) will ask: "Show me something you made." The answer has to be visible, not described. The case study system exists; the content has not arrived.

**Verdict:**
> The recruiter profile is strong. Would be immediately shortlistable once even one case study has actual imagery. As-is, I can't forward to a client team and tell them I vetted the work.

**Score: 5 / 10** — Strong candidate with an unverifiable portfolio. Fixable. Not blocking on skill — blocking on evidence.

---

## Evaluator 4 — The Accessibility Auditor

*"I run WCAG 2.1 AA checks before any site goes to a wider audience."*

**What I found (from the @architect + @tester reports):**

✅ **Passes:**
- Skip link on every page, functionally correct
- `<main id="main">` present — skip link target confirmed
- Focus trap on fullscreen menu, Escape closes it, focus returns correctly
- `aria-expanded` + `aria-haspopup` + `aria-modal` on menu button
- `aria-pressed` on theme toggle, updates correctly
- `prefers-reduced-motion` honoured for reveals, marquee, scroll behavior
- All client logo images have alt text
- Form inputs have associated `<label>` elements
- Landmark regions present: `<header>`, `<main>`, `<footer>`
- Heading hierarchy correct on all pages (now including `work.html` after fix)
- Dark mode contrast: `--stone` (#857e74 on #1c1a16) = 4.88:1 ✅ WCAG AA

⚠️ **Fixed in this session:**
- `scroll-cue` animation now has `prefers-reduced-motion` kill switch
- Case study `<section>` elements now have `aria-label` attributes
- Textarea fields now have `autocomplete` attribute
- `work.html` heading hierarchy corrected

🔴 **Remaining (non-blocking for global earning, worth noting):**
- Testimonial placeholder is not an accessibility issue but is content-unprofessional
- Console logs × 8 (dev artifact, no user impact)

**Verdict:**
> This site is in the top 5% of designer portfolios for accessibility compliance. A professional engineer built this. The spec violations that existed were caught and fixed. This site would pass an automated WCAG AA audit.

**Score: 9 / 10** — Minor content gaps, no technical accessibility blockers.

---

## Evaluator 5 — The Creative Director

*"I'm a CD at a design consultancy. I care about craft, taste, and whether someone has a genuine point of view."*

**What I'm assessing:**
1. **Typography:** The three-role type system (TeX Gyre Heros + Libre Baskerville + Josefin Sans) is a strong, considered choice. The fluid type scale is properly implemented. No faux-bolding, no font substitution. This shows a designer who knows their typographic theory. ✅

2. **Colour:** The warm off-white / near-black palette with a single clay accent is restrained and confident. It signals taste. ✅

3. **Layout:** The golden-ratio grid applied to the hero is sophisticated — 61.8% / 38.2% is not accidental. The case study layout (left rail, offset prose) is editorial quality. ✅

4. **Copy:** The writing on this site is unusually good. "THE BEST BRANDS DON'T LOOK DESIGNED. THEY LOOK DECIDED." is a proper positioning statement — it says something specific that could not be said by everyone. The case study narratives are strategically framed, not feature-listed. The articles show systems thinking and critical analysis. ✅

5. **What I cannot assess:**
   - Can they execute? The case studies describe outcomes without showing the work.
   - Do they have range? Four projects described, zero visible. I have no idea if the Rivo logotype is good.
   - Do they have craft at the production level? Unknown.

**What this site tells me about the designer:**
This person has a design philosophy. They understand brand strategy at a conceptual level. They can write — which means they can think. The site itself is a design artifact that demonstrates taste and restraint.

**What would close me as a CD:**
One finished case study with actual imagery — the identity system, the type hierarchy, the colour applications, a few key deliverables. That's all I need to start a conversation.

**Verdict:**
> I'd reach out based on the copy and the site quality alone. That's rare. Most portfolio sites fail the CD test before the work. This one passes the site test and fails the work test — which is the better failure mode.

**Score: 7 / 10** — A designer with a genuine POV and demonstrated taste. Would want to see one finished piece before extending an offer.

---

## Synthesis — Council Verdict

### Score Summary
| Evaluator | Score | Bottleneck |
|-----------|-------|-----------|
| Hiring Manager | 4/10 | No visible work |
| Potential Client | 6/10 | Cannot close without imagery |
| Global Recruiter | 5/10 | Cannot validate the work |
| Accessibility Auditor | 9/10 | Site is technically strong |
| Creative Director | 7/10 | POV present, execution unproven |
| **Overall** | **6.2/10** | **One shared blocker: no imagery** |

---

### The Honest Verdict

**No — not yet. But closer than almost anyone else at this stage.**

The site is exceptional infrastructure for a designer's portfolio. The engineering quality, the accessibility baseline, the copy, the positioning, and the design taste shown in the site itself place this in the top 5–10% of designer portfolios globally — purely on site quality.

The single, non-negotiable blocker is: **no design work is visible anywhere on the site.** Every case study is a grey placeholder. Every project tile shows only a colour tone, not a cover image. The "DESIGN EXPLORATIONS" section on the Playground page has no content.

A portfolio's job is to show what someone made. This one shows, compellingly, who someone is. Both are necessary. One is missing.

---

### What Needs to Happen Before Global Earning

**Priority 1 — Must have (week 1):**
- [ ] Rivo case study: add at least 3 finished images — the logotype, the colour system, one in-use mockup. This alone unlocks the portfolio.
- [ ] Replace testimonial placeholder with a real attribution from a past client or collaborator.

**Priority 2 — Should have (week 2–3):**
- [ ] Poster A Week: Add a grid of 6–8 posters. This is the easiest quick win — the work exists, it's digital, it just needs to be staged.
- [ ] Fix Instagram / Twitter social links to real profile URLs or remove them.
- [ ] Add one real cover image per project tile on the Work grid.

**Priority 3 — Can wait (month 2+):**
- [ ] TEDx RSU and ChopBox case studies with imagery
- [ ] Design Explorations section on the Playground page
- [ ] Kiki-Joshua and Kigoma Hotels (currently hidden from the featured grid)

---

### The Counter-argument (The Fool's chair)

*What if the answer is: launch now?*

A near-empty portfolio that demonstrates this level of strategic clarity and technical craft may land more responses than a full portfolio with weaker thinking. Some hiring managers and clients are pattern-matching on "does this person have a point of view?" more than "does this person have a library?"

The risk of waiting until the portfolio is full: the site sits unpublished while time passes. The risk of launching now: some visitors will click through and find nothing visual, and not return.

The middle path: populate one complete case study (Rivo), fix the testimonial, and launch. That is a functional portfolio. The rest follows.

---

### Final Recommendation

**Launch when Rivo has imagery. Not a day before.**

Three images from Rivo — a logotype, a colour system swatch, one lifestyle mockup — transform this site from "impressive shell" to "credible portfolio." That is a one-day task, not a one-week task. Do it first.

After that: this site is ready to compete globally.

---

*Report compiled from: @architect v1.0.0 audit, @tester v1.0.0 UX gate, direct code review, and the LLM Council framework. Miebaka Joshua Portfolio — v1.0.0.*
