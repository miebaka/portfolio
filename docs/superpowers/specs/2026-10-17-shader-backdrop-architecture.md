# Print / Screen shader backdrop

## Decision

Use the official ShaderGradient renderer as a lazy React island for the
homepage signature background. The rest of the portfolio remains static and
does not pay the runtime cost; React and React Three Fiber own only this
decorative canvas and are built into one isolated runtime asset.

This keeps ShaderGradient's actual water-plane mesh, shader, camera, lighting
and grain implementation instead of approximating it with a lookalike fragment
shader.

## Theme art direction

- **Print / light:** an editorial-press field made from paper, pale ultramarine
  and a deep ink seam. It should feel like translucent ink moving under stock,
  not a generic colourful wallpaper.
- **Screen / dark:** ShaderGradient preset **04 Nighty night**, recoloured with
  the defined ultramarine ramp (`#002080`, `#1c3da4`, `#b1c5ff`). Preserve its
  water-plane, camera, grain, density, strength and slow-motion character.
- The shader remains fixed behind the entire homepage, not only the opening.
  A global theme scrim protects the opening. The reading sequence uses one
  translucent blurred plane so the field continues through it without letting
  the sticky hero headline ghost through later sections.

## Runtime contract

1. `js/core/shader-backdrop.js` creates the decorative host on Home and
   lazy-loads the bundled island. No HTML route gets duplicated markup.
2. `js/shader-gradient-island.js` renders the official `ShaderGradientCanvas`
   and `ShaderGradient` components using the complete Nighty night preset
   contract with only the three colour inputs replaced.
3. Theme changes update the island props without recreating the React root.
4. The solid hero paints first. The island downloads after the first pointer
   movement, pointer press, keyboard or scroll interaction, with a six-second
   fallback for passive visits, keeping React/R3F outside the critical path.
5. Fine-pointer movement applies a damped camera orbit capped at 7 degrees
   azimuth and 4 degrees polar. Touch, Save-Data and reduced-motion states stay
   static. General WebDriver suites skip the expensive decorative runtime; the
   shader's focused E2E and visual checks opt in with `?shader-test=1`.
6. If WebGL or the module import fails, the existing solid theme background is
   untouched. The enhancement class is applied only after the first successful
   frame.
7. The canvas is `aria-hidden`, cannot receive input, and is removed with all
   observers/listeners on page teardown.

## Acceptance criteria

- Print and Screen produce visibly different shader fields without changing
  the existing type, spacing, content, route structure or controls.
- Screen contains the defined ultramarine palette on the exact Nighty night
  shader configuration.
- The theme toggle updates the backdrop without reload.
- Reduced motion is static; full motion remains deliberately slow.
- Every route retains readable foreground contrast, no horizontal overflow and
  no new console errors.
- Content, CSS-contract, E2E, accessibility, visual and performance checks pass.
