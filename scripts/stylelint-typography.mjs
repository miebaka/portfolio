import stylelint from "stylelint";

/** Enforce the sole source of typography metrics: styles/tokens.css. */
export const ruleName = "portfolio/typography-tokens";
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (property, value) => "Use a sanctioned typography token for " + property + ": " + value
});
const keywords = /^(inherit|initial|unset|revert|revert-layer|normal)$/i;
const valid = {
  "font-size": /^var\(--type-[\w-]+\)$/,
  "font-weight": /^var\(--type-weight-(regular|semibold)\)$/,
  "font-family": /^var\(--(display|body|label|signature|icon)\)$/,
  "line-height": /^var\(--type-leading-[\w-]+\)$/,
  "letter-spacing": /^var\(--type-tracking-[\w-]+\)$/,
  "font-stretch": /^normal$/,
  font: /^var\(--type-weight-(regular|semibold)\) var\(--type-[\w-]+\)\/var\(--type-leading-[\w-]+\) var\(--(display|body|label|signature|icon)\)$/
};

export default stylelint.createPlugin(ruleName, enabled => (root, result) => {
  if (!enabled || /(?:^|[/\\])tokens\.css$/.test(root.source.input.file ?? "")) return;
  root.walkDecls(decl => {
    if (decl.parent.type === "atrule" && decl.parent.name === "font-face") return;
    const property = decl.prop.toLowerCase();
    const allowed = valid[property];
    if (!allowed) return;
    const value = decl.value.trim();
    if (keywords.test(value) || allowed.test(value)) return;
    stylelint.utils.report({ruleName, result, node: decl, message: messages.rejected(property, value)});
  });
});
