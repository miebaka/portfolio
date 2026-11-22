/* One source for browser-side breakpoint queries; mirrors the lint contract. */
export const viewportQueries = Object.freeze({
  extraSmall: "(max-width: 24.999em)",
  small: "(max-width: 39.999em)",
  compact: "(max-width: 47.999em)",
  tablet: "(min-width: 48em)",
  desktop: "(min-width: 62em)",
  tabletMax: "(max-width: 61.999em)",
  wideMax: "(max-width: 71.999em)",
  wide: "(min-width: 72em)",
});

export const isCompactViewport = () => matchMedia(viewportQueries.compact).matches;
