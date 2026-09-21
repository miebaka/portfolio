# v1.1.1 UX Test Report

## Coverage

Fourteen public routes were loaded at mobile, tablet, and desktop viewport classes: Home, Work, About, Services, Playground, Contact, Privacy, 404, four case studies, and two writing articles.

Across 42 route/viewport checks:

- Console errors: 0
- Broken rendered images: 0
- Missing or duplicate H1: 0
- Horizontal overflow outside the intentionally clipped Home artwork: 0
- About crawl consumers remaining: 0

## Design-engineering review

| Before | After | Why |
| --- | --- | --- |
| 220–260vh perspective biography crawl | Responsive portrait-and-copy grid | Reading the biography is the task; the previous effect delayed and distorted it. |
| 930ms intercepted project navigation | 420ms pointer handoff; immediate keyboard/reduced-motion navigation | Spatial continuity remains without making navigation feel broken. |
| Multiple clicks could schedule multiple destinations | Single in-flight transition | A press produces one predictable result. |
| Contact button implied server submission | “Open email enquiry” plus explicit handoff note | The interface now describes what actually happens. |
| Stable assets cached immutable for one year | Seven-day cache with revalidation | Updated portfolio imagery will not remain stale for returning visitors. |

## Responsive result

The restored About page was visually inspected at desktop and mobile. Its portrait stacks above readable copy on mobile and returns to the intended two-column editorial composition at larger widths.

## Verdict

Approved. No blocking UX, console, image, heading, or route failures were observed.
