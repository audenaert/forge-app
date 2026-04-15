---
name: "Production user authentication"
type: project
status: scoping
parent: null
children: []
workstreams:
  - graphql-api
  - web-client
milestones: []
from_discovery: null
---

## Overview

Replace the dev-only `VITE_API_KEY` model introduced in PR #22 with a real user authentication layer. The current model ships a per-domain API key baked into the browser bundle — acceptable for local development, not acceptable the moment the client is served from anywhere other than a trusted developer's machine. This project builds the authentication surface that lets a real user log in, acquire a session, and have every backend request gated by their credentials rather than a shared bundle secret.

The existing domain-level auth (M3: Multi-tenant & auth) stays in place. API keys continue to work for machine-to-machine access and CLI/agent clients. This project layers **user** identity on top of the existing **domain** identity: a user logs in, the session is associated with one (or more) domains they belong to, and requests resolve to a domain via the session rather than via a client-side key.

## Context

- **Surfaced during PR #22 review.** The apollo-client-and-codegen PR wired `VITE_API_KEY` into the apps/web bundle. The reviewer flagged that `VITE_`-prefixed variables are inlined into the production build at compile time and are therefore not runtime secrets. The README now contains a prominent warning, and `apps/web/.env.example` documents that the key must only ever hold a dev-only value like `seed-dev-key`. That warning makes the current limitation visible but does not fix it.
- **M3 already exists as the server-side foundation.** The Organization → Domain → User schema, the `MEMBER_OF` edge with role field, and the per-domain API key middleware are all in place (see `docs/development/milestones/m3-multi-tenant-auth.md`). M3 explicitly deferred OAuth/SSO and user management UI. This project picks up what M3 deferred.
- **The `User` node already exists.** It's defined in `packages/graph/src/typeDefs/tenancy.graphql` and is linked to `Domain` via `MEMBER_OF`. What's missing is credential storage, session issuance, session validation, and a client-side login flow that populates the session.
- **User framing: this is post-core.** The project is intentionally deferred until after the core discovery explorer functionality (M1, M1a→M1c) has been built. The read-only UI does not need real auth to prove its information architecture. Real auth becomes necessary the moment the tool is used by someone outside a trusted local-dev environment.

## Goals

1. **Gate every backend request by user credentials.** A production deployment should be impossible to access without logging in as a real user with valid credentials.
2. **Retire `VITE_API_KEY` as the client-side auth mechanism.** The dev-mode path remains for local contributors using `seed-dev-key`, but the production build must not require or use `VITE_API_KEY`.
3. **Preserve the existing domain-scoped authorization model.** Every authenticated request still resolves to a specific domain, and the authorization rules from M3 (and the write-side enforcement from the `domain-isolation-write-side-enforcement` story) continue to govern what the user can read and write. User auth is a layer on top of domain auth, not a replacement for it.
4. **Support the realistic user-to-domain mapping.** A single user may be a member of multiple domains (via `MEMBER_OF` edges). The auth layer and client must let a user pick the active domain, and the backend must scope their session accordingly.
5. **Don't regress the machine-to-machine path.** CLI tools, agents, and server-to-server integrations continue to use API keys. The new user auth path coexists with the existing API-key path.

## Constraints

- **Server-side only enforcement for access control.** No part of the access-control decision may live in the browser bundle. Same rule that made the current state insecure.
- **Credential storage must be secure by default.** Passwords hashed (argon2id or equivalent). Sessions signed or stored server-side. Whatever lives on the client is either a short-lived token or an opaque session identifier.
- **CSRF + XSS hardening are non-negotiable for any cookie-based approach.** SameSite, Secure, HttpOnly where applicable.
- **The existing `x-api-key` header path continues to work.** API keys are not deprecated by this project.
- **Compatible with the existing `User`, `Domain`, `Organization`, `MEMBER_OF` schema in `packages/graph`.** Extensions to that schema are fine (adding credential fields, sessions, etc.); replacing it is not.
- **No client-side secret storage.** Don't invent a scheme where a "master key" lives in localStorage or IndexedDB. Session tokens only, with expiry, with refresh.

## Scope

### In scope

- Backend: user credential storage (password or OAuth or magic link — TBD in design pass).
- Backend: login, logout, "who am I", session refresh endpoints (or equivalents).
- Backend: session validation middleware that sets `context.user` and resolves `context.domainSlug` from the session rather than from the `x-api-key` header when both are present.
- Backend: schema extensions for credentials, sessions, and any audit fields needed.
- Client: login page, logout action, session persistence across reloads, 401 handling with redirect to login.
- Client: "active domain" selection UI for users in multiple domains.
- Client: removal of `VITE_API_KEY` from the production code path (dev-mode shim can remain, gated on environment).
- Security hardening: CSRF protection for cookie-based flows, or token-based flow with appropriate mitigations.
- Migration: document how a local-dev contributor moves from the current `seed-dev-key` flow to a real login flow. The seed script should be updated to also create a seed user with known credentials.
- Tests covering: successful login, failed login, session expiry, cross-domain attempt, logout, session refresh, API-key path still works unchanged.

### Out of scope

- **RBAC enforcement beyond domain membership.** The `MEMBER_OF` edge has a role field; honoring it is a separate story.
- **Multi-factor authentication.** Nice to have, deferred.
- **SSO / enterprise identity providers.** SAML, LDAP, enterprise OIDC. Almost certainly a separate later project.
- **Account self-service (sign-up, password reset).** Depends on whether Etak is invite-only. Design pass will decide.
- **Teams within organizations.** Already deferred by M3; still out of scope here.
- **User management UI** (admin: list users, invite user, revoke access). Related but separable.
- **Audit logging of authentication events.** Useful but separable.

## Open questions

These are the biggest unknowns a design pass needs to resolve. The answers to (1) and (2) shape almost everything else.

1. **What's the credential mechanism?** Password + email? Magic links? OAuth (Google, GitHub) as the only option? Some combination? This is the first fork; the rest of the design follows from it.
2. **Sessions: cookies or tokens?** httpOnly session cookies (simpler, CSRF concerns) vs. signed tokens (JWT or opaque) in memory/localStorage with refresh (XSS concerns, more moving parts). There are tradeoffs; this is a decision worth an ADR.
3. **How does a user select the active domain?** On login? Via a switcher in the header? Via a URL segment? Does the session carry one domain or all the user's domains with a per-request selector?
4. **What happens to the existing `x-api-key` path?** Coexists (user sessions AND api keys both work)? Is there a precedence rule when both are present? Does turning on user auth also tighten the api-key path in any way?
5. **Seed-domain migration for local contributors.** How does a contributor running `npm run seed` + the web client flow from the current "edit .env.local with VITE_API_KEY=seed-dev-key" into a login flow? Does the seed script create a seed user with known credentials? How does the web client default to that in dev?
6. **Where does credential storage live?** Password hashes on the User node in Neo4j? External auth service (Auth0, Clerk, Supabase Auth)? The answer changes the whole data-flow.
7. **Session invalidation.** How do we kill a compromised session? List active sessions? Revoke on logout? Global password reset that revokes all sessions?
8. **Error shape for auth failures.** Per the PR #20 review feedback on error classification, any new auth errors should use a consistent GraphQL error code (`UNAUTHORIZED` vs `FORBIDDEN` vs `INVALID_CREDENTIALS`) so the client can distinguish them.

## Related work

- **M3 (complete):** `docs/development/milestones/m3-multi-tenant-auth.md` — server-side domain auth and the Organization/Domain/User schema. This project builds on that foundation.
- **PR #22:** The commit that introduced `VITE_API_KEY` and surfaced the gap. See the reviewer finding on `apps/web/README.md` for the current security warning and the deferred proper fix.
- **`domain-isolation-write-side-enforcement` story:** Closely related but orthogonal. That story closes the server-side data-leak gap between domains. This project adds user-level identity *on top of* the domain-level model. Both should land before production use.
- **Opportunity: `domain-provisioning-has-no-admin-surface`** in `docs/discovery/opportunities/` — an adjacent gap. Real user auth pairs naturally with a real domain-provisioning flow.
- **`auth.ts` in `apps/api`** — the current `x-api-key → domain` resolution logic. The new session path will plug into the same context-factory, not replace it.

## Entry criteria

This project is ready to enter `planning` status when:

- M1 (web discovery explorer) is substantially complete and validated in use. The read-only IA doesn't need real auth to prove itself.
- A product-level decision has been made about the intended deployment target (self-hosted per-team, multi-tenant SaaS, hybrid). That decision narrows questions 1, 2, and 6 in the "Open questions" section significantly.
- An architect or design pass has been booked to resolve at least open questions 1 and 2 and commit them to ADRs before implementation begins.

Until those conditions are met, this project lives in `scoping` as a placeholder that captures the gap and the context, not as a work item anyone should pick up.
