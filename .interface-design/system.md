# Etak — Design System

Established: 2026-04-12

---

## Direction and Feel

**Etak is a wayfinding instrument for product teams.** The interface should feel like a navigator's chart room — precise, considered, quiet authority. Not a cockpit (too many dials). Not a map app (too literal). A space where someone with deep expertise reads the environment and makes consequential decisions.

**The feel:** The weight of a well-made instrument. A sextant, not a smartphone compass. Calm density — information-rich without feeling crowded. The kind of tool where you notice the craft only when you pick up something cheaper.

**Temperature:** Cool-warm. The ocean palette is cool, but sand prevents clinical coldness. Think of brass instruments on a mahogany chart table — precision with warmth.

**What this is not:** Fast. Bright. Playful. Energetic. Dashboard-template. Generic SaaS. The moment it looks like it could be "any product tool," it has failed.

---

## Domain Exploration

**Concepts from Etak's world:**
- Bearing — orientation relative to a reference point, not a fixed map
- Landfall — the moment when navigated effort resolves into arrival
- Star house — one of 32 positions on the horizon where a celestial body rises or sets
- Reference island — the invisible third point that the navigator tracks to measure progress
- Swell pattern — reading subtle environmental signals that most people don't see
- Dead reckoning — maintaining position through accumulated observation, not GPS
- Horizon — the boundary between known and unknown; the line you navigate toward

**Color world:**
- Deep Pacific at night — near-black with blue undertone (`#0D1B2A`)
- Open ocean under clear sky — serious, institutional navy (`#1B4F72`)
- Reef shallows where depth becomes visible — teal-green (`#148F77`)
- Coral sand on an atoll beach — warm against the ocean palette (`#F5E6C8`)
- Starlight on water — white with the faintest warmth
- Volcanic basalt — warm dark gray for secondary surfaces

**Signature element:** The reference island — a persistent, fixed anchor point that orients all other information. In the UI, this manifests as the customer problem acting as a gravitational center. Structurally: key reference entities (problems, outcomes) feel visually anchored and stable, while work items (experiments, features, assumptions) feel positioned relative to them. The hierarchy is not equal — some things are fixed points, others orbit.

**Defaults rejected:**
- Equal-weight card grids → Asymmetric layouts with clear gravitational hierarchy
- Sidebar-as-different-color → Sidebar shares canvas background, separated by quiet border
- Purple/blue SaaS gradients → Navy-teal with sand warmth, no gradients
- Inter/system font → Deliberate typeface choice that carries editorial weight
- Rounded-friendly everything → Sharp-to-moderate radius expressing precision

---

## Depth Strategy

**Borders-only with surface tinting.** No drop shadows. This is a precision tool — shadows suggest physicality and consumer friendliness. Borders + subtle surface elevation shifts express the chart-room aesthetic: clean edges, layered information, instrument-grade clarity.

Higher elevation surfaces shift slightly lighter (light mode) or slightly lighter (dark mode). Jumps are whisper-quiet — 1-2% lightness shifts between levels.

---

## Color Palette

### Primitives

| Token | Value | Role |
|-------|-------|------|
| `--ocean` | `#1B4F72` | Brand primary. Navigation chrome, primary actions, selected states. |
| `--teal` | `#148F77` | Brand accent. Active states, secondary emphasis, success-adjacent. |
| `--sand` | `#F5E6C8` | Warm neutral. Subtle backgrounds, warmth injection, hover tints. |
| `--deep` | `#0D1B2A` | Near-black. Primary text, headings, maximum contrast. |
| `--white` | `#FFFFFF` | Primary background. |

### Semantic Extensions (to be refined during component development)

| Token | Derived from | Role |
|-------|-------------|------|
| `--destructive` | Desaturated red, warm-shifted | Danger, delete, irreversible |
| `--warning` | Desaturated amber | Caution, attention needed |
| `--success` | Teal-shifted | Confirmation, completion |
| `--info` | Ocean-shifted | Informational, neutral emphasis |

### Text Hierarchy

| Token | Value | Role |
|-------|-------|------|
| `--text-primary` | `#0D1B2A` | Default body text, headings |
| `--text-secondary` | `#0D1B2A` at 72% opacity | Supporting text, descriptions |
| `--text-tertiary` | `#0D1B2A` at 50% opacity | Metadata, timestamps, labels |
| `--text-muted` | `#0D1B2A` at 35% opacity | Disabled, placeholder |

### Surface Elevation (Light Mode)

| Level | Token | Value | Use |
|-------|-------|-------|-----|
| 0 | `--surface-base` | `#FFFFFF` | Page canvas |
| 1 | `--surface-raised` | `#FAFBFC` | Cards, panels, sidebar |
| 2 | `--surface-overlay` | `#F6F8FA` | Dropdowns, popovers, tooltips |
| 3 | `--surface-sunken` | `#F0F2F5` | Input backgrounds, inset areas |

### Border Progression

| Token | Value | Role |
|-------|-------|------|
| `--border-subtle` | `#0D1B2A` at 6% opacity | Soft separation — between related items |
| `--border-default` | `#0D1B2A` at 12% opacity | Standard — cards, panels, sidebar edge |
| `--border-emphasis` | `#0D1B2A` at 20% opacity | Strong — section dividers, active containers |
| `--border-focus` | `--ocean` at 60% opacity | Focus rings — keyboard navigation |

### Palette Constraints

- No bright primaries. No gradients. No neon. No glow effects.
- Navy-to-teal range is the identity. Sand provides warmth. That's the whole story.
- Color communicates meaning — never decorative. One accent (teal) used with intention.
- All color pairs must pass WCAG AA. Body text on primary backgrounds must pass AAA.

---

## Typography

### Direction: Geometric sans-serif (proposed, pending font selection)

The wordmark direction from the brief suggests two paths. For the UI, a geometric sans-serif in the ABC Diatype / Neue Haas Grotesk register — precise without being cold, contemporary without being trendy. NOT Inter (too ubiquitous). NOT Futura (too retro-institutional). NOT rounded faces (too consumer).

**Pending decision:** Specific typeface. This should be selected alongside the brand mark work. For now, the system defines the scale and weights; the face will be applied when chosen.

### Type Scale

Base: 14px (dense tool — not 16px consumer default)

| Level | Size | Weight | Tracking | Use |
|-------|------|--------|----------|-----|
| Display | 28px | 600 | -0.02em | Page titles, major headings |
| Heading | 20px | 600 | -0.01em | Section headings |
| Subheading | 16px | 500 | 0 | Card titles, group labels |
| Body | 14px | 400 | 0 | Default text |
| Label | 12px | 500 | 0.02em | Form labels, column headers, metadata |
| Caption | 11px | 400 | 0.02em | Timestamps, helper text, footnotes |
| Data | 14px mono | 400 | 0 | Numbers, IDs, code. Tabular figures. |

### Typography Principles

- Headlines: weight + tight tracking for presence
- Body: comfortable weight, neutral tracking for readability
- Labels: medium weight, slight positive tracking for legibility at small size
- Data: monospace with tabular-nums for column alignment
- Do not rely on size alone — combine size, weight, and letter-spacing

---

## Spacing

**Base unit:** 4px

| Token | Value | Use |
|-------|-------|-----|
| `--space-1` | 4px | Micro — icon-to-label gap, inline spacing |
| `--space-2` | 8px | Tight — related element padding, compact lists |
| `--space-3` | 12px | Component — button padding, input padding, card internal |
| `--space-4` | 16px | Section — between groups within a card |
| `--space-5` | 20px | Card padding — standard container inset |
| `--space-6` | 24px | Group — between cards or distinct sections |
| `--space-8` | 32px | Major — between page sections |
| `--space-10` | 40px | Page — top/bottom page margins |
| `--space-12` | 48px | Maximum — hero spacing, major separation |

---

## Border Radius

**Sharp-to-moderate.** This is a precision tool, not a consumer app.

| Token | Value | Use |
|-------|-------|-----|
| `--radius-sm` | 4px | Inputs, buttons, badges, tags |
| `--radius-md` | 6px | Cards, panels, dropdowns |
| `--radius-lg` | 8px | Modals, dialogs, large containers |
| `--radius-full` | 9999px | Avatars, status dots only |

No large-radius-on-small-elements. No pill-shaped buttons. Radius expresses precision.

---

## Layout Principles

### Gravitational Hierarchy

Not all elements are equal. The Etak concept is built on the idea that some things are reference points (fixed, dominant) and other things are positioned relative to them. In the UI:

- **Reference entities** (customer problems, outcomes, key hypotheses) — visually anchored, dominant weight, stable position
- **Work items** (experiments, features, assumptions, tasks) — lighter weight, positioned relative to reference entities, may change position as understanding evolves
- **Metadata** (timestamps, authors, status) — tertiary, never competes with the entity hierarchy

This means: asymmetric layouts. The "fixed point" takes more visual weight. Cards are not equal-weight grids unless the content genuinely is equal.

### Navigation

Sidebar shares the canvas background. Separated by a quiet `--border-default` border, not a different color. The sidebar is part of the space, not a separate world.

Active navigation states use `--ocean` text or a subtle `--ocean` at 8% opacity background tint — not a heavy highlight bar.

### Density

This is a tool for professionals. Default to moderate-high density. Whitespace is intentional, not generous-by-default. Every pixel of space either aids comprehension or is wasted.

---

## Iconography

One icon set (to be selected — Lucide is the likely choice given shadcn/ui). Icons clarify, never decorate. If removing an icon loses no meaning, remove it.

Standalone icons get subtle background containers for presence. Inline icons match text color and size.

---

## Animation

Fast micro-interactions only. 120ms-150ms for hover/focus transitions. 200ms for panel open/close. Deceleration easing (`cubic-bezier(0.16, 1, 0.3, 1)`). No spring/bounce — this is a professional instrument, not a toy.

Respect `prefers-reduced-motion` — reduce to instant or opacity-only transitions.

---

## Component Patterns

*To be populated as components are built. Patterns are added when used 2+ times or when they establish a reusable convention.*

---

## Dark Mode Notes

*To be designed when the light mode foundation is established. Key considerations:*
- Shadows become less visible — lean harder on borders
- Semantic colors need slight desaturation
- Surface elevation inverts: higher = slightly lighter
- The ocean/teal/sand palette may need adjusted values for sufficient contrast on dark surfaces
