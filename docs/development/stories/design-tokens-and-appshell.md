---
name: "Design tokens and AppShell"
type: story
status: blocked
parent: discovery-explorer
workstream: web-client
milestone: m1-web-discovery-explorer
phase: M1a
depends_on:
  - scaffold-apps-web
acceptance_criteria:
  - "apps/web/src/styles/app.css defines the Etak @theme tokens exactly as specified in the spec: ocean, teal, sand, deep, surface-base/raised/overlay/sunken, semantic warning/success/destructive/info, and radius sm/md/lg"
  - "Opacity-derived border tokens (--border-subtle/default/emphasis/focus) and text hierarchy tokens (--text-primary/secondary/tertiary/muted) are defined on :root using color-mix()"
  - "Body base font-size is 14px; font-family is a system-font stack placeholder (e.g., ui-sans-serif, system-ui, -apple-system, Segoe UI, Roboto, ...) — real typeface selection is deferred"
  - "A <AppShell> component in apps/web/src/components/layout/AppShell.tsx renders a two-region layout: fixed-width sidebar on the left, main content area on the right, separated by --border-default"
  - "A <Sidebar> component renders navigation links (Discover, Gaps) with active-state styling using ocean text + subtle background tint; hover states follow the design system"
  - "An <EmptyState> component exists in apps/web/src/components/layout/EmptyState.tsx and accepts title + description + optional action slots"
  - "prefers-reduced-motion is respected: a global rule in app.css reduces transitions to instant when the user prefers reduced motion"
  - "Sidebar nav uses <nav> with role and aria-current on the active link; keyboard focus is visible via --border-focus outline"
  - "A placeholder route at '/' renders the AppShell with an EmptyState in the main area so the shell can be visually verified"
  - "Vitest component tests verify AppShell renders sidebar + main, Sidebar applies aria-current on the active route, and EmptyState renders its props"
---

## Description

Implement the Etak design tokens as Tailwind v4 `@theme` entries and build the `AppShell` + `Sidebar` + `EmptyState` layout primitives. This gives every subsequent story a themed shell to mount into.

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — sections "Design token implementation", "Layout: AppShell". Tokens block is copy-paste ready.
- Design system: `.interface-design/system.md` (read it) — ocean/teal/sand/deep palette, borders-only depth strategy, 4px spacing base, sharp-to-moderate radius, 120-150ms micro-interactions, gravitational hierarchy.
- System-font stack is the placeholder — do NOT install Inter or any webfont. Typeface is explicitly deferred.
- Do not build dashboard content, tree views, or data loading here. This is shell + tokens only.
- Sidebar background shares the canvas color and is separated by border, not by a different surface fill.
