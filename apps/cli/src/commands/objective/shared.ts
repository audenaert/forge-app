// Module-local types for the `etak objective *` command group. Generic
// helpers (`deriveSlug`, `readStdin`, `readFileUtf8`, `collectStrings`,
// `splitKv`, `scaffoldCanonicalBody`, `REQUIRED_SECTION_PLACEHOLDER`) live
// in `../shared.ts` alongside their cross-type counterparts.

import type { CommandContext, CreateCommandContextOptions } from '../../context.js';

/**
 * Factory signature the objective registration accepts so tests can inject a
 * fake `CommandContext` without spinning up a real adapter. Production code
 * passes `createCommandContext` through, which walks up for `.etak/` and
 * instantiates the fs adapter.
 */
export type CommandContextFactory = (
  opts: CreateCommandContextOptions,
) => Promise<CommandContext>;
