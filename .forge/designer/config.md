---
name: Design Stack Configuration
type: design-config
initialized: 2026-04-12
last-updated: 2026-04-12
---

## Project Context

- **Product:** Etak — a product development platform for software teams
- **Type:** SaaS dashboard / enterprise tool
- **Framework:** React + Vite (planned), TypeScript strict mode
- **Styling:** Tailwind CSS (to be installed with web client)
- **Component library:** shadcn/ui + Radix UI (to be installed with web client)
- **Target audience:** Product managers, engineering leads, and product teams at software companies. They are making high-stakes decisions about what to build and need clarity, not speed.
- **WCAG target:** AA baseline, AAA for body text contrast

## Design Stack

### Layer 1: Creative Direction

- **Tool:** Interface Design (Dammyjay93)
- **Install:** `npx skills add Dammyjay93/interface-design -y`
- **Location:** `.agents/skills/interface-design/`
- **Role:** Persistent design memory. Saves all design decisions to `.interface-design/system.md`. Propose-and-confirm workflow — Claude proposes directions, user reviews and approves. Decisions compound across sessions.

### Layer 2: Systematic Quality

- **Tool:** shadcn/ui (Developer Kit)
- **Install:** `npx skills add giuseppe-trisciuoglio/developer-kit@shadcn-ui -y`
- **Location:** `.agents/skills/shadcn-ui/`
- **Role:** Correct implementation patterns for shadcn/ui + Radix + Tailwind. CSS variable theming, HSL color system, accessible primitives. Components are copied into the project and fully customizable.

### Layer 3: Accessibility

- **Tool:** AccessLint (4 skills: contrast-checker, link-purpose, refactor, use-of-color)
- **Install:** `npx skills add accesslint/claude-marketplace -y`
- **Location:** `.agents/skills/{contrast-checker,link-purpose,refactor,use-of-color}/`
- **Role:** Programmatic contrast verification for AA/AAA levels. Color pair analysis. Accessible link text. Color-alone information checks.

- **Tool:** Vercel Web Design Guidelines
- **Install:** `npx skills add vercel-labs/agent-skills@web-design-guidelines -y`
- **Location:** `.agents/skills/web-design-guidelines/`
- **Role:** 100+ testable rules covering focus states, ARIA, semantic HTML, typography, animation safety. Self-updating from live repository. Complements AccessLint's contrast focus with broader WCAG coverage.

### Layer 4: Polishing Pipeline

- **Tool:** Deferred — add when moving to production-quality component development
- **Planned:** baseline-ui, fixing-accessibility, fixing-motion-performance
- **Install (when ready):** `npx ui-skills add baseline-ui && npx ui-skills add fixing-accessibility && npx ui-skills add fixing-motion-performance`

### MCP Servers

- **Playwright:** Browser automation for visual QA — verify rendering, responsive layouts, interactive states
- **Context7:** Version-specific documentation for React, Tailwind, shadcn/ui, Radix

## Design Direction

- **Product name:** Etak
- **Aesthetic:** Mastery over speed. Craft and intelligence. Serious enterprise tool with depth that rewards discovery. The reference class is Linear, Figma, Notion, Vercel. Not fast, bright, or playful. Not a mapping product. Not a data dashboard.
- **Design lead:** Claude proposes, user reviews
- **Cross-session consistency:** Critical — this is a long-running product

### Brand Character (from design brief)

- Considered and expert, not energetic or urgent
- Respects the person using it — amplifies human judgment
- Feels designed rather than generated
- Depth that rewards discovery — the name has a story, the design should too
- Sits confidently alongside Linear/Figma/Notion while being distinctly its own

### Color Palette

| Token | Name | Hex | Role |
|-------|------|-----|------|
| `--color-ocean` | Ocean | `#1B4F72` | Primary — mark, dominant UI color |
| `--color-teal` | Teal | `#148F77` | Accent — active states, secondary elements |
| `--color-white` | White | `#FFFFFF` | Primary background |
| `--color-sand` | Sand | `#F5E6C8` | Warm neutral — light backgrounds, warmth |
| `--color-deep` | Deep | `#0D1B2A` | Near-black — body text, headings |

**Palette constraints:** No bright primaries. No gradients. No neon. Navy-to-teal range with sand warmth.

### Typography Direction

Two directions under consideration (not yet decided):
- **Direction A:** Geometric sans-serif (Inter register but not Inter — consider ABC Diatype, Neue Haas Grotesk). Medium-light weight, open letter-spacing (~0.15em for wordmark).
- **Direction B:** Transitional serif (Canela, Freight Display register). Moderate stroke contrast, editorial quality. More unexpected in the software space.

### What This Design Is Not

- A literal navigation or map product
- A maritime or travel brand
- A data analytics or dashboard aesthetic
- Gradients, glow effects, or drop shadows
- Playful, fast, or bright

## Conventions

- **Design specs:** `.forge/designer/specs/`
- **Component specs:** `.forge/designer/components/specs/`
- **Component index:** `.forge/designer/components/index.md`
- **Design reviews:** `.forge/designer/reviews/`
- **Design system:** `.interface-design/system.md` (managed by Interface Design skill)
- **Tokens:** Tailwind config + CSS variables (when web client is created)
- **Design stack config:** `.forge/designer/config.md` (this file)
