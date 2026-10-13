# Builder report — v1.1.3

## Implemented

- Restored `Based in` and `Social` from `data/site.js` inside the current compact horizontal footer.
- Standardized every primary action on `.btn` and removed the retired `.btn--primary` modifier from source markup.
- Added safe-area variables, keyboard-aware viewport metadata, scheme-specific browser colours, touch behavior, coarse-pointer form sizing, scrollable mobile navigation, narrow-device Now Playing flow, and bounded mobile media/card sizing.
- Removed the unreachable legacy CSS tree, dead case-rail and motion-director modules, and the empty kinetic initializer.
- Updated automated contracts, version, changelog, architecture notes, and this release report.

## Boundaries

No backend, database, authentication, dependency, private credential, or data collection was added. Physical iOS and Android device verification remains separate from browser emulation.
