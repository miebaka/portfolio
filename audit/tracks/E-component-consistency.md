# Track E — Component consistency

## Inventory and findings

| Component | Evidence | Finding |
|---|---|---|
| Header/nav | `index.html:48-57`, `js/render/navigation.js:35-50` | Static fallback plus runtime replacement plus separate mobile tab bar are three patterns. Consolidate to one shared markup source enhanced in place. |
| Footer | `index.html:99-113`, `explorations.html:56`, `js/render/footer.js:21-30` | Repeated fallback is complete on conventional pages; Explorations has an empty mount and fails JS-disabled parity. |
| Selected-work card | `js/render/projects.js:1-57`, `work.html:62`, screenshots | Home and Work share project data but use different structures/preview counts. Define a base card plus explicit `home`, `archive`, `next` variants. |
| Case meta | `js/render/case-markup.js:17-31,93` | One renderer emits facts, but missing fields mean Collaborators is not always present. Schema should define ordered optional cells without fabricating data. |
| Case anchor nav | `js/render/case-markup.js:90,99` | Two markup patterns (`ol/li/a` and direct anchors) and two label taxonomies coexist. Merge. |
| Figure/caption | `js/render/case-markup.js:33-52` | Centralized and semantically sound; preserve. |
| CTA/buttons | `contact.html:63-126`; `styles/components-v4.css` | Visual states exist but source has 22 `!important` declarations globally (`audit/raw/recon.txt`), so state precedence is not demonstrably flat. |
| Form fields | `contact.html:82-125` | Visible labels and native controls are present; retain native semantics. |

Naming is mostly BEM-like (`block__element--modifier`) but mixed with generic utilities and page selectors. Recommendation: document BEM for components and a small `u-*` utility namespace; do not perform a blind global rename because JS selectors depend on classes/data attributes.

Target-size acceptance needs a browser measurement pass. Axe’s zero violations does not test the 24×24 WCAG 2.5.8 exception logic comprehensively.

