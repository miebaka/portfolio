# Portfolio PRD release evidence

## Release candidate and release gate

- Candidate source commit: `c9c01e635690ac2f11e9c8e1df60b407bd755f09` (`chore: harden portfolio deployment boundary`).
- Branch: `codex/portfolio-prd-implementation`.
- Visual source baseline: `54dcc41`.
- Evidence date: 2026-10-14 (Africa/Lagos).
- Preview URL: **pending**. No preview or production deployment was made during this local pass.
- Approval state: **pending owner review**.
- Release rule: **STOP before preview deployment, push, pull request, merge or production publication.** A green local candidate is evidence, not approval.

## Clean candidate verification

The candidate began clean at `c9c01e6`. `npm ci` installed the exact lockfile state. `git diff --check` passed before and after verification.

`npm run quality` was run first as authored. All unit, content, build, CSS and integrity checks passed, but the parallel Playwright stage ended 135/144 because concurrent workers lost retained trace files under `test-results/.playwright-artifacts-*` during browser-context cleanup (`ENOENT`). The failures were runner-artifact errors, not assertion failures. The complete browser suite was then rerun serially with `npx playwright test tests/e2e --workers=1` and passed **144/144**.

The remaining quality stages were rerun individually after the serial browser pass:

| Command | Result |
| --- | --- |
| `npm test` (inside the initial quality run) | Pass: 38 content, 5 navigation, 12 case, 6 professional, 25 contact API, 13 contact form, 8 motion, 31 integrity and 1 visual-contract tests; 16 pages built |
| `npx playwright test tests/e2e --workers=1` | Pass: 144/144 across desktop, mobile and reduced-motion projects |
| `npm run test:visual -- --workers=1` | Pass: 28 intended screenshots; 14 reduced-motion duplicates skipped by suite design |
| `npm run test:budgets` | Pass |
| `npm run test:lighthouse` | Pass: 9/9 Lighthouse runs and all configured assertions |
| `npm run audit:shipped` | Pass: 0 shipped dependency vulnerabilities |
| `npm run audit:dev-tools` | Non-blocking report: 17 development-tool advisories (2 low, 4 moderate, 11 high), all in the Lighthouse/tooling tree; the suggested forced downgrade is breaking and was not applied |
| `git diff --check` | Pass |

The authored `npm run quality` command therefore has a local parallel trace-retention instability on this host. Its product assertions pass when the browser stage is serialized. CI uses two workers and retries; this local evidence does not conceal the initial failure.

## Measured budgets and local vitals

Build budget measurements:

| Asset group | Measured | Limit | Headroom |
| --- | ---: | ---: | ---: |
| Initial CSS | 16.6 KiB gzip | 45.0 KiB | 28.4 KiB |
| Initial JavaScript | 1.0 KiB | 75.0 KiB | 74.0 KiB |
| Homepage media | 52.7 KiB | 1,536.0 KiB | 1,483.3 KiB |

Lighthouse ran three times each against the locally built Home, Work and TEDx pages. All nine current reports scored **100 performance** and **100 accessibility**.

| Route | LCP range | CLS range | Total blocking time |
| --- | ---: | ---: | ---: |
| Home | 471–515 ms | 0.001646 | 0 ms |
| Work | 502–511 ms | 0.000344–0.000348 | 0 ms |
| TEDx | 577–607 ms | 0.000940 | 0 ms |

These are controlled local lab results, not field Web Vitals. Preview and production measurements remain required after an approved deployment.

## Browser, viewport and input evidence

The repository Playwright suite covers 1440×1000 desktop, 390×844 touch-sized mobile and a 1440×1000 reduced-motion project. It verifies all 16 built routes for HTTP/document health, one `h1`, console and resource failures, horizontal overflow and serious Axe findings in both themes. It also exercises keyboard focus trapping/restoration, theme persistence, pause control, contact states, forced colours, 200% zoom, WCAG text spacing and navigation without JavaScript.

An additional local route-state smoke matrix used `Save-Data: on`, both light and dark themes, 390 and 1440 widths, touch emulation at 390, and all 16 routes:

| Engine | Result | Notes |
| --- | --- | --- |
| Installed Google Chrome | 64/64 route/theme/viewport states passed | HTTP 200, one `h1`, no console/page errors, no horizontal overflow, requested theme applied |
| Bundled Chromium | 64/64 passed | Same checks |
| Playwright WebKit 27.2 | 64/64 passed | Same checks; useful Safari-engine proxy, not a real iOS device or installed Safari release |
| Playwright Firefox 157 | Unavailable | Runtime downloaded, but headless launch failed before navigation with `Could not find profile folder`; no Firefox product result is claimed |
| Edge | Not installed/tested | Pending a suitable local or preview device matrix |
| Native Safari, iOS Safari, Android Chrome | Not automated in this pass | Physical/current-device review remains pending |

Pointer hover behavior is constrained to fine-pointer media by the CSS contract. Keyboard behavior and focus restoration passed. Touch-sized layout and tap journeys passed in Chromium and the cross-engine 390px smoke checks. The automated forced-colour, zoom, text-spacing, reduced-motion, Save-Data and no-JavaScript results are local emulations; native assistive-technology and physical-device inspection remain pending.

## Motion and visual review

Normal-motion behavior passed the interaction suite: the Index opens without trapping errors, service swatches support pointer and roving-keyboard selection, buttons retain explicit feedback, case content does not depend on delayed reveals, and the client marquee exposes a persistent pause/play control. Reduced motion computes the marquee to `animation-name: none`, `animation-duration: 0s` and `transform: none`; the footer enhancement and explicit motion preferences also passed their lifecycle tests.

The current 28 visual baselines were inspected and rerun for Home, Work, TEDx, About, Services, Contact and Index at 390/1440 in both themes. They retain the editorial type hierarchy, ultramarine/paper identity, square geometry, image-led case composition and restrained control styling. No proof-sheet skin, generic card system or competing visual language was found. A true slow-motion human review at 25% playback and a next-day fresh-eye repeat were not completed in this local pass; they remain preview-review items.

## Visual preservation against `54dcc41`

The governing design contract passes and is explicitly anchored to `54dcc41`: the three approved typefaces, ultramarine `#002080`, paper `#f8f9fc`, protected homepage language, signature asset, bundled stylesheet and prohibited effects are all enforced against the built output.

The implementation deliberately changes hierarchy and content rather than restyling the portfolio:

- Published work now precedes biography and project availability is truthful.
- TEDx RSU is a full image-led, eight-chapter case study with authored plates and captions.
- About uses a chronological experience ledger; capabilities and CV states are data-driven.
- Explorations, Community and the global Index are complete routes/navigation structures.
- Contact now has accessible server-backed states and a direct-email fallback.
- Shared content, case, navigation, service and footer behavior is rendered from validated sources and works without JavaScript for essential copy.

Exact baseline-to-candidate pixel parity is **not claimed**. The existing Task 11 parity manifest proves 12/12 pixel-identical route/width pairs only across the later CSS-consolidation boundary beginning at `8100a58`, with 360 computed-style checkpoints. Its recorded CSS hash predates a one-line navigation minimum-height stability rule added later, so it is supporting evidence rather than authentication of current HEAD. The clearest potential drift from `54dcc41` is a roughly 16% tighter global spacing scale; this reads as deliberate structural tightening but should receive explicit owner review. About and TEDx are intentionally recomposed, and the stable parity capture masks imagery/canvas/marquee, so artwork crops and footer canvas still require preview inspection.

## Security headers and contact paths

Local configuration and integrity tests confirm:

- enforced CSP plus a staged report-only CSP;
- `nosniff`, strict-origin referrer policy, restrictive permissions policy, same-origin opener policy and frame denial;
- HTML/CSS/JS revalidation, bounded asset caching and `no-store` for `/api/*`;
- the inline theme bootstrap hash is present and checked against the executable inline-script inventory;
- static build output excludes source/review directories.

Preview response verification is **pending**. After an explicitly approved preview deployment, run `curl -I` against HTML, CSS, representative assets and `/api/contact` and confirm the platform serves these values rather than merely accepting the configuration.

The contact boundary passed local unit and mocked browser coverage for 202, 422, 429 and 503 states, including origin/content-type/body-size checks, honeypot and minimum-fill-time abuse guards, shared rate limiting, provider timeout mapping, value retention, safe logs and the no-JavaScript email fallback. Live preview paths are **pending** because preview-only provider/rate-limit credentials were intentionally not used. No submitted content was logged.

## Supplied and withheld content

Supplied and shipped from the validated repository sources: portfolio identity/contact metadata, approved homepage and service language, six client identities, public project states, two public writing routes, the TEDx proposition/facts/chapter sequence and owner media with intrinsic dimensions and alternatives.

Truthfully withheld or omitted:

- CV metadata/file (`siteConfig.cv` is `null`), so no CV control is rendered.
- Working-principles copy, testimonials, invented community/exploration entries and unverified numerical outcome claims.
- Unverified case credits/outcomes; unfinished cases remain forthcoming or draft and non-interactive where required.
- Dynamic Last.fm fetching; the listening link is static and privacy copy matches that behavior. The report-only CSP stages removal of the old connection allowance before enforcement is changed.

## Known omissions and release decision

- No preview URL, deployment headers, live contact-provider path, platform logs or production Web Vitals exist yet.
- Firefox could not launch locally; Edge and physical Safari/iOS/Android coverage remain outstanding.
- The full quality command encountered a host-specific parallel trace-artifact race, although its complete browser assertions passed serially.
- Exact whole-site pixel identity with `54dcc41` is neither expected for intentionally rebuilt routes nor proven; owner review should focus especially on spacing density, artwork crops and the recomposed TEDx/About pages.
- A 25% slow-motion and next-day fresh-eye review remain pending.

**Local release-candidate verdict:** technically ready for an owner-approved preview, with the limitations above. **Do not deploy, push, open a pull request, merge or publish until the owner explicitly authorizes the next step.**
