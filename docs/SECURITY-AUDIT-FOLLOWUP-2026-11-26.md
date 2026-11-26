# Security audit follow-up — 26 November 2026

Baseline: 40d061a9. Vercel deployment succeeded; Quality, Typography and Security workflows failed. Gitleaks scanned 860 commits and reported two findings; the previous job did not expose enough redacted metadata to classify them. The new workflow reports rule, path, line, commit and fingerprint only, never secret values. Do not suppress findings without verifying and revoking any live credential. No history rewrite was performed.

The npm audit reported 20 vulnerabilities (2 low, 5 moderate, 13 high), including LHCI and transitive development tools. The manifest has no runtime dependencies. A separate shipped-only audit and full high-severity audit remain required; no unverified lockfile changes were made.

Changes: retire unused Last.fm API and renderer; preserve no-widget navigation regression test; limit experiment asset copying to supported media and generated manifest; correct privacy and contact fallback; fix existing CSS lint failure; make scan findings actionable and run security tests before dependency audit.

Contact: only Last.fm credentials existed at initial Vercel check. Set production recipient and exact allowed origin. Resend API key, verified sender, Upstash URL/token and random HMAC key require provisioning through provider accounts. Until configured, Vercel builds explicitly open an email draft, retain form values and never claim delivery. Direct email is always available. No new account, tracking or database was added.

Residual risk: history findings require classification and rotation; dependencies require a tested lockfile update; live headers, deployment paths, real contact delivery and provider permissions need verification. Local runtime could not reach GitHub or the package registry; this is a source/CI audit, not an independently executed penetration test.

## Verified subsequent results

At deployment 5873436747c63d416a2b8cb6c5a158da58f28d60, Vercel reported success and the production contact HTML explicitly displayed "Open email draft" with the email-mode attribute. Live GET checks: /contact.html 200; /api/contact 405 (no-store); /api/now-playing 404; /.env 404; /.git/config 404; /assets/experiments/metadata.json 404. Responses included CSP, HSTS, DENY framing and nosniff. This is not a live POST delivery or browser test.

Security/contact unit tests passed; shipped-only npm audit returned zero vulnerabilities. Full tooling audit still returned 20 vulnerabilities (13 high, 5 moderate, 2 low). Typography passed. Quality failed because legacy case markup expectations and incomplete content-validation fixture copies were out of sync with the current renderer; fixture setup and metadata assertion have been corrected to preserve validation coverage. Their rerun is not yet verified.

Gitleaks subsequently scanned 870 commits. Both findings are the same 32-character Last.fm API key, historically hardcoded as lastfmKey:
- data/site-config.js:5 at 3263e12a53f56aec1978edb24ff44697f0968033
- data/site.js:10 at 096d7d61d881c5f098ec51e5e65a8b862b724ab6

Treat the key as compromised, regardless of whether it still works. Revoke at Last.fm, remove all three remaining LASTFM_API_KEY environment entries from Vercel, and review native GitHub secret scanning. No credential value is included here. Do not rewrite shared Git history without an explicit decision and coordination; revocation is the immediate containment action. The scanner remains failing until historical findings are properly resolved.
