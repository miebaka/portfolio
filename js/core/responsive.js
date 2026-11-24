/* Belonwus reference breakpoints; mirror scripts/stylelint-sizing.mjs. */
export const viewportQueries = Object.freeze({
  extraSmall: "(max-width: 23.4375em)",
  small: "(max-width: 26.5625em)",
  compact: "(max-width: 48em)",
  tablet: "(min-width: 48.0625em)",
  desktop: "(min-width: 48.0625em)",
  tabletMax: "(max-width: 48em)",
  wideMax: "(max-width: 48em)",
  wide: "(min-width: 48.0625em)",
});

export const isCompactViewport = () => matchMedia(viewportQueries.compact).matches;
