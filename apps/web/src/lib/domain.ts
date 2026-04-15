/**
 * Domain slug for every discovery query. The server resolves the domain
 * server-side from the API key, but queries that accept an explicit
 * `domainSlug` argument (discoveryHealth, orphan queries, filtered
 * objective lookups) still need it supplied by the client.
 *
 * The value comes from `VITE_DOMAIN_SLUG`, defaulting to `seed` so the
 * stock local dev flow (`npm run seed` + `VITE_API_KEY=seed-dev-key`)
 * works with zero configuration. If/when multi-domain switching is
 * introduced, this module is the single place to replace.
 */
export const DOMAIN_SLUG: string =
  (import.meta.env.VITE_DOMAIN_SLUG as string | undefined) ?? 'seed';
