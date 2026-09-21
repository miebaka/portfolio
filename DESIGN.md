# Miebaka Joshua — Monochrome editorial system

Updated 21 September 2026. Replaces the warm-paper, serif-body direction.

## Direction

Restrained editorial interface for clients and hiring teams. Black, white and neutral greys only for the UI. Real artwork and photography retain their original colours. No site-wide grayscale filter.

## Typography

TeX Gyre Heros: headings, body, captions, footer links and contact details.
Josefin Sans: short labels and controls only; uppercase, 0.14–0.16em tracking.

| Role | Size | Leading |
| --- | --- | --- |
| Opening headline | 36–64px desktop; 32–44px mobile | 1.08 |
| Page heading | 32–48px | 1.15 |
| Section heading | 28–36px | 1.15 |
| Subheading | 22–28px | 1.15 |
| Body | 16px | 1.6 |
| Supporting copy | 14px | 1.6 |
| Labels and controls | 12px | 1.25–1.3 |

Fonts are self-hosted. Reading measure is capped at 38em.

## Colour and spacing

Light: #fff surface, #111 text, #595959 secondary, #d9d9d9 rules.
Dark: #111 surface, #fff text, #b8b8b8 secondary, #404040 rules.
Status messages retain explicit text; colour alone never conveys status.

Gutters: 24–96px, shared with the navigation and footer. Section intervals: 105.6–211.2px; compact intervals: 70.4–140.8px (10% increase).
Components use an 8px internal rhythm where practical.
Decorative dividers are removed. Major page openings contain a headline without supporting copy.

## Components

- Buttons adapt [HyperUI solid and bordered patterns](https://www.hyperui.dev/components/marketing/buttons/) to the existing zero-build CSS. Minimum height 44px, 12px vertical/20px horizontal padding, 4px corners. Visible focus outlines and native disabled semantics.
- Homepage and Work retain the original expanding panels: 64% active panel, blurred neighbouring image slivers and subtle image zoom. [HyperUI card 3](https://www.hyperui.dev/components/marketing/cards/#component-3) supplies only the hover layer: image darkening and a short description rising into view. Keyboard focus reveals content immediately; mobile retains stacked panels with visible descriptions.
- Work filters are removed. Selected Work and Disciplines are uppercase 12px labels. Disciplines contains one title and one concise description per service.
- Case-study navigation remains direct, without a greeting loader or transition overlay. The chapter index appears at Problem and hides on reverse scrolling above it; its panel contrasts with the current theme.
- About uses an original first-person biography grounded in public writing and the speaker profile; source notes are in docs/about-research.md. The former Now/Next, interests and writing index is removed.
- Footer body and links use Heros. Exact signature occupies 80% of a matching-aspect-ratio frame with 10% inset on every side. Dot matrix samples the same geometry. Static fallback stays visible until sampling succeeds.

## Motion

Controls: 150ms. Card hover: 180ms opacity and movement. Keyboard feedback is immediate.
The client-logo marquee continues on hover. Reduced motion disables motion and retains a static signature.

## Implementation and verification

Typography: styles/tokens/typography.css. Shared component rules: styles/editorial-system.css, imported by styles/main.css. Existing routes, artwork and integrations remain.

Rendered desktop homepage, Work and footer checked. Type, overflow and interface colours measured across About, Services, Contact, Playground and all four case studies. Mobile homepage, Work and complete signature containment checked. Four scene lifecycle tests pass. This is not a Lighthouse or cross-browser certification.
