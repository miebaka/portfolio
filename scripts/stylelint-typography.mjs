import stylelint from "stylelint";
import { readFileSync } from "node:fs";

/** Enforce the sole source of typography metrics: styles/tokens.css. */
export const ruleName = "portfolio/typography-tokens";
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (property, value) => "Use a sanctioned typography token for " + property + ": " + value
});
const keywords = /^(inherit|initial|unset|revert|revert-layer|normal)$/i;
/* Read the actual token declarations, so invented names cannot pass lint. */
const definedTypeTokens = new Set(
  [...readFileSync(new URL("../styles/tokens.css", import.meta.url), "utf8")
    .matchAll(/^\s*(--type-[\w-]+)\s*:/gm)].map(match => match[1])
);
const sizeToken = String.raw`--type-(?:label|nav|input|body|heading|display|inline-mark)(?:-[\w-]+)?`;
const valid = {
  "font-size": new RegExp(`^var\\(${sizeToken}\\)import stylelint from "stylelint";
import { readFileSync } from "node:fs";

/** Enforce the sole source of typography metrics: styles/tokens.css. */
export const ruleName = "portfolio/typography-tokens";
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (property, value) => "Use a sanctioned typography token for " + property + ": " + value
});
const keywords = /^(inherit|initial|unset|revert|revert-layer|normal)$/i;
/* Read the actual token declarations, so invented names cannot pass lint. */
const definedTypeTokens = new Set(
  [...readFileSync(new URL("../styles/tokens.css", import.meta.url), "utf8")
    .matchAll(/^\s*(--type-[\w-]+)\s*:/gm)].map(match => match[1])
);
const sizeToken = String.raw`--type-(?:label|nav|input|body|heading|display|inline-mark)(?:-[\w-]+)?`;
const valid = {
),
  "font-weight": /^var\(--type-weight-(regular|semibold)\)$/,
  "font-family": /^var\(--(display|body|label|signature|icon)\)$/,
  "line-height": /^var\(--type-leading-[\w-]+\)$/,
  "letter-spacing": /^var\(--type-tracking-[\w-]+\)$/,
  "font-stretch": /^normal$/,
  font: new RegExp(`^var\\(--type-weight-(regular|semibold)\\) var\\(${sizeToken}\\)/var\\(--type-leading-[\\w-]+\\) var\\(--(display|body|label|signature|icon)\\)import stylelint from "stylelint";
import { readFileSync } from "node:fs";

/** Enforce the sole source of typography metrics: styles/tokens.css. */
export const ruleName = "portfolio/typography-tokens";
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (property, value) => "Use a sanctioned typography token for " + property + ": " + value
});
const keywords = /^(inherit|initial|unset|revert|revert-layer|normal)$/i;
/* Read the actual token declarations, so invented names cannot pass lint. */
const definedTypeTokens = new Set(
  [...readFileSync(new URL("../styles/tokens.css", import.meta.url), "utf8")
    .matchAll(/^\s*(--type-[\w-]+)\s*:/gm)].map(match => match[1])
);
const sizeToken = String.raw`--type-(?:label|nav|input|body|heading|display|inline-mark)(?:-[\w-]+)?`;
const valid = {
  "font-size": new RegExp(`^var\\(${sizeToken}\\)import stylelint from "stylelint";
import { readFileSync } from "node:fs";

/** Enforce the sole source of typography metrics: styles/tokens.css. */
export const ruleName = "portfolio/typography-tokens";
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (property, value) => "Use a sanctioned typography token for " + property + ": " + value
});
const keywords = /^(inherit|initial|unset|revert|revert-layer|normal)$/i;
/* Read the actual token declarations, so invented names cannot pass lint. */
const definedTypeTokens = new Set(
  [...readFileSync(new URL("../styles/tokens.css", import.meta.url), "utf8")
    .matchAll(/^\s*(--type-[\w-]+)\s*:/gm)].map(match => match[1])
);
const sizeToken = String.raw`--type-(?:label|nav|input|body|heading|display|inline-mark)(?:-[\w-]+)?`;
const valid = {
),
  "font-weight": /^var\(--type-weight-(regular|semibold)\)$/,
  "font-family": /^var\(--(display|body|label|signature|icon)\)$/,
  "line-height": /^var\(--type-leading-[\w-]+\)$/,
  "letter-spacing": /^var\(--type-tracking-[\w-]+\)$/,
  "font-stretch": /^normal$/,
)
};

export default stylelint.createPlugin(ruleName, enabled => (root, result) => {
  if (!enabled || /(?:^|[/\\])tokens\.css$/.test(root.source.input.file ?? "")) return;
  root.walkDecls(decl => {
    if (decl.parent.type === "atrule" && decl.parent.name === "font-face") return;
    const property = decl.prop.toLowerCase();
    const allowed = valid[property];
    if (!allowed) return;
    const value = decl.value.trim();
    const referencedTokens = [...value.matchAll(/var\((--type-[\w-]+)\)/g)];
    const referencesExist = referencedTokens.every(match => definedTypeTokens.has(match[1]));
    if (keywords.test(value) || (allowed.test(value) && referencesExist)) return;
    stylelint.utils.report({ruleName, result, node: decl, message: messages.rejected(property, value)});
  });
});
