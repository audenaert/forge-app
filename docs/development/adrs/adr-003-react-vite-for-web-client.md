---
name: "ADR-003: Use React + Vite for the web client"
type: adr
status: accepted
for: etak-web-client
superseded_by: null
---

## Context

Etak is a discovery and development workspace built around a typed knowledge graph (the Opportunity Solution Tree and its development extensions) and AI agents that work alongside human collaborators. The web client is the primary human interface to that graph. This ADR chooses the foundation it lives on.

The decision is concerned with the long arc of the client, not the first feature shipped on top of it. The first project on this stack is a read-only discovery explorer (see `projects/discovery-explorer-ui.md`), but the foundation has to carry the client through several phases:

1. **Read-focused exploration** (the current project) — the graph exists, no one can see it. The first job is to render artifact pages, navigate via typed relationships, and project hierarchical slices like the OST tree. Single-user, no real-time, no editing.
2. **Mixed-initiative editing** — humans and AI agents propose, review, and accept changes to the graph. Each artifact type gets its own interactions and its own backend tools; the UI grows per-type editing surfaces, review/triage flows for AI proposals, and provenance affordances.
3. **Collaborative canvas** — the long-term vision in `forge-workspace-proposal.md`: a spatial canvas with pan/zoom, direct manipulation of nodes, multiple users and agents on the same surface, and real-time sync via WebSocket or CRDT.

The right foundation suits *all three*, not just the first. A choice that's optimal for read-only exploration but fights us in phases 2 and 3 is the wrong choice.

Key characteristics that hold across all phases:

- **Client-heavy rendering** — even in the read-only phase, the client renders trees, hypertext pages, and dense detail panels. Later phases add canvases, drag/drop, and spatial layout. The compute lives in the browser.
- **Authenticated tool, no SEO** — Etak is not a public marketing site. Server-side rendering buys nothing. First-byte time matters less than client-side responsiveness.
- **No need for a server/client component split** — the client talks to a separate `apps/api` service over GraphQL (and eventually WebSocket/CRDT). There is no rendering layer to push to the server, and no benefit to introducing one.
- **Real-time sync, eventually** — phases 2 and 3 will use WebSockets and/or CRDT libraries that don't fit cleanly into a request/response framework's data-fetching conventions.

## Decision

Use **React with Vite** as the web client framework and build tool. The app lives at `apps/web` in the monorepo.

The same React + Vite foundation carries the client through read-only exploration, mixed-initiative editing, and the collaborative canvas. Routing, state, and sync layers will be added incrementally as each phase requires them, without changing the underlying foundation.

## Alternatives Considered

### Option A: React + Vite (selected)

**Pros:**
- Fast dev server and HMR; minimal build configuration
- No opinion on routing, data fetching, or state — we choose what fits each phase
- Single mental model: everything runs in the browser, no server/client component boundary
- Lighter build output and faster cold starts than a full-stack framework
- Well-suited to dense, interactive client-side applications at every phase
- Large ecosystem of canvas, WebSocket, and CRDT libraries; none of them have to fight framework conventions
- Used widely as the foundation for collaborative graph and canvas tools (Tldraw, Excalidraw, Linear's web client)

**Cons:**
- No built-in routing or API layer — must assemble these as the app grows
- No file-based routing convention out of the box
- Dev/prod parity requires care for environment variables and build-time config

### Option B: Next.js (App Router)

**Pros:**
- Built-in file-based routing, SSR/SSG, API routes, middleware
- Strong conventions reduce bikeshedding
- Good fit for content-heavy or mixed static/dynamic apps

**Cons:**
- The App Router introduces a server/client component boundary (`"use client"`, hydration boundaries, server actions) that adds complexity at every layer of the component tree without delivering benefit for a fully client-side workspace tool
- Server rendering and incremental static regeneration are wasted on an authenticated, client-heavy app
- Framework opinions (server components as default, fetch caching, the App Router data lifecycle) actively work against a WebSocket/CRDT-driven architecture
- Heavier runtime, slower dev server, more build complexity

**Why not:** The strengths of Next.js — server rendering, file-based routing, ISR, server actions — apply to apps Etak is not. The friction of the server/client split would compound at every phase of the client's growth, especially as we add real-time sync and a spatial canvas.

### Option C: Remix / React Router framework mode

Similar trade-offs to Next.js: framework opinions about routing and data loading optimized for content-heavy apps rather than client-heavy ones. Same "wasted SSR" objection. Not a meaningful improvement over React + Vite for this use case.

### Option D: SolidJS, Svelte, or another non-React framework

Smaller bundles and arguably better fine-grained reactivity. Rejected because the React ecosystem is where the libraries we will need live: shadcn/ui, Apollo Client, TanStack Router/Query, react-flow / xyflow, tldraw, Yjs bindings, react-markdown. Switching framework families would force us to reimplement or give up most of those choices.

## Consequences

### Positive

- Simpler architecture at every phase — no server/client boundary to reason about in component code
- Full control over the rendering pipeline, important for canvas performance tuning later
- Faster builds and dev server startup throughout the lifetime of the client
- Real-time sync (WebSocket, CRDT) integrates naturally without fighting framework conventions
- The same foundation carries the client from read-only explorer to collaborative canvas — no rewrite at phase boundaries
- Per-artifact-type editing surfaces in the mixed-initiative phase can be implemented as ordinary React components without framework ceremony

### Negative

- Routing, data loading, and state management decisions must be made explicitly rather than inherited from a framework. Each addition is a deliberate choice.
- No built-in API layer — the server lives in `apps/api` as a separate workspace. Acceptable: the API serves multiple clients (CLI, web, eventually agents) and doesn't belong inside the web build.
- More moving pieces to assemble at the start; the simplicity benefit accrues later.

### Follow-up decisions

These are deliberately *not* part of this ADR. They will be made in their own ADRs or specs as each phase needs them:

- **Routing library** — selected per project (the discovery explorer spec picks TanStack Router)
- **GraphQL client and codegen** — selected per project (the discovery explorer spec picks Apollo Client + graphql-codegen)
- **Styling and component library** — selected per project (Tailwind v4 + shadcn/ui in the discovery explorer)
- **State management for editing and collaboration** — to be decided in the mixed-initiative phase
- **Real-time sync transport** — WebSocket vs. CRDT (Yjs / Automerge) — to be decided when phase 3 begins
- **Canvas rendering library** — react-flow / xyflow / tldraw / custom — to be decided when the canvas phase begins
