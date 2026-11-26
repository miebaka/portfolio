# Security checklist — 26 November 2026

Scope: static public portfolio, contact endpoint, legacy listening-status endpoint, Vercel output and GitHub CI. This is a source review, not a completed penetration test.

| Control | Implementation / verification |
| --- | --- |
| API keys and environment | Server-only provider credentials; ignore local environment and key files. Verify actual Vercel production/preview variables and rotate any leaked keys. |
| Admin routes, authentication, record ownership, passwords | No admin route, account system or password store in the reviewed source tree. Do not add these to public pages. Any future CMS must enforce server-side authentication, authorization and private draft publication. |
| Forms and XSS | Existing field validation and escaped mail HTML; reject ambiguous URL schemes; keep script CSP restrictive. |
| Rate limiting | Contact endpoint uses atomic Upstash limit, keyed address hashes and fail-closed guard. Added HTTPS, redirect and timeout checks. Verify real production limiting and provider permissions. |
| CORS | No permissive CORS headers; contact requires an exact trusted HTTPS origin, with canonical-only fallback. Configure each intended preview origin explicitly. Origin is not authentication; bots can forge it. |
| Headers | Retain existing CSP and clickjacking protections; add HSTS, explicit inline event-handler denial and cross-domain policy. Verify live responses and browser behavior. |
| Debug and unnecessary files | Production build rejects more source/config/credential artifacts and no longer copies experiment README. Browser error diagnostics and unused listening endpoint require further review before deletion. |
| Dependencies | Existing npm audit retained; add scheduled high-severity audit and Dependabot for npm and Actions. Do not claim upgrades or a clean scan until checks run. |
| Database | No application user database; Upstash stores temporary rate-limit keys. Confirm token scope, TLS, rotation and data expiry in provider console. |
| Git secrets | Redacted Gitleaks history scan in CI; review GitHub secret scanning settings and results, revoke exposed credentials, and never publish them in reports. |
| Full audit | Run CI and production smoke tests; validate headers, sensitive-path 404s, contact behavior, provider scopes, source/history scans and dependency advisories. Record findings before declaring completion. |

The source repository is public. Build exclusions and noindex cannot protect secrets or genuinely confidential drafts committed to it. Keep those outside the public repository. Do not introduce tracking, public logins or a database merely to satisfy a generic checklist.
