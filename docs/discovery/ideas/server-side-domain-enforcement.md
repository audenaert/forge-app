---
name: "Server-side domain scoping enforcement"
type: idea
status: draft
addresses:
  - no-computational-model-for-opportunity-exploration
delivered_by: null
---

## Description

The current GraphQL API resolves a domain from the API key in the request context, but does not enforce that queries are scoped to that domain. Domain filtering relies on callers including a `domain: { slug: { eq: "..." } }` filter in their WHERE clauses. A caller with a valid API key for domain A could query domain B's data by omitting the filter.

This needs server-side enforcement so that all queries and mutations are automatically scoped to the authenticated domain, regardless of what the caller sends.

## Options

1. **Middleware that injects domain filter** — intercept all GraphQL operations and inject the domain filter into the WHERE clause before execution. This is transparent to callers.
2. **@authorization directives** — @neo4j/graphql v7 supports `@authorization(filter: ...)` but only with `$jwt` variables, not arbitrary context. Would require switching auth to JWT-based tokens.
3. **Custom resolvers** — override auto-generated resolvers to enforce domain scoping. High effort, defeats the purpose of @neo4j/graphql.
4. **Neo4j row-level security** — Neo4j Enterprise has RBAC. Not available on Community Edition.

## Why not fixed yet

The primary consumers right now are AI agents and development tooling that we control. The API is not exposed to the public internet. The risk is low for the current stage. This should be addressed before any external or multi-tenant deployment.

## When to fix

When we implement full authentication (RBAC, Teams, OAuth/SSO). The auth enforcement layer should include domain scoping as a foundational guarantee.
