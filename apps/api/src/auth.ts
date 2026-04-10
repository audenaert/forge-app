import type { Driver } from 'neo4j-driver';
import { createHash } from 'node:crypto';

interface DomainLookupResult {
  slug: string;
}

/**
 * Hash an API key with SHA-256 so we never store or query plaintext keys.
 */
export function hashApiKey(key: string): string {
  return createHash('sha256').update(key).digest('hex');
}

/**
 * Resolve domain slug from an API key by querying Neo4j.
 * The incoming key is hashed before lookup — the DB stores only hashes.
 * Returns the domain slug if found, null otherwise.
 */
export async function resolveDomainFromApiKey(
  driver: Driver,
  apiKey: string
): Promise<string | null> {
  const session = driver.session();
  try {
    const hashedKey = hashApiKey(apiKey);
    const result = await session.run(
      'MATCH (d:Domain {apiKey: $apiKey}) RETURN d.slug AS slug LIMIT 1',
      { apiKey: hashedKey }
    );
    if (result.records.length === 0) return null;
    const record = result.records[0].get('slug') as string;
    return record;
  } finally {
    await session.close();
  }
}

/**
 * Extract API key from request headers.
 * Supports both "Authorization: Bearer <key>" and "X-API-Key: <key>" formats.
 */
export function extractApiKey(headers: { authorization?: string; 'x-api-key'?: string }): string | null {
  // Check X-API-Key header first (more explicit)
  const xApiKey = headers['x-api-key'];
  if (xApiKey) return xApiKey;

  // Check Authorization: Bearer <key>
  const auth = headers.authorization;
  if (auth?.startsWith('Bearer ')) {
    return auth.slice(7).trim();
  }

  return null;
}
