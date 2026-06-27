# Playbook — Design OS · Design System
**Aesthetic: iOS 26 / Apple Liquid Glass**

A Liquid Glass design system for a personal design-ops tool. Translucent surfaces, spring motion, Apple-grade typography. Calm at rest, alive when touched.

## How to use in Claude Code

1. Import `tokens.css` once at the top of your global stylesheet.
2. Reference this README + `tokens.css` as the source of truth for any new UI.

---

## Core principles

1. **Liquid Glass.** Cards and sidebars are translucent — `backdrop-filter: blur(24px) saturate(1.8)` with a `rgba` background. Content behind bleeds through, creating perceived depth.
2. **Specular highlights.** Every glass surface has `inset 0 1px 0 var(--glass-specular)` — a subtle top-edge highlight that makes it feel physically real.
3. **System font.** `-apple-system` resolves to SF Pro on Apple devices. Use it everywhere. Never load a web font for body text.
4. **Spring motion.** Interactive elements use `--ease-spring: cubic-bezier(0.34,1.56,0.64,1)` — slight overshoot on scale and position. Static transitions use `--ease`.
5. **Color is state.** `--success / --warning / --danger / --brag` map strictly to task state. Never use them decoratively.
6. **Elevation by blur, not shadow.** The more blurred and translucent a surface, the higher it sits. Modals > sidebars > cards > page.

---

## Design tokens

### Color

| Token | Light | Dark | Role |
|---|---|---|---|
| `--paper` | `#F2F2F7` | `#000000` | App / grouped background |
| `--surface` | `#FFFFFF` | `#1C1C1E` | Cards, primary surfaces |
| `--surface-2` | `#F2F2F7` | `#2C2C2E` | Secondary / sidebar bg |
| `--surface-3` | `#E5E5EA` | `#3A3A3C` | Tertiary / inset bg |
| `--glass-bg` | `rgba(255,255,255,.72)` | `rgba(28,28,30,.78)` | Glass material |
| `--glass-border` | `rgba(255,255,255,.55)` | `rgba(255,255,255,.10)` | Glass edge |
| `--glass-specular` | `rgba(255,255,255,.80)` | `rgba(255,255,255,.14)` | Top-edge highlight |
| `--line` | `rgba(60,60,67,.29)` | `rgba(84,84,88,.65)` | Separators |
| `--ink` | `#000000` | `#FFFFFF` | Primary label |
| `--ink-2` | `rgba(60,60,67,.60)` | `rgba(235,235,245,.60)` | Secondary label |
| `--ink-3` | `rgba(60,60,67,.30)` | `rgba(235,235,245,.30)` | Tertiary label |
| `--accent` | `#007AFF` | `#0A84FF` | System Blue |
| `--accent-soft` | `rgba(0,122,255,.12)` | `rgba(10,132,255,.16)` | Tinted bg |
| `--success / -soft` | `#34C759` | `#30D158` | Completed |
| `--warning / -soft` | `#FF9500` | `#FF9F0A` | Pending |
| `--danger / -soft` | `#FF3B30` | `#FF453A` | Overdue |
| `--brag / -soft` | `#AF52DE` | `#BF5AF2` | Highlights |

### Typography

SF Pro via `-apple-system`. No Google Fonts — system font renders natively.

| Style | Size | Weight | Letter-spacing | Usage |
|---|---|---|---|---|
| Large Title | 34px | 700 | −0.4px | Page display headings |
| Title 1 | 28px | 700 | −0.36px | Section headers |
| Title 2 | 22px | 700 | −0.26px | Card titles |
| Title 3 | 20px | 600 | −0.45px | Sub-sections |
| Headline | 17px | 600 | −0.41px | List item titles |
| Body | 17px | 400 | −0.41px | Body text |
| Callout | 16px | 400 | −0.32px | Secondary body |
| Footnote | 13px | 400 | −0.08px | Captions, metadata |
| Caption | 12px | 400 | 0px | Timestamps, counts |
| Mono | any | 400/500 | — | Dates, counts, code |

### Radius

| Token | Value | Usage |
|---|---|---|
| `--r-xs` | 6px | Tiny chips |
| `--r-sm` | 10px | Tags, secondary elements |
| `--r-md` | 14px | Buttons, inputs, badges |
| `--r-lg` | 20px | Cards, panels |
| `--r-xl` | 28px | Large cards, modal sheets |
| `--r-full` | 999px | Pills, avatars, toggles |

### Shadows

| Token | Usage |
|---|---|
| `--shadow-xs` | Subtle lift |
| `--shadow-sm` | Cards at rest |
| `--shadow-md` | Cards on hover |
| `--shadow-lg` | Sheets, modals |
| `--shadow-glass` | Glass surfaces (includes specular inset) |

### Motion

| Token | Value | Usage |
|---|---|---|
| `--ease` | `cubic-bezier(0.4,0,0.2,1)` | State transitions |
| `--ease-spring` | `cubic-bezier(0.34,1.56,0.64,1)` | Interactive scale/position |
| `--ease-decel` | `cubic-bezier(0.0,0.0,0.2,1)` | Elements entering |
| `--dur-fast` | 200ms | Micro-interactions |
| `--dur-base` | 320ms | Standard transitions |
| `--dur-theme` | 420ms | Theme switch |

---

## Components

### Glass surface (the core material)
```css
background: var(--glass-bg);
backdrop-filter: var(--glass-blur); /* blur(24px) saturate(1.8) */
-webkit-backdrop-filter: var(--glass-blur);
border: 1px solid var(--glass-border);
box-shadow: var(--shadow-glass); /* includes specular top highlight */
border-radius: var(--r-lg);
```

### Sidebar nav
- Width: 220px. Background: `--glass-bg` + blur on `--paper`.
- Nav items: `padding: 9px 12px; border-radius: var(--r-md); gap: 12px`.
- **Default:** `color: var(--ink-2)`. **Hover:** `background: rgba(0,0,0,0.04)`.
- **Active:** `background: var(--accent-soft); color: var(--accent); font-weight: 600`.
- Section labels: 12px/400, `--ink-3`, `letter-spacing: 0.06em`, uppercase.
- Count chips: `border-radius: var(--r-full); padding: 2px 8px; background: var(--surface-3); font-size: 12px`.

### Cards (glass panels)
- `background: var(--glass-bg); backdrop-filter: var(--glass-blur); border: 1px solid var(--glass-border); border-radius: var(--r-lg); box-shadow: var(--shadow-glass)`.
- On hover: `box-shadow: var(--shadow-md); transform: translateY(-1px) scale(1.003)` with `--ease-spring`.

### Metric / stat cards
- Individual floating cards (not a shared-border grid).
- Number: 64px, weight 700, `--ink`, `letter-spacing: -0.03em`.
- Label: 13px, `--ink-3`.
- Colour accent: `3px` top bar at rest → `14px` on hover, transitions with `--ease-spring`.

### Task row
- `padding: 14px 18px; gap: 14px`. Title: 15px/600. Meta: 13px `--ink-3`.
- Hover: left border `3px solid var(--accent)` via `box-shadow: inset 3px 0 0 var(--accent)`.
- Expanded detail: `background: var(--surface-2); border-top: 1px solid var(--line)`.

### Status badges
- `border-radius: var(--r-full); padding: 4px 12px; font-size: 12px; font-weight: 600`.
- Use `-soft` token for background, full token for text.
- In Progress → accent. Pending → warning. Overdue → danger. Done → success.

### Buttons
- **Primary:** `background: var(--accent); color: #fff; border-radius: var(--r-md); padding: 11px 20px; font-weight: 600; font-size: 15px`.
- **Tinted:** `background: var(--accent-soft); color: var(--accent)` — no border.
- **Secondary:** `background: var(--surface-3); color: var(--ink); border: none`.
- **Destructive:** `color: var(--danger); background: var(--danger-soft)`.
- All buttons: `transition: opacity 200ms, transform 200ms`. Active state: `transform: scale(0.97)`.

### Inputs
- `background: var(--surface-2); border: 1.5px solid var(--line); border-radius: var(--r-md); padding: 11px 14px`.
- Focus: `border-color: var(--accent); box-shadow: 0 0 0 4px var(--accent-soft)`.

### Toast
- Pill, glass material. `border-radius: var(--r-full); padding: 10px 24px; box-shadow: var(--shadow-glass); backdrop-filter: var(--glass-blur)`.
- Enter: slide up 10px + fade in, `--ease-decel 300ms`. Exit: fade out.

### Theme toggle
- `width: 51px; height: 31px` track, `border-radius: var(--r-full)`. Thumb: 27px circle, `background: #fff; box-shadow: var(--shadow-sm)`.
- Active track: `var(--success)` (iOS system green). Thumb slides with `--ease-spring`.

---

## Files

- `tokens.css` — CSS custom properties (light + dark + base reset). Import once.
- `tokens.json` — machine-readable token values.
