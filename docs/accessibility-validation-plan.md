# Accessibility validation plan — Miebaka portfolio

**Status:** Implementation in progress; manual WCAG 2.2 AA review and compensated participation have **not** been completed. This plan is a recruitment and release checklist, not a certificate.

## Outcome to validate

A disabled visitor can independently: (1) understand who Miebaka is and follow the work CTA; (2) locate and open TEDx, Rivo and ChopBox without hovering, dragging or aiming at a small hotspot; (3) understand the central decision and evidence in each case without seeing its images; (4) browse and open an Experiment without a gesture; (5) send an inquiry or use email, and recover from validation or network errors.

## Pay disabled people to shape the work

Invite participants with diverse access needs and devices: people who use screen readers (including on phones), keyboard-only or switch input, magnification and large text, voice control, reduced-motion settings, and people with cognitive or attention-related access needs. Ask participants about their preferred session format, communications, breaks and access accommodations; do not require disclosure of diagnosis. Include Deaf or hard-of-hearing testers if video with meaningful audio is published.

Agree compensation before recruitment, let participants advise on fair rates and expenses (data, transport, interpreting, access support), and pay for preparation, sessions and follow-up. Offer remote or in-person participation and a choice of payment method. Consent and privacy come before recording; unrecorded sessions are valid.

Participants must be able to identify barriers rather than be asked to endorse a nearly finished design. Conduct at least one formative review **before** committing the final interaction design and one confirmatory review after fixes. Use genuine tasks without leading prompts; record independently completed tasks, obstacles, workarounds, participant quotes with permission, and fixes.

## Manual acceptance journeys

| Journey | Requirement | What to observe |
| --- | --- | --- |
| First impression | Role, proposition, selected-work CTA reachable at 320–430 CSS pixels | Reading order, moving-water contrast, pause target and visible focus |
| Work index | TEDx, Rivo and ChopBox independently selectable on first attempt | Touch, mouse, keyboard, voice, switch; no overlap or second tap |
| Case studies | Project, role, constraint, decision and meaning of evidence all available as text | Alt text, embedded-poster copy, caption accuracy, heading sequence |
| Experiments | Previous/Next, Study index and full list operate without drag | Keyboard, touch, screen reader announcements and focus return |
| Global navigation | All paths available with meaningful control names | Dialog focus trap, Escape, theme/motion controls, reduced motion |
| Contact | Valid, invalid, failed and accepted inquiries | Labels, descriptions, error location, live announcements, input retention and email route |

## Browser, zoom and input coverage

Verify at 320, 375, 390, 430, 640, 896, 1152 and 1440 CSS pixels and at 200% text resize. For 400% browser zoom, use a desktop 1280 CSS-pixel layout with an effective 320 CSS-pixel viewport as a starting reflow test; then manually test **actual** 400% browser zoom because automated viewport resizing is not identical. Check both themes, forced-colors mode, and reduced motion.

Use NVDA + Firefox/Chrome on Windows; VoiceOver + Safari on macOS and iOS; TalkBack + Chrome on Android; keyboard-only, switch and voice input where available. Automated axe and Playwright checks are useful, but do not substitute for these journeys.

Map findings to **WCAG 2.2 AA**, especially 1.1.1 (Non-text Content), 1.3.1 (Info and Relationships), 1.4.3 (Contrast), 1.4.10 (Reflow), 1.4.11 (Non-text Contrast), 2.1.1 (Keyboard), 2.2.2 (Pause, Stop, Hide), 2.4.3 (Focus Order), 2.4.7 (Focus Visible), 2.4.11 (Focus Not Obscured), 2.5.7 (Dragging Movements), 2.5.8 (Target Size), 3.3.1–3.3.3 (Form Errors) and 4.1.3 (Status Messages).

## Production email delivery

Use a designated sender and a recipient inbox controlled by the portfolio owner. Submit one clearly marked test inquiry, check that the server returns acceptance and that the message actually arrives in the intended inbox, and verify the reply address. Then repeat with malformed data and a simulated network failure to confirm that the form preserves content. **A HTTP 202 alone is not proof of inbox delivery.** Do not send unrequested production test messages.

## Release gate

No Level A/AA failures in a manual criterion-by-criterion audit. No critical blocker on any end-to-end journey. Participant-reported blockers resolved and retested, with consent-aware findings documented. Record exceptions and remaining limitations publicly on the accessibility page. Only make a formal conformance claim after the scoped manual audit and independent review support it.
