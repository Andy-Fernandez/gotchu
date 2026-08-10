# Design system baseline

Status: accepted on August 6, 2026.

This document defines the initial visual and interaction language for Gotchu. It applies to the customer booking experience, staff operations, owner surfaces, and future marketplace work. It is deliberately small: establish a coherent foundation, build the core journey, and add tokens or component variants only when a real product need appears.

## shadcn/ui implementation foundation

> El sistema visual define la identidad. shadcn/ui nos da primitives accesibles y bien construidos para implementarla.

Gotchu owns the visual language, semantic tokens, component APIs, and product-specific behavior. shadcn/ui supplies open-code primitives built on Radix; it is an implementation foundation, not the source of Gotchu's identity. Generated components are reviewed and specialized before product use rather than treated as finished product components.

The initial implementation uses the Radix base, React Server Component-compatible output, Tailwind CSS variables, Lucide icons, and these aliases:

```text
@/components     reusable components
@/components/ui  visual primitives
@/lib/utils      shared UI utilities
@/lib            shared libraries
@/hooks          reusable hooks
```

Install only primitives required by an accepted product flow. The initial source set is `Button`, `Input`, `Textarea`, `Badge`, `Card`, `Separator`, and `Skeleton`; adding a registry component is not permission to adopt its default visual decisions.

The MVP ships with a light theme only. Do not add a dark palette, theme switcher, or automatic system-theme behavior until a real product requirement defines and validates the complete dark semantic palette.

### Semantic variable mapping

| Gotchu intent | shadcn variable | Mapping |
|---|---|---|
| Page background | `--background` | `neutral/50` |
| Primary foreground | `--foreground` | `neutral/950` |
| Surface | `--card`, `--popover` | `neutral/0` |
| Primary action | `--primary` | `neutral/950` |
| Secondary action | `--secondary` | `neutral/0` |
| Muted foreground | `--muted-foreground` | `neutral/600` |
| Subtle accent surface | `--accent` | `purple/50` |
| Accent content | `--accent-foreground` | `purple/500` |
| Default boundary | `--border`, `--input` | `neutral/200` |
| Keyboard focus | `--ring` | `purple/500` |
| Destructive meaning | `--destructive` | Danger foreground |

The shadcn `accent` variable represents an accent surface, so the purple brand foreground belongs in `accent-foreground`. Gotchu-specific roles such as accent hover, accent on dark, rating, and operational statuses remain semantic extensions alongside the shadcn contract.

## Brand direction

Gotchu is primarily black and white. The interface should feel clear, dependable, operational, and premium without relying on decorative complexity.

Purple is a secondary accent used at low frequency. Its purpose is to direct attention to small optional actions or interactive details such as “Ver más,” “Leer más,” a focus ring, or a compact selected-state indicator. It is not the default button color, a status color, or a large-area background.

Aim for this visual distribution across a normal screen:

```text
85–90%  white and neutral surfaces
8–12%   black structure, text, and primary actions
2–4%    purple accents
```

The holographic logo treatment is a brand and marketing finish. Product headers should normally use a monochrome wordmark. Do not reproduce the holographic gradient across buttons, inputs, cards, navigation, or operational states.

## Token architecture

Keep raw values and semantic intent separate:

```text
Primitive token → semantic token → component property
purple/500     → color/accent → tertiary-link/foreground
```

Components must consume semantic tokens. They must not bind directly to primitive palette steps. This lets the palette evolve without rewriting component APIs.

### Color primitives

| Token | Value | Purpose |
|---|---:|---|
| `neutral/0` | `#FFFFFF` | White surface and inverse foreground |
| `neutral/50` | `#F7F7F5` | App background |
| `neutral/200` | `#E3E3DF` | Default border and divider |
| `neutral/600` | `#686864` | Muted foreground |
| `neutral/950` | `#181817` | Primary foreground and action |
| `purple/50` | `#F1EEFF` | Subtle accent background |
| `purple/300` | `#B8ACFF` | Accent foreground on dark surfaces |
| `purple/500` | `#6C4DFF` | Secondary accent and focus |
| `purple/600` | `#5638E8` | Accent hover or pressed state |
| `amber/500` | `#F5A800` | Rating and warm highlight; use dark foreground |

### Semantic colors

| Token | Alias/value | Usage |
|---|---|---|
| `color/background` | `neutral/50` | Page background |
| `color/surface` | `neutral/0` | Cards, sheets, inputs, and bars |
| `color/foreground` | `neutral/950` | Primary text and icons |
| `color/foreground-muted` | `neutral/600` | Supporting text |
| `color/foreground-inverse` | `neutral/0` | Content over black |
| `color/border` | `neutral/200` | Default boundaries |
| `color/action-primary` | `neutral/950` | Primary button background |
| `color/action-primary-foreground` | `neutral/0` | Primary button content |
| `color/action-secondary` | `neutral/0` | Secondary button background |
| `color/action-secondary-foreground` | `neutral/950` | Secondary button content |
| `color/accent` | `purple/500` | Tertiary links and small details |
| `color/accent-hover` | `purple/600` | Hovered or pressed accent |
| `color/accent-subtle` | `purple/50` | Rare subtle accent surface |
| `color/accent-on-dark` | `purple/300` | Small accent over dark surfaces |
| `color/focus` | `purple/500` | Keyboard focus ring |
| `color/rating` | `amber/500` | Rating star or score highlight |

`purple/500` on white has a contrast ratio of approximately `5.07:1`, so it is suitable for normal-size link text. Do not use the base purple for small text on black; use `color/accent-on-dark` instead.

### Status colors

Status colors are independent from the brand accent. Always pair color with a label, icon, or other non-color cue.

| Status | Foreground | Background | Approx. contrast |
|---|---:|---:|---:|
| Success | `#067647` | `#ECFDF3` | `5.40:1` |
| Warning | `#B54708` | `#FFFAEB` | `5.20:1` |
| Danger | `#B42318` | `#FEF3F2` | `6.05:1` |
| Information | `#175CD3` | `#EFF8FF` | `5.57:1` |

Do not use purple for held, pending review, confirmed, rejected, cancelled, or payment states merely because it is the brand accent. Map those states to their actual operational meaning.

## Typography

Use Geist Sans as the product typeface and Geist Mono only for codes, identifiers, timestamps where alignment matters, or developer-facing content. Geist is available under the SIL Open Font License.

```text
font/sans: "Geist", Arial, Helvetica, sans-serif
font/mono: "Geist Mono", "SFMono-Regular", Consolas, monospace
```

The initial type styles are:

| Token | Size / line height | Weight | Usage |
|---|---:|---:|---|
| `text/caption` | `12 / 16` | 400 | Metadata and nonessential supporting copy |
| `text/body-sm` | `14 / 20` | 400 | Secondary body copy |
| `text/body` | `16 / 24` | 400 | Default body and input text |
| `text/body-lg` | `18 / 28` | 400 | Introductory copy |
| `text/title-sm` | `20 / 28` | 600 | Card or section heading |
| `text/title-md` | `24 / 32` | 600 | Screen heading |
| `text/title-lg` | `32 / 38` | 700 | Public profile or major page title |
| `text/button` | `14 / 20` | 600 | Buttons and compact actions |

Use weights 400, 500, 600, and 700. Avoid lighter weights for functional UI. Do not use functional text below 12 px. Inputs use at least 16 px body text.

## Spacing

Use a 4 px base rhythm with a 2 px exception for optical corrections and hairline relationships.

| Token | Value |
|---|---:|
| `space/0` | `0` |
| `space/0.5` | `2px` |
| `space/1` | `4px` |
| `space/2` | `8px` |
| `space/3` | `12px` |
| `space/4` | `16px` |
| `space/5` | `20px` |
| `space/6` | `24px` |
| `space/8` | `32px` |
| `space/10` | `40px` |
| `space/12` | `48px` |
| `space/16` | `64px` |

Default conventions:

- Related icon and text: 8 px.
- Compact control content: 8–12 px.
- Control horizontal padding: 16 px.
- Card padding: 16 px; use 20 or 24 px only for larger content cards.
- Screen-section separation: 24–32 px.
- Mobile page gutter: 16 px.
- Tablet page gutter: 24 px.
- Desktop page gutter: 32 px.

## Radius

| Token | Value | Usage |
|---|---:|---|
| `radius/none` | `0` | Flush boundaries and dividers |
| `radius/sm` | `8px` | Compact controls |
| `radius/md` | `12px` | Buttons and inputs |
| `radius/lg` | `16px` | Cards |
| `radius/xl` | `24px` | Sheets, prominent panels, and mobile content surfaces |
| `radius/full` | `9999px` | Badges, chips, and circular controls |

Rounded geometry should communicate grouping and touchability. Do not apply a large radius to every container.

## Shadows and elevation

| Token | Value | Usage |
|---|---|---|
| `shadow/none` | `none` | Default flat surfaces |
| `shadow/sm` | `0 1px 2px rgb(0 0 0 / 0.06)` | Slight separation |
| `shadow/md` | `0 4px 12px -2px rgb(0 0 0 / 0.10)` | Menus and floating controls |
| `shadow/lg` | `0 12px 28px -8px rgb(0 0 0 / 0.18)` | Dialogs and sheets |
| `shadow/sticky` | `0 -6px 20px -8px rgb(0 0 0 / 0.16)` | Bottom sticky action bar |

Prefer surface color and borders over shadows for ordinary cards. A focus ring is not elevation and must never be implemented through the shadow scale.

## Borders

The default boundary is `1px solid color/border`. Inputs, cards, separators, and ordinary dividers use this rule unless a component requirement establishes a meaningful alternative. Keyboard focus uses its separate `2px solid color/focus` indicator with a 2 px offset; it is not a thicker border or an elevation effect.

Do not add multiple decorative border strengths prematurely. Status and selection must use semantic content and accessible cues instead of relying only on border color or width.

## Responsive layout and breakpoints

Use Tailwind's mobile-first breakpoints without adding device-specific breakpoints prematurely:

| Token | Minimum width | Product behavior |
|---|---:|---|
| Base | `0` | One column, 16 px gutter, sticky primary actions when useful |
| `sm` | `640px` | Density and gutter adjustments; usually no structural fork |
| `md` | `768px` | Medium layout; introduce a second column when it improves the task |
| `lg` | `1024px` | Expanded layout; map/list or schedule/detail may coexist |
| `xl` | `1280px` | Centered wide content and operational workspaces |
| `2xl` | `1536px` | Extra canvas, not a requirement for core flows |

Think in three behavioral regimes:

```text
Compact:  < 768px
Medium:   768–1023px
Expanded: ≥ 1024px
```

Do not hide required information only because the viewport is compact. Reflow, collapse, or disclose it progressively. The public booking journey must remain complete on a normal mobile browser.

## Initial component set

The first shared component layer contains `Button`, `IconButton`, `Field`, `Badge`, and `Container`. Add higher-level components only when the core flows establish their real requirements.

### Button

Variants:

- `primary`: black background and white content. The main action in a region.
- `secondary`: white background, black foreground, visible border.
- `ghost`: transparent background and black foreground.
- `destructive`: semantic danger styling for destructive actions only.
- `link`: purple text for tertiary actions such as “Ver más.”

Sizes:

- Default: minimum 44 px high.
- Large: 52 px high.
- Icon-only: minimum 44 × 44 px.

Required states are default, hover, focus-visible, pressed, disabled, and loading. Loading must preserve the button's dimensions. Avoid placing more than one primary button in the same action group.

When `asChild` renders a non-native control, disabled and loading states must expose `aria-disabled`, leave the sequential focus order, and prevent activation. ARIA alone does not implement disabled behavior.

### Field and Input

`Input` is the control; `Field` composes its label, control, description, and error message. Product flows should normally use `Field` so accessible naming and error association are not reimplemented per screen.

- Control height: 48 px minimum.
- Horizontal padding: 16 px.
- Radius: `radius/md`.
- Text: `text/body`.
- Label: 14/20, weight 500 or 600.
- Helper and error text: 12/16 minimum.
- Required states: default, hover, focus-visible, invalid, disabled, and read-only.

Do not rely on placeholder text as the label. An invalid field needs a visible message and programmatic association with that message.

Use `Field` as the normal product-level composition. It generates the control ID when needed, connects the label with `htmlFor`, and merges description and error IDs into `aria-describedby`. An error also marks the control with `aria-invalid`.

```tsx
<Field
  label="Nombre del cliente"
  description="Así aparecerá en la agenda."
  error={errors.name}
  required
>
  <Input name="name" />
</Field>
```

`Input` and `Textarea` retain their native element props. Features own validation timing and messages; the primitives only provide consistent presentation and accessible association.

### Badge

Badges are compact, non-interactive labels.

- Height: 24 or 28 px.
- Text: 12/16, weight 600.
- Radius: `radius/full`.
- Variants: neutral, success, warning, danger, and information.
- An accent badge is allowed only for rare brand or discovery emphasis.

If a badge can be clicked, filtered, removed, or selected, it is a `Chip` or button and must expose a minimum 44 px target.

### Container

Use a shared container to keep gutters and maximum widths consistent:

| Variant | Maximum width | Intended use |
|---|---:|---|
| `form` | `640px` | Booking steps, policies, and settings forms |
| `content` | `960px` | Profiles, lists, and normal product pages |
| `wide` | `1280px` | Marketplace and operational workspaces |
| `full` | none | Maps, schedule canvases, and intentionally edge-to-edge content |

All variants are full width below their maximum and use the responsive gutters defined above.

## Accessibility defaults

Accessibility is the baseline, not a later polish pass.

- Use a 44 × 44 px minimum target for buttons, icon buttons, chips, and other standalone controls. This is intentionally stricter than WCAG 2.2 AA's 24 × 24 CSS px minimum and aligns with the common mobile recommendation.
- Normal text must reach at least `4.5:1` contrast. Large text may use `3:1`. Essential icons, component boundaries, and focus indicators must reach at least `3:1` against adjacent colors.
- Use `2px solid color/focus` with a 2 px offset for the default keyboard focus indicator. Never remove focus without providing an equivalent visible replacement.
- Sticky headers, bottom bars, dialogs, and sheets must not obscure the focused element.
- Do not communicate status, selection, availability, or errors through color alone. Pair color with text, shape, iconography, or position.
- Keyboard navigation order follows the visual and reading order. All actions must expose an accessible name.
- Support text zoom to 200% without lost content or functionality. Avoid fixed-height text containers.
- Respect `prefers-reduced-motion`; remove nonessential translation, scale, parallax, and repeated animation.
- Disabled controls are not a substitute for explaining why an action is unavailable. Prefer helpful visible guidance where possible.

## Free reference resources

- [WCAG 2.2](https://www.w3.org/TR/WCAG22/) for contrast, focus, resizing, and target-size requirements.
- [Apple accessibility guidance](https://developer.apple.com/design/human-interface-guidelines/accessibility) for comfortable mobile control sizing.
- [Radix Colors](https://www.radix-ui.com/colors/docs/palette-composition/understanding-the-scale) for accessible scale anatomy and light/dark palette roles.
- [Geist](https://vercel.com/font) for the open-licensed product typeface.
- [Tailwind responsive design](https://tailwindcss.com/docs/responsive-design) for the implementation breakpoints.
- [Tailwind shadow scale](https://tailwindcss.com/docs/box-shadow) for a compatible elevation baseline.
- [shadcn/ui](https://ui.shadcn.com/docs) as an open-code component reference; Gotchu still owns its component API and visual language.

## Change discipline

- Add tokens only when a real reusable distinction exists.
- Do not introduce an additional brand color to solve a component-local problem.
- Changes to a semantic token require checking every component that consumes it.
- New component variants must correspond to a product behavior or state, not a one-off visual preference.
- Update this document when the durable visual contract changes.
