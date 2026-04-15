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

/**
 * Function form of {@link DOMAIN_SLUG}. Exists so consumers that need a
 * callable (e.g., router context factories that want to defer evaluation,
 * or tests that want to stub via `vi.spyOn`) have a stable interface. Today
 * it is a pure getter — there is only one place the slug is derived.
 */
export function getDomainSlug(): string {
  return DOMAIN_SLUG;
}
