# Portfolio CMS — phase 1 pilot

**Status: inactive until configured and reviewed.** No document IDs or credentials are committed. Google Docs is never accessed by visitors. The only registered project is the existing Kiki-Joshua case; only its chapter titles and plain-text paragraphs can change. Other fields, media and the existing URL remain Git-owned in this phase.

## Source document contract

Use a private, single-tab Google Doc. Keep the original source intact until the author has approved its chapter arrangement. The first paragraph (after an optional Title) must be exactly `Publication status: Draft` or `Publication status: Published`. A one-row two-cell table with the label Publication status and the value is also supported. Use Heading 1 for these six headings, in order:

- The Context
- The Decision
- The System
- What Survived
- First Contact
- The Results

Each chapter needs at least one nonempty normal paragraph; one optional Heading 2 immediately after the chapter heading sets its display title. Put private material after a final Heading 1 named Working Notes. No content after that heading is processed. Keep drafts and unpublished material out of all preceding sections. Body paragraphs preserve exact characters, repeated text and order; empty spacer paragraphs use site spacing instead. Lists, links, inline semantic formatting, embedded images, additional tabs and additional headings fail closed rather than silently lose meaning. Rich formatting, metadata, image ingestion and essays are deferred to later phases. The existing Google Doc lacks the explicit status and canonical headings; it is not currently publishable by this pilot. No AI edits are made.

## Authentication and activation

1. Create a dedicated Google Cloud project and service account; enable Google Docs API, Drive API, IAM Credentials API and the APIs required for Workload Identity Federation. Restrict the GitHub OIDC provider to the exact repository (prefer immutable repository/owner IDs) and main ref. Grant the federated principal access to impersonate only the dedicated service account. Do not create or download a service account key.
2. Share only the pilot Google Doc with that service account as Viewer. No public link sharing required. Set Actions variables CMS_WIF_PROVIDER and CMS_SERVICE_ACCOUNT, and secret CMS_KIKI_DOCUMENT_ID. The existing chat connector authentication is not reusable by a GitHub runner.
3. Keep CMS_PUBLISH_ENABLED unset or false. Set CMS_SYNC_ENABLED=true only after credentials are configured and the workflow is merged to main. Run the workflow manually with publish unchecked. Confirm authentication, status handling, and candidate validation; no changes are written.
4. Run unit tests and the full portfolio build/browser suite. Check pinned action versions, branch protection, Vercel Git integration and bot-author acceptance before enabling publication. The workflow currently uses version tags; pin reviewed commit SHAs before production activation.
5. Verify the actual Vercel deployment path using a controlled publication. The default GitHub token can suppress downstream push-triggered Actions; Vercel integration and author acceptance have not been verified. Do not enable CMS_PUBLISH_ENABLED until that path and the production verification/rollback procedure are proven. A narrowly scoped GitHub App token or explicit deployment integration may be needed.

## Operation

Schedule: minute 7 and 37 UTC each hour, plus manual dispatch. The default manual run is read-only. Every enabled run checks the registered file version around retrieval and compares only chapter content with the committed snapshot. No persistent version cache is used for the one-document pilot. Unchanged or Draft documents never cause a commit. Missing/invalid status is treated as Draft. Failures stop the workflow with a non-sensitive error code. The workflow validates existing content schema and renderer, checks allowed paths, runs the existing test suite on changes, rereads the document before push, and never force-pushes. Concurrent Git updates cause the push to fail. A successful Git push alone is not proof of successful production deployment.

## Emergency pause and rollback

Set CMS_PUBLISH_ENABLED=false and CMS_SYNC_ENABLED=false; cancel any in-flight workflow before reverting a published snapshot. Restore the prior Git commit or Vercel deployment, verify production, correct the document and leave it Draft before resuming. This pilot provides a global pause; per-document rollback controls will be introduced when additional documents are registered.

## References

- https://developers.google.com/workspace/docs/api/reference/rest/v1/documents/get
- https://github.com/google-github-actions/auth
- https://docs.cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines
- https://docs.github.com/en/actions/how-tos/write-workflows/choose-when-workflows-run/trigger-a-workflow
- https://vercel.com/docs/git/vercel-for-github
