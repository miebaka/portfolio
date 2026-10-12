# Design contract alignment

## Acceptance criteria

- `design-thesis.md` v5.0 is normative; `DESIGN.md` is its concise implementation companion.
- Homepage discovery order is thesis, selected work, profile, services, client proof, working principles, contact, then signature and footer.
- The full-screen Index contains both Print/Screen and motion preferences.
- Selected-work cards begin with a deliberate asymmetric rhythm before interaction.
- Production navigation uses the thesis-approved 3% surface transparency and blur, with an opaque reduced-transparency fallback.
- Service swatches remain keyboard-operable because focus is an authored route into the fan interaction.
- The work archive exposes only work with a usable destination and never renders disabled-looking placeholders.
- All authored links pass through the shared URL guard.
- Contact limits and interest choices are validated on both client and server; over-limit input is rejected rather than truncated; upstream delivery has a bounded timeout.

## Frontend

Keep the Living Archive expressive through image crop, proportion and movement. Keep the Editorial Instrument exact through semantic controls, uppercase Josefin Sans labels, sharp surfaces and predictable focus behavior. Preserve no-JavaScript content and mobile navigation.

## Backend and security

The contact endpoint remains same-origin and JSON based. Normalize whitespace only after checking raw length, allowlist the visible interest choices, bound the Resend request with an abort timeout and never log submitted personal data. The honeypot stays as the low-friction first defense; infrastructure-backed rate limiting remains a deployment concern because per-instance memory is not a reliable serverless quota.

## Verification

Run the build and integrity suite, dependency audit, whitespace check, all-route 1440px and 390px browser geometry, Print/Screen checks, reduced-motion checks, keyboard Index checks, and representative contact-handler probes.
