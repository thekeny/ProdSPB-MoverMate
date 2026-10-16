# Design System

This document defines the visual language, design tokens, and interface conventions for the product. Treat these rules as the source of truth when creating or updating UI. The system has two visual directions: the warm, human **Terra** theme and the high-contrast **Signal** theme. Choose the direction that fits the product context and apply it consistently.

## Visual Directions

### Terra

A warm, calm, human visual direction for products that need to feel trustworthy: local services, education, health, climate, and civic technology. Use dark green text, soft paper-like surfaces, natural greens, and restrained coral accents. Favor editorial layouts, expressive large typography, generous whitespace, and soft corners.

### Signal

A high-contrast direction for data-heavy products, tools, and collaborative workspaces. Use near-black surfaces, a vivid cool blue, and a lime accent. Keep components compact and geometric, and make important data and actions stand out clearly.

## Color

### Terra palette

| Token | Value | Usage |
| --- | --- | --- |
| `ink` | `#1D2923` | Primary text, dark surfaces, primary actions |
| `moss` | `#42664D` | Secondary brand color, labels, links, and accents |
| `sand` | `#E8E2D5` | Warm section backgrounds and notices |
| `paper` | `#F5F3EE` | Main page background and light interface surfaces |
| `coral` | `#D96B4C` | Restrained accent, markers, and error states |
| `line` | `#CFCABD` | Dividers and subtle borders |
| `muted` | `#68716C` | Secondary text |

Additional contextual colors include warm white `#F4F1E9` for text on dark surfaces, paragraph text `#4E5752`, white card surfaces `#FFFFFF`, and pale green surfaces `#E2E9DD` and `#EDF1E8`. Use these as component-level colors rather than expanding the core palette without a clear need.

### Signal palette

| Token | Value | Usage |
| --- | --- | --- |
| `signal` | `#1C32DD` | Signal brand blue |
| `signal-ink` | `#111323` | Primary dark Signal surface |
| `signal-lime` | `#D2EF70` | Active values, calls to action, and highlights |

Signal charts may also use blue `#5266FF`. On dark surfaces, use light text `#F5F7FF`, subdued text `#A8AABA`, and borders `#3C3E50`.

### Color usage

- Use `ink` for primary text on light surfaces and `muted` for secondary text.
- Use `coral` sparingly as a pinpoint accent; avoid using it as a large surface color.
- Success states use green tones `#3D6B4C` / `#6B9C6C`. Error states use `#A84D3C` and `coral`.
- Keep Signal blue and lime on dark Signal surfaces; do not mix them into Terra without a clear product reason.
- Check text legibility and interactive-state visibility whenever adding new colors or states.

## Typography

### Typefaces

- **Manrope** is the primary sans-serif for interface text, navigation, body copy, and buttons. Use weights 400, 500, 600, 700, and 800.
- **Playfair Display** is the accent serif for selected words and editorial-style headings. Prefer weight 600, often italic; weight 700 may be used when needed.
- Use `Arial, sans-serif` and `Georgia, serif` as fallback stacks for sans-serif and serif text respectively.

### Scale and usage

The default body size is **15 px** with a **1.55** line height. The reference type scale is **12, 14, 16, 20, 32, and 56 px**. Component-specific text ranges from 9 px for utility labels to 92 px for large display headings.

| Role | Size and treatment |
| --- | --- |
| Body text | 15 px / 1.55 line height |
| Emphasized paragraph | 16 px |
| Labels and metadata | Usually 9–13 px; labels often 11 px, weight 800, uppercase, `.08em` letter spacing |
| Card heading | For example, 29 px, weight 700, line height around 1.03 |
| Section heading | 40–64 px, responsive |
| Display heading | 48–92 px, responsive; 45–51 px on narrow screens |
| Editorial accent | Playfair Display, usually weight 600; italic may be used for emphasis |

Large sans-serif headings use tight line height (`.96–1.03`) and negative letter spacing (typically `-.05em` to `-.065em`). Do not use this compressed treatment for long-form body copy.

## Layout, Spacing, and Shape

- Maximum content width: **1240 px**.
- Container side padding: **32 px** on wide screens and **20 px** at viewport widths up to 800 px.
- Header height: **76 px** on wide screens and **65 px** on mobile.
- Major sections use generous vertical spacing: approximately **108–122 px** on wide screens and **74–75 px** on mobile.
- Token layouts use three columns with **14 px** gaps; component layouts use two columns with the same gap. At widths up to 800 px, these layouts become single-column.
- Use compact gaps of **4–14 px** for related items and **21–50 px** between larger blocks. Let spacing communicate hierarchy: large gaps separate sections; small gaps group related controls.
- A two-part feature layout may use approximately **31% / 69%** columns with a **50 px** gap; stack it into one column on mobile.

### Corner radii and surfaces

- Small controls and fields: around **7 px**.
- Notices: **8 px**; list items: **10 px**.
- Cards: **16 px**.
- Large feature surfaces: **24 px**.
- Pills and fully rounded controls: `100px` or `50%`.
- White cards use **25 px** padding. Large Terra feature surfaces may use a soft shadow such as `0 16px 30px rgba(44, 54, 45, .11)`. Signal surfaces should remain flatter and avoid decorative shadows.

## Components

### Buttons

- **Primary:** `ink` fill, white text, Manrope 700 at 12 px, 7 px radius, 13 px vertical and 15 px horizontal padding. Use for the single most important action on a screen.
- **Secondary:** transparent fill, `#9BA69F` border, `ink` text, matching size and radius. It should not compete with the primary action.
- **Text button:** no fill or radius; use an `ink` underline.
- **Icon button:** 38 × 38 px, circular, coral fill, white icon.
- Use concise, verb-led action labels.

### Fields and statuses

- Fields are **43 px** high, with a **7 px** radius, `#9BA69F` border, and **12 px** horizontal padding.
- Field labels use **11 px**, weight **700**, with **6 px** between the label and field.
- Show success and error with both color and a text or icon indicator; never rely on color alone.
- Focused fields use a soft green outline: `3px solid rgba(66, 102, 77, .3)` with a 2 px offset.

### Cards, tags, and notices

- Light cards use a white surface, **16 px** radius, and **25 px** padding.
- Colored cards may use `moss` with white text and tonal green dividers.
- Categories and tags are compact outlined pills; typical text size is 10–11 px.
- Place notices near the action that caused them. Use a `sand` surface, **8 px** radius, **14 px** padding, and a clear statement of the result.

## Responsive Design and Accessibility

- At **800 px**, hide desktop navigation, reduce container padding, and collapse multi-column grids into one column.
- At **430 px**, reduce heading sizes further and simplify dense demo navigation and Signal grids.
- Preserve content order and readability when layouts reflow; do not depend on desktop-only horizontal space.
- All interactive elements need a visible `:focus-visible` state: a 3 px `coral` outline with a 3 px offset.
- Respect `prefers-reduced-motion`: disable smooth scrolling and transitions when the user requests reduced motion.

## Interface Voice

Write in plain, specific language. Prefer short, verb-led phrases and show the result of an action close to where it happened. Favor whitespace and clear hierarchy over extra cards or decorative effects.

## Implementation Requirements

- Continue using **Tailwind CSS** for layout, spacing, responsive behavior, and styling. Express the design rules in Tailwind utilities wherever practical; use CSS variables or small custom CSS rules only when a value or treatment cannot be represented cleanly with the existing setup.
- Continue using **shadcn/ui** components for accessible interface primitives. Customize their variants and tokens to match this design system instead of replacing the system’s visual direction with shadcn defaults.
- Preserve the color, typography, spacing, radius, responsive, and accessibility rules above when composing or adapting Tailwind and shadcn/ui components.
- Keep repeated design values centralized as reusable theme tokens or CSS variables rather than scattering inconsistent one-off values through the interface.
