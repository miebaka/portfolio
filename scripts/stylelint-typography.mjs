import stylelint from "stylelint";

/** All typography properties must live in styles/tokens.css, never page CSS. */
export const ruleName = "portfolio/typography-tokens";
const messages = stylelint.utils.ruleMessages(ruleName, {
  rejected: (property, value) => `Typography belongs in styles/tokens.css: ${property}: ${value}`,
});
const typographyProperty = /^(?:font(?:-[\w-]+)?|line-height|letter-spacing|word-spacing|text-(?:align|transform|wrap|rendering|indent|overflow|shadow|decoration(?:-[\w-]+)?|underline-[\w-]+|size-adjust|emphasis(?:-[\w-]+)?)|white-space|word-break|overflow-wrap|hyphens|tab-size|-webkit-(?:font-[\w-]+|text-[\w-]+))$/;
export default stylelint.createPlugin(ruleName, enabled => (root, result) => {
  if (!enabled || /(?:^|[/\\])tokens\.css$/.test(root.source.input.file ?? "")) return;
  root.walkDecls(decl => {
    if (!typographyProperty.test(decl.prop.toLowerCase())) return;
    stylelint.utils.report({
      ruleName, result, node: decl, message: messages.rejected(decl.prop, decl.value.trim()),
    });
  });
});
