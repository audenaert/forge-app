---
name: "Provisioning a new tenant domain has no admin surface and no non-Cypher path"
type: opportunity
status: active
supports:
  - accelerate-product-discovery
hmw: "HMW give operators a first-class surface for provisioning, inspecting, and managing tenant domains — without forcing them to write Cypher or hand-craft api keys?"
---

## Description

Etak is multi-tenant: every artifact in the graph belongs to a `Domain`, and every API request authenticates against a domain via the `x-api-key` header. The data model and the auth path both work. What's missing is any surface for *creating* a domain.

`Domain.apiKey` is `@selectable(onRead: false)` (correctly — keys shouldn't leak through ordinary queries), and there is no GraphQL mutation that mints a fresh `Domain` with a known api key. The only existing paths to a new domain are:

- Direct Cypher against Neo4j
- The `default` domain that `DISABLE_AUTH=true` falls back to in dev
- Test fixtures that bootstrap domains via `packages/graph` directly

That's fine for an early-stage developer working alone, but it doesn't scale to actual operators or to anyone who isn't comfortable in Cypher. It also forced an architectural workaround on the seed script in the discovery explorer milestone (which now uses direct Neo4j writes for the entire seed, partly because of this gap).

This is most naturally an **admin UI** concern — a surface for provisioning, inspecting, rotating, and retiring tenant domains, alongside whatever other operator-level controls the system grows over time. A dedicated admin app (or admin surface inside the main web client, scoped by role) would also be the right home for things like seeing which artifacts a domain owns, rotating an api key, exporting a domain's data, or hard-deleting one.

It is probably *not* a public GraphQL mutation — provisioning sits at a different trust level than ordinary artifact CRUD, and exposing it on the same authenticated surface as the discovery and development queries muddles the security model.

## Why now

Surfaced as a side-effect of the discovery explorer milestone, where the seed script needed to mint a `seed` domain and discovered there was no clean path. Resolved tactically (direct Neo4j writes from the seed script, dev-only), but the underlying gap is real and will keep biting as soon as a second developer or a staging environment needs more than the `default` domain.

## Open questions

- **Where does the admin surface live?** A separate `apps/admin` workspace? An admin section inside `apps/web` gated by role? A CLI? The right answer probably depends on how the rest of the operator surface evolves.
- **What's the trust boundary?** Admin operations almost certainly need a different auth model than `x-api-key` (which is itself the thing being provisioned). SSO? A bootstrap secret? An out-of-band CLI?
- **What other operator capabilities cluster here?** Domain CRUD is the immediate need, but rotating keys, viewing domain stats, exporting data, and managing org membership all live at the same trust level and probably belong on the same surface.
- **Does this become its own project, or part of a broader "operator tooling" project?** Worth scoping properly before committing.

## Evidence

- The discovery explorer's seed script (M1 milestone) hit this gap directly and resolved it tactically with a direct-Neo4j workaround documented in `scripts/README.md`.
- Every test that needs a non-`default` domain currently bootstraps it through `packages/graph` test helpers, not through the public API.
- Multi-tenant SaaS tools universally have admin surfaces for provisioning — Linear, Vercel, Supabase, etc. — and they universally separate that surface from the main authenticated app.
