# Build and contact hardening

## Acceptance criteria

- A production build must stop when a case-study shell cannot be prerendered or a referenced production image is absent.
- The contact endpoint accepts the portfolio form's JSON and browser form submissions, while rejecting unsupported media types and cross-site browser posts.
- User-controlled mail fields cannot introduce control characters into provider metadata.
- Contact responses are never cached and carry basic hardening headers.
- Automated tests cover the failure boundaries without making a live email request.

## Design

### Frontend contract

The existing form contract remains unchanged: same-origin `POST /api/contact`, with JSON used by the enhanced form and URL-encoded form data available when JavaScript is absent. Error response bodies keep the existing `{ error }` shape.

### Backend

The serverless handler validates the request method, browser fetch provenance, media type, body shape, field sizes, enumerated interest, and email shape before calling Resend. Subject metadata is normalized to printable single-line text. Provider failures expose no provider response body or credentials.

### Build

Prerendering is treated as a required transform, not a best-effort replacement. Referenced image variants are required build inputs. Missing inputs throw with the exact source path so an incomplete release cannot be produced unnoticed.

### Security checkpoint

- Authentication/authorization: not applicable to this public enquiry endpoint.
- CSRF/abuse boundary: reject browser requests explicitly marked `cross-site`; retain the honeypot and provider throttling response.
- Input validation: enforced server-side for type, size, enumeration, and control characters; client validation remains convenience only.
- Output encoding: responses are JSON-serialized; user input is sent as plain text, not HTML.
- Secrets: `RESEND_API_KEY` remains environment-only and is never logged.
- Errors/logging: provider rejection logs correlation metadata only; client messages remain generic.

