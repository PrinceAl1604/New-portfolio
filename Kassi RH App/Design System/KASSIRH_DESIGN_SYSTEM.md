# kassirh — Design System

**v0.1 · Foundations.** The first design system for kassirh, generated from the Figma
token export (`design-tokens.tokens.json`). Architecture is **Fluent 2 semantic roles**
re-skinned to the kassirh brand: **Zinc neutrals, a `#f76626` primary, Manrope type**,
with light and dark themes.

Live style guide: **`Design System/index.html`** — serve the app folder and open it.
Every swatch on that page reads a live CSS variable, so the page is always the source
of truth.

```bash
cd "Kassi RH App" && python3 -m http.server 5174
# → http://localhost:5174/Design%20System/index.html
```

Regenerate `tokens.css` after the Figma export changes:

```bash
cd "Kassi RH App/Design System"
node gen-tokens.js ../design-tokens.tokens.json tokens.css /tmp/tokens-summary.json
```

---

## File layout

| File | Role | Edit by hand? |
|---|---|---|
| `tokens.css` | Raw tokens: primitive palettes, semantic color roles, radius, elevation, type scale. **Generated** from the Figma export. | No — regenerate with `gen-tokens.js` (below) |
| `theme.css` | Ergonomic **alias layer** components consume (`--bg`, `--fg`, `--brand`, …) + **dark mode** + `.kx-*` type classes. | Yes |
| `components.css` | Base component library, built only on `theme.css` aliases. | Yes |
| `guide.css` / `index.html` / `system.js` | The living style guide (page shell, demos, live-swatch renderer, theme toggle). | Yes |
| `logo/` | Brand assets: `logo.svg` (primary), `logo-white.svg`, `symbol-orange/navy/white.svg`. | No — source of truth |
| `icons.js` | Fluent UI System Icons (Regular, 16px) registry + `kxIcon()` / `kxHydrateIcons()`. | Yes — add glyphs as needed |

**The rule:** components reference `theme.css` aliases only. Aliases reference `tokens.css`.
No component ever hardcodes a hex value.

---

## 1 · Foundations

### Logo & brand
The kassirh mark is an **orange symbol** (a stylised *k* with a dot) plus the **wordmark in
brand navy `#11163A`**. Assets in `logo/`:

| Asset | Use |
|---|---|
| `logo.svg` | Primary logo (orange symbol + navy wordmark) — on light backgrounds |
| `logo-white.svg` | White wordmark — on orange/navy/dark backgrounds |
| `symbol-orange.svg` | Symbol alone — avatars, favicons, tight spaces |
| `symbol-navy.svg` | Symbol on light/peach where orange is too loud |
| `symbol-white.svg` | Symbol on the brand colours or dark surfaces |

Clear space ≥ the height of the symbol's dot. Never recolour, stretch or add effects.
The style guide header swaps `logo.svg` → `logo-white.svg` automatically in dark mode.

### Icons
**Fluent UI System Icons**, Regular weight, 16px (MIT — github.com/microsoft/fluentui-system-icons).
Paths live in `icons.js` recoloured to `currentColor`; components tint via CSS. Use a placeholder
`<span class="kx-icon" data-icon="info"></span>` (hydrated on load) or `kxIcon('info', 16)` in JS.
Registered so far: `info`, `error`, `success`, `warning`, `chevron_down`, `chevron_right`, `dismiss` — add
more to the registry as components need them.

### Color — primitive palettes
Eleven-step ramps (50 → 950). Raw values, never used directly by components.

| Family | 500 (base) | Notes |
|---|---|---|
| `--kx-primary-*` | `#f76626` | Brand orange |
| `--kx-grey-*` | `#71717a` | Zinc neutrals (`50 #fafafa` → `950 #0c0c0d`) |
| `--kx-red-*` | `#f04438` | Error |
| `--kx-green-*` | `#17b26a` | Success |
| `--kx-amber-*` | `#f79009` | Warning |
| `--kx-blue-*` | `#1570ef` | Info |
| plus `--kx-teal/yellow/pink-*`, `--kx-white`, `--kx-black` | | |

### Color — semantic roles (178 tokens)
Faithful to the Figma structure: `--kx-{group}-{background|foreground|border}-{n}-{state}`
for `neutral`, `primary`, `error`, `warning`, `success`. Components use the friendlier
`theme.css` aliases on top:

| Alias | Light | Role |
|---|---|---|
| `--bg` / `--bg-subtle` / `--bg-muted` | white / `#fafafa` / `#fafafa` | Page & grouped surfaces |
| `--surface` / `--surface-hover` | white / `#fafafa` | Cards, popovers |
| `--fg` / `--fg-secondary` / `--fg-muted` / `--fg-subtle` | `#18181b` / `#3f3f46` / `#71717a` / `#a1a1aa` | Text hierarchy |
| `--border` / `--border-subtle` / `--border-strong` | `#d4d4d8` / `#e4e4e7` / `#a1a1aa` | Lines |
| `--brand` / `--brand-hover` / `--brand-subtle` / `--brand-fg` | `#f76626` / `#c6521e` / `#fef0e9` / brand-900 | Primary action |
| `--brand-navy` | `#11163A` (light) · `#c7cdf0` (dark) | Logo ink / navy accent — added in `theme.css`, not in the Figma export |
| `--danger` / `--warning` / `--success` / `--info` (+ `-subtle`, `-fg`) | red-600 / amber-500 / green-600 / blue-600 | Status |

**Dark mode** (`.dark`) remaps only the aliases; the raw `--kx-*` primitives stay fixed.
Surface hierarchy is preserved: `bg (grey-950) < bg-muted (grey-900) < surface (grey-900, raised)`.

### Typography
**Manrope**, nine-tier scale straight from the tokens. Use the `.kx-*` classes.

| Class | Size / line-height | Default weight |
|---|---|---|
| `.kx-h1` | 49 / 58.8 | Regular |
| `.kx-h2` | 39 / 46.8 | Regular |
| `.kx-h3` | 31 / 37.2 | Regular |
| `.kx-h4` | 25 / 30 | Regular |
| `.kx-headline` | 20 / 24 | Semibold |
| `.kx-body` | 16 / 19.2 | Regular |
| `.kx-subtitle` | 14 / 16.8 | Regular |
| `.kx-caption` | 12 / 14.4 | Regular |
| `.kx-footnote` | 10 / 12 | Medium |

Weights available: `--kx-fw-extralight 200 · light 300 · regular 400 · medium 500 · semibold 600 · bold 700`.

### Radius
`--r-xs 2 · --r-sm 4 · --r-md 8 · --r-lg 12 · --r-xl 20 · --r-full 999`.
Default surface radius is **md (8px)**.

### Elevation
Two-layer drop shadows: `--shadow-sm / -md / -lg / -xl` (from the Figma `shadow 02/08/16/28`
tokens; dark mode uses deeper opacities).

### Spacing
4-point scale: `--sp-1 4 · sp-2 8 · sp-3 12 · sp-4 16 · sp-5 20 · sp-6 24 · sp-8 32 · sp-10 40 · sp-12 48`.

---

## 2 · Component catalog (v0.1 starter set)

Built and shown in the style guide. Each is pure CSS on the alias layer.

- **Button** (Figma 4014:2315) — `.kx-btn` × variants `--primary / --secondary / --outline / --ghost / --destructive` (+ extensions `--subtle / --link`, alias `--danger`); sizes `--mini 24 / --sm 32 / (default) 36 / --lg 40`; `--round`, `--icon`, `--block`; Medium 14 label; hover/active/focus/disabled. **Button group** (Figma 4029:1566) — `.kx-btn-group` joins `.kx-btn` children (shared borders, outer corners only).
- **Text field** — `.kx-field` + `.kx-label` (`.kx-req`) + `.kx-input / .kx-textarea / .kx-select`, `.kx-input-group` (leading icon), `.kx-hint` (+ `--error`), `.is-error` / `:disabled`.
- **Selection** — `.kx-check` (checkbox; Figma 4040:4140 — states `--error`, `:disabled`, `input:indeterminate`; Figma 4040:4194 label Medium 14, gap 12), `.kx-check--radio`, `.kx-switch`, `.kx-slider` (range; Figma 4198:1279). **Rich checkbox** (Figma 4040:4246) — `.kx-check-card` selectable card (checkbox + `.kx-check-card__content` line1/line2), highlights on check, `--flip` for trailing checkbox.
- **Field layout** (Figma 4198:1267 vertical · 4198:1320 horizontal) — `.kx-field` wraps a `.kx-label` + any control. Vertical by default (label on top, 4px gap); `--horizontal` puts a 120px label column beside a `flex:1` control (`--top` aligns the label to the top for textarea / radio / checkbox). Radio & checkbox options stack in `.kx-field__group`.
- **Badge** (Figma 4014:1581) — chip with variants `--primary / --secondary / --outline / --ghost / --destructive`, shape `--round` (pill; default 8px), optional `.kx-badge__icon` (Fluent, left/right), and a variant-coloured `:focus-visible` ring for when it's a removable/interactive chip (`<button class="kx-badge …">`). SemiBold 12.
- **Status** (semantic pill · system extension) — `.kx-status` × `--brand / --success / --warning / --danger / --info / --outline` + `.kx-status__dot`. Badge also has `--dark` (Figma 4759:6019 shadcn default).
- **Rich / field checkbox** — `.kx-check-card` (selectable card) and `.kx-check-field` (checkbox + label + description, Figma 4122:1758). Passive state marker (Active, Expired, On trial) where colour is the meaning; used in the table. Distinct from Badge; will be reconciled if Figma ships a status/tag component.
- **Avatar** (Figma 4014:1237) — `.kx-avatar` × sizes `--xs / --sm / --md / --lg` (20/24/32/40) × shape (round default, `--square`); initials (Manrope Bold, `#18181b` on peach `primary-400`) or a photo `<img>`. **Avatar stack** (Figma 4014:1293) — `.kx-avatar-stack` wraps avatars with a white ring + −8px overlap; `.kx-avatar-stack__more` is the optional `+N` count chip.
- **Card** (Figma 4040:3527) — `.kx-card` (radius 8, subtle border, shadow-sm) with slots `__header` (`__title` Semibold 16 + `__sub` Regular 14) / `__body` / `__footer` (`--between` splits) / `__media` (full-bleed image); 24px padding, no dividers by default (`--divided` adds them).
- **Alert** (Figma 4010:1145) — subtle callout: `.kx-alert` (neutral default) × `--error` (Figma types) + `--success / --warning / --info` (extensions), `--flip` (icon trails). Structure: `.kx-alert__main` › `.kx-alert__icon` (Fluent) + `.kx-alert__content` (`.kx-alert__line1` Medium + optional `.kx-alert__line2` Regular) + optional `.kx-alert__action` button. White surface + subtle border; tone lives in text/icon, never a filled background.
- **Breadcrumb** (Figma 4014:3256) — `.kx-breadcrumb` (nav) › `.kx-breadcrumb__item` (ancestor links, Medium/muted) + `.kx-breadcrumb__sep` (Fluent `chevron_right`, 12px) + `.kx-breadcrumb__current` (`aria-current="page"`, SemiBold/darker). Scales to any depth.
- **Tabs & segments** — `.kx-tabs` + `.kx-tab.is-active`; `.kx-segment` + `.kx-segment__item.is-active`.
- **Accordion** (Figma `Accordion Trigger` 4009:883) — `.kx-accordion` (+ `data-single` for exclusive open) › `.kx-accordion__item(.is-open)` › `.kx-accordion__trigger` (`.kx-accordion__label` + `.kx-accordion__icon`) + `.kx-accordion__panel > div > .kx-accordion__panel-inner`. Behaviour wired in `system.js` (`aria-expanded`, chevron rotates 180°, panel animates via `grid-template-rows`). SemiBold 14 label · `neutral/foreground/2` · 16px vertical padding · `border-1/subtle` divider · Fluent `chevron_down` icon (rotates 180°) · **neutral `#d4d4d4` focus ring** per the Figma spec (note: differs from the brand-orange focus ring on buttons/inputs — unify if desired).
- **Dialog** (Figma 4014:971/973 + 4136:2060/2120/2121) — `.kx-dialog` (+ `--center`) › optional `.kx-dialog__header` (`.kx-dialog__title` Bold 20 + `.kx-dialog__desc` Medium 12) + body (`.kx-dialog__body` message, or a form/content slot) + `.kx-dialog__actions` (reuses `.kx-btn`) + optional `.kx-dialog__close` (Fluent dismiss, top-right). 24px padding, radius 12, shadow-lg. Standard = left text + inline right actions; `--center` = centered + stacked full-width. Modal via `.kx-dialog-overlay` + `data-open-dialog="#id"` / `data-close-dialog` (Esc + backdrop + X close), wired in `system.js`.
- **Table / datagrid** (Figma 4064:3065/3083/3101) — `.kx-table` (+ `--card`): `th.is-sortable` (`.kx-table__sort` + Fluent `arrow_sort`), `td.kx-table__check` (checkbox col), `tr.is-selected` (peach row), `.kx-table__name` (avatar+name), `.kx-table__actions` + `.kx-table__iconbtn` (Fluent `more_horizontal`). 36px rows.
- **Icon button** (Figma 4041:4356) — `.kx-btn--icon` × any variant / size / `--round` (square button that reuses the Button matrix).
- **Count / notification badge** (Figma 4759:6101) — `.kx-count` (+ `--secondary / --outline / --destructive`), 20px pill.
- **Flags** (Figma 4379:3810) — `.kx-flag` (24px round, `--rect`) holder; full ~250 set is an imported asset library.
- **Navigation** (Figma 4584:2552 sidebar · 4693:2276 topbar · 4690:2409 item · 4689:431 header · rail) — `.kx-sidebar` (+ `--dark`) with `.kx-sidebar__header / __section / __label / __footer`; `.kx-nav-item` (icon+label, `.is-active` = brand fill); `.kx-topbar` (`__left / __actions`); `.kx-rail` (64px app switcher, `.kx-rail__item / __logo`).
- **Feedback** — `.kx-progress`, `.kx-spinner`, `.kx-skeleton`, `.kx-tooltip` (Figma 4447:421 — dark `#27272a` bubble + directional arrow via `--top / --bottom / --left / --right`).

---

## 3 · Principles

1. **Tokens only.** No hex in components — `tokens.css` → `theme.css` alias → component. If you need a value that isn't a token, add the token first.
2. **Semantic over primitive.** Reach for `--brand` / `--fg-muted`, not `--kx-primary-500` / `--kx-grey-500`. Primitives exist so aliases can be defined once.
3. **One primary action per view.** The brand fill (`--brand`) is loud; everything else is secondary/ghost.
4. **Manrope, the scale, nothing off-ramp.** Use a `.kx-*` tier; don't invent sizes.
5. **Both themes, always.** New tokens get a `.dark` value; verify surface hierarchy holds (card must read as raised above the page).
6. **The style guide is the test.** Every component gets one visible story in `index.html`. If it's not on the page, it's not in the system.

---

## 4 · Adaptation table (Figma → kassirh)

| Figma token | kassirh output |
|---|---|
| `primary/primary color/500` `#f76626` | `--kx-primary-500` → `--brand` |
| `primary/grey/lightmode/*` (Zinc) | `--kx-grey-*` → surfaces, text, borders |
| `color/neutral/**` semantic roles | `--kx-neutral-*` → `--bg / --fg / --border` aliases |
| `color/{error,warning,success}/**` | `--kx-{red,amber,green}-*` → `--danger / --warning / --success` |
| `typography/{h1…footnote}` Manrope | `--kx-fs-* / --kx-lh-*` → `.kx-*` classes |
| `sizing tokens/radius/*` | `--kx-radius-*` → `--r-*` |
| `effect/elevation/{light,dark}/shadow NN` | `--kx-shadow-NN` → `--shadow-sm…xl` |

> Design tokens and structure are functional facts, reproduced faithfully. No proprietary
> brand assets are copied — Manrope is an open font loaded from Google Fonts.

---

## 5 · Adding a component from a Figma link

1. Read the node with the Figma MCP (`get_variable_defs` for its tokens, `get_design_context` for layout). Map its variables onto existing aliases — add new tokens to `tokens.css`/`theme.css` only if genuinely missing.
2. Author the component in `components.css` on the alias layer (no hex).
3. Add one story to `index.html` under **Components** and a sidebar link. **Write the section description as documentation, not build notes:** say what the component *is*, when to use it (and when not to), and how it behaves/interacts. Keep node IDs, pixel specs and token names out of the on-page prose — those live in this file and the catalog above.
4. Add a row to the catalog above.
5. Reload the style guide; check light **and** dark.
