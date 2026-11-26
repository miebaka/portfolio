# Security audit follow-up — 26 November 2026

Baseline: 40d061a9. Vercel deployment succeeded; Quality, Typography and Security workflows failed. Gitleaks scanned 860 commits and reported two findings; the previous job did not expose enough redacted metadata to classify them. The new workflow reports rule, path, line, commit and fingerprint only, never secret values. Do not suppress findings without verifying and revoking any live credential. No history rewrite was performed.

The npm audit reported 20 vulnerabilities (2 low, 5 moderate, 13 high), including LHCI and transitive development tools. The manifest has no runtime dependencies. A separate shipped-only audit and full high-severity audit remain required; no unverified lockfile changes were made.

Changes: retire unused Last.fm API and renderer; preserve no-widget navigation regression test; limit experiment asset copying to supported media and generated manifest; correct privacy and contact fallback; fix existing CSS lint failure; make scan findings actionable and run security tests before dependency audit.

Contact: only Last.fm credentials existed at initial Vercel check. Set production recipient and exact allowed origin. Resend API key, verified sender, Upstash URL/token and random HMAC key require provisioning through provider accounts. Until configured, Vercel builds explicitly open an email draft, retain form values and never claim delivery. Direct email is always available. No new account, tracking or database was added.

Residual risk: history findings require classification and rotation; dependencies require a tested lockfile update; live headers, deployment paths, real contact delivery and provider permissions need verification. Local runtime could not reach GitHub or the package registry; this is a source/CI audit, not an independently executed penetration test.
