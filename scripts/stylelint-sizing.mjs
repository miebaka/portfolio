import stylelint from "stylelint";

/** Enforce one spacing grid, one container source and one responsive range set. */
export const ruleName = "portfolio/sizing-system";
export const breakpointSizes = Object.freeze({
  min: ["24em", "40em", "56em", "72em", "88em"],
  max: ["23.999em", "39.999em", "55.999em", "71.999em", "87.999em"],
});
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: message => message,
});
const isSpacing = /^(?:(?:margin|padding|scroll-margin|scroll-padding)(?:-[a-z-]+)?|gap|row-gap|column-gap)$/;
const outsideRoot = new Set(["--content", "--page", "--grid-max", "--grid-outer", "--grid-gutter", "--grid-gap", "--spacing-unit", "--section-padding", "--section-padding-tight", "--nav-h"]);
const rawLength = /(^|[^\w-])-?(?:\d*\.)?\d+(?:em|rem|px)\b/i;

export default stylelint.createPlugin(ruleName, enabled => (root, result) => {
  if (!enabled) return;
  const file = root.source.input.file || "";
  const ownsFoundations = String(file).trim().endsWith("foundations.css") ||
    root.nodes.some(node => node.type === "rule" && node.selector === ":root" &&
      node.nodes.some(decl => decl.prop === "--grid-max"));
  const report = (node, message) => stylelint.utils.report({
    ruleName, result, node, message: messages.rejected(message),
  });

  root.walkAtRules("media", atRule => {
    const expression = atRule.params;
    const widths = [...expression.matchAll(/\b(min|max)-width\s*:\s*([^\s)]+)/gi)];
    if (/\b(?:min|max)-width\b/i.test(expression) && !widths.length) {
      report(atRule, "Use an approved breakpoint from the responsive sizing system");
    }
    for (const [, direction, actual] of widths) {
      if (!breakpointSizes[direction.toLowerCase()].includes(actual.toLowerCase())) {
        report(atRule, `Unapproved breakpoint ${direction}-width: ${actual}`);
      }
    }
    if (/\bwidth\s*(?:[<>]=?|:)/i.test(expression) && !widths.length) {
      report(atRule, "Viewport width must use the canonical min/max breakpoint syntax");
    }
  });

  root.walkDecls(decl => {
    const prop = decl.prop.toLowerCase();
    const value = decl.value;
    if (/^--tailor-(?:container|gutter|section(?:-tight)?|heading|title)$/.test(prop)) {
      report(decl, `Obsolete competing sizing token: ${prop}`);
    }
    if (!ownsFoundations && (outsideRoot.has(prop) || /^--s\d+$/.test(prop))) {
      report(decl, `Only foundations.css may define shared sizing token ${prop}`);
    }
    if (!ownsFoundations && /(^|[^\d])44px\b/.test(value)) {
      report(decl, "Use var(--control-target) rather than a raw 44px control size");
    }
    if (isSpacing.test(prop) && rawLength.test(value)) {
      report(decl, `${prop} must consume the shared spacing scale, not a literal length: ${value}`);
    }
  });
});
