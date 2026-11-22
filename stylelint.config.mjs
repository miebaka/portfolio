import typographyRule, { ruleName as typographyRuleName } from "./scripts/stylelint-typography.mjs";
import sizingRule, { ruleName as sizingRuleName } from "./scripts/stylelint-sizing.mjs";

export default {
  plugins: [typographyRule, sizingRule],
  extends: ["stylelint-config-standard"],
  ignoreFiles: ["dist/**", "assets/runtime/**"],
  rules: {
    [typographyRuleName]: true,
    [sizingRuleName]: true,
    "alpha-value-notation": null,
    "at-rule-empty-line-before": null,
    "block-no-empty": null,
    "color-function-notation": null,
    "custom-property-empty-line-before": null,
    "declaration-block-no-shorthand-property-overrides": null,
    "declaration-block-no-redundant-longhand-properties": null,
    "hue-degree-notation": null,
    "media-feature-range-notation": null,
    "no-descending-specificity": null,
    "no-duplicate-selectors": null,
    "property-no-vendor-prefix": null,
    "property-no-deprecated": null,
    "rule-empty-line-before": null,
    "selector-class-pattern": null,
    "value-keyword-case": null
  }
};
