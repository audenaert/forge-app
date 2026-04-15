---
name: "Scaffold apps/web workspace"
type: story
status: complete
parent: discovery-explorer
workstream: web-client
milestone: m1-web-discovery-explorer
phase: M1a
acceptance_criteria:
  - "apps/web exists as an npm workspace with package.json name @forge-workspace/web and type: module"
  - "Vite 6.x, React 19.x, react-dom 19.x, and TypeScript are installed as dependencies/devDependencies"
  - "apps/web/tsconfig.json extends the repo's tsconfig.base.json in strict mode and includes the React JSX runtime"
  - "apps/web/index.html and apps/web/src/main.tsx exist; main.tsx renders a minimal <App /> component into #root"
  - "apps/web/vite.config.ts configures the @vitejs/plugin-react and @tailwindcss/vite plugins"
  - "Tailwind CSS v4 is installed; apps/web/src/styles/app.css imports tailwindcss and is imported from main.tsx"
  - "shadcn/ui is initialized via `npx shadcn@latest init` with style: new-york, base color: neutral, CSS variables enabled, and components.json committed under apps/web/"
  - "TanStack Router (@tanstack/react-router) is installed and apps/web/src/App.tsx wires a minimal router with a placeholder '/' route"
  - "Vitest + @testing-library/react are installed and a smoke test (renders <App /> without crashing) passes"
  - "turbo is installed as a root devDependency (the root package.json already references `turbo dev` / `turbo build` / `turbo lint` but the binary is not yet installed) and turbo.json exists at the repo root with dev, build, lint, test tasks configured; `npm run dev --workspace=apps/web` starts Vite on port 5173; `npm run dev` at the repo root launches apps/api and apps/web together via turbo"
  - "apps/web/.env.example documents VITE_API_URL and VITE_API_KEY placeholders; .env.local is gitignored"
  - "npm run build --workspace=apps/web produces a clean production bundle with no type errors"
---

## Description

Create the `apps/web` workspace as the home for the Etak web client. This story is the foundation every other web-client story builds on — it establishes the Vite + React 19 + TypeScript + Tailwind v4 + shadcn/ui + TanStack Router + Vitest stack described in the spec, wires the turborepo pipeline so `apps/api` and `apps/web` run together, and lands a minimal smoke-tested render.

No feature work, no design tokens beyond Tailwind defaults, no Apollo. Just the running shell.

## Context for the agent

- Spec: `docs/development/specs/web-ui-discovery-explorer.md` — sections "Application structure", "Tech stack", "Development workflow". Follow the file layout exactly.
- Monorepo conventions: strict TypeScript, ESM, workspace packages reference each other via `"*"`. Match patterns already in `apps/api` and `packages/graph`.
- Tailwind v4 is CSS-first — no `tailwind.config.ts`, no `postcss.config.js`. Use `@tailwindcss/vite`. Tokens land in a later story (`design-tokens-and-appshell`); for now an empty `@theme { }` block is fine.
- shadcn/ui init should use the new-york style. Do not yet install individual components.
- `turbo.json` does not exist yet. Create it at the repo root. Minimum pipeline: `dev` (persistent, no cache), `build` (depends on `^build`, outputs `dist/**`), `lint`, `test`.
- `turbo` itself is NOT installed — the root `package.json` references it in scripts but has no `turbo` entry in devDependencies. Add it (`npm install -D -W turbo@^2`) as part of this story; otherwise `npm run dev` at the repo root will fail.
- Keep the scope tight. Do not pull in design tokens, Apollo Client, GraphQL codegen, or routing for real pages — those are separate stories.
