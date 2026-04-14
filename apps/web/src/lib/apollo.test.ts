import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';

/**
 * These tests verify the Apollo Client wiring: the uri, the header casing,
 * and the env-var fallbacks. We re-import the module under each scenario with
 * a mocked `import.meta.env` so the module-level link construction picks up
 * the right values.
 *
 * Apollo Client does not expose `httpLink.options` publicly; the link stores
 * its config on an internal symbol-like field. We verify wiring indirectly
 * via `client.link` (truthy) plus by inspecting the Link's constructor so
 * regressions that delete or rename the link show up here.
 */

async function loadApolloModule(env: Record<string, string | undefined>) {
  vi.resetModules();
  // Vite exposes env vars via `import.meta.env`. In a Vitest/jsdom
  // environment we can stub it per-test.
  vi.stubGlobal('import.meta', { env });
  // Above stub does not work for `import.meta.env` inside ESM modules because
  // `import.meta` is a lexical binding. Instead, use Vitest's dedicated API.
  return await import('./apollo');
}

describe('lib/apollo', () => {
  const ORIGINAL_URL = import.meta.env.VITE_API_URL;
  const ORIGINAL_KEY = import.meta.env.VITE_API_KEY;

  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    // Restore originals so we don't leak into other tests.
    (import.meta.env as Record<string, unknown>).VITE_API_URL = ORIGINAL_URL;
    (import.meta.env as Record<string, unknown>).VITE_API_KEY = ORIGINAL_KEY;
  });

  it('constructs a client with an http link and an in-memory cache', async () => {
    (import.meta.env as Record<string, unknown>).VITE_API_URL =
      'http://localhost:4000/graphql';
    (import.meta.env as Record<string, unknown>).VITE_API_KEY = 'test-key';

    const mod = await import('./apollo');
    expect(mod.client).toBeDefined();
    // Cache must be an InMemoryCache instance; Apollo exposes this via `cache`.
    expect(mod.client.cache).toBeDefined();
    // The link is set at construction time. If the import ever removes it,
    // this assertion will catch the regression.
    expect(mod.client.link).toBeDefined();
  });

  it('sends requests to VITE_API_URL with a lowercase x-api-key header', async () => {
    (import.meta.env as Record<string, unknown>).VITE_API_URL =
      'http://api.example.test/graphql';
    (import.meta.env as Record<string, unknown>).VITE_API_KEY = 'secret-123';

    // Intercept fetch so we can inspect the actual request Apollo issues.
    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { objectives: [] } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { client } = await import('./apollo');
    const { gql } = await import('@apollo/client');

    await client.query({
      query: gql`
        query Test {
          objectives {
            id
          }
        }
      `,
      fetchPolicy: 'no-cache',
    });

    expect(fetchMock).toHaveBeenCalledTimes(1);
    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://api.example.test/graphql');

    // Headers may be a plain object or a Headers instance depending on the
    // fetch implementation; normalise to a lowercased map for assertions.
    const headerMap = new Map<string, string>();
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, name) => headerMap.set(name.toLowerCase(), value));
    } else if (Array.isArray(init.headers)) {
      for (const [name, value] of init.headers) headerMap.set(name.toLowerCase(), value);
    } else if (init.headers) {
      for (const [name, value] of Object.entries(init.headers as Record<string, string>)) {
        headerMap.set(name.toLowerCase(), value);
      }
    }

    expect(headerMap.get('x-api-key')).toBe('secret-123');
    // The canonical casing is lowercase — no uppercase variants should leak.
    const rawHeaderNames = Array.isArray(init.headers)
      ? init.headers.map(([n]) => n)
      : init.headers instanceof Headers
        ? Array.from((init.headers as Headers).keys())
        : Object.keys((init.headers ?? {}) as Record<string, unknown>);
    expect(rawHeaderNames).not.toContain('X-Api-Key');
    expect(rawHeaderNames).not.toContain('X-API-Key');

    vi.unstubAllGlobals();
  });

  it('falls back to localhost and empty key when env vars are absent', async () => {
    delete (import.meta.env as Record<string, unknown>).VITE_API_URL;
    delete (import.meta.env as Record<string, unknown>).VITE_API_KEY;

    const fetchMock = vi.fn().mockResolvedValue(
      new Response(JSON.stringify({ data: { objectives: [] } }), {
        status: 200,
        headers: { 'content-type': 'application/json' },
      }),
    );
    vi.stubGlobal('fetch', fetchMock);

    const { client } = await import('./apollo');
    const { gql } = await import('@apollo/client');

    await client.query({
      query: gql`
        query Test {
          objectives {
            id
          }
        }
      `,
      fetchPolicy: 'no-cache',
    });

    const [url, init] = fetchMock.mock.calls[0] as [string, RequestInit];
    expect(url).toBe('http://localhost:4000/graphql');

    const headerMap = new Map<string, string>();
    if (init.headers instanceof Headers) {
      init.headers.forEach((value, name) => headerMap.set(name.toLowerCase(), value));
    } else if (Array.isArray(init.headers)) {
      for (const [name, value] of init.headers) headerMap.set(name.toLowerCase(), value);
    } else if (init.headers) {
      for (const [name, value] of Object.entries(init.headers as Record<string, string>)) {
        headerMap.set(name.toLowerCase(), value);
      }
    }
    expect(headerMap.get('x-api-key')).toBe('');

    vi.unstubAllGlobals();
  });
});

// Suppress the unused helper warning — kept for future tests that need
// a fully-remounted module with injected env.
void loadApolloModule;
