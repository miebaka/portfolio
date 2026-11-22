/* One source for browser-side breakpoint queries; mirrors the lint contract. */
export const viewportQueries = Object.freeze({
  extraSmall: "(max-width: 23.999em)",
  small: "(max-width: 39.999em)",
  compact: "(max-width: 55.999em)",
  tablet: "(min-width: 56em)",
  desktop: "(min-width: 72em)",
  tabletMax: "(max-width: 71.999em)",
  wideMax: "(max-width: 87.999em)",
  wide: "(min-width: 88em)",
});

export const isCompactViewport = () => matchMedia(viewportQueries.compact).matches;
