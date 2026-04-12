import { readFileSync } from 'node:fs';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Command } from 'commander';

/**
 * Resolve the package version by reading package.json relative to the built
 * bundle location. tsup emits `dist/cli.js`, so `../package.json` from there
 * points at the package root in both dev (tsx) and built (node dist/cli.js)
 * contexts, because `src/` and `dist/` are both one level below the package
 * root.
 */
function readPackageVersion(): string {
  const here = dirname(fileURLToPath(import.meta.url));
  const pkgPath = resolve(here, '..', 'package.json');
  const raw = readFileSync(pkgPath, 'utf8');
  const parsed = JSON.parse(raw) as { version?: string };
  return parsed.version ?? '0.0.0';
}

// Placeholder command namespaces. In this scaffold story they exist so that
// `etak --help` lists them; invoking any of them exits with code 4 (usage
// error) until implementations land in subsequent stories.
const PLACEHOLDER_COMMANDS: ReadonlyArray<{ name: string; description: string }> = [
  { name: 'init', description: 'initialize a .etak/ artifact tree in the current project' },
  { name: 'idea', description: 'manage idea artifacts' },
  { name: 'objective', description: 'manage objective artifacts' },
  { name: 'opportunity', description: 'manage opportunity artifacts' },
  { name: 'assumption', description: 'manage assumption artifacts' },
  { name: 'experiment', description: 'manage experiment artifacts' },
  { name: 'critique', description: 'manage critique artifacts' },
];

function buildProgram(): Command {
  const program = new Command();

  program
    .name('etak')
    .description('Etak CLI — local-first interface for discovery artifacts')
    .version(readPackageVersion(), '-v, --version', 'print the @etak/cli version');

  for (const { name, description } of PLACEHOLDER_COMMANDS) {
    program
      .command(name)
      .description(`${description} (not yet implemented)`)
      .allowUnknownOption()
      .helpOption(false)
      .action(() => {
        process.stderr.write(
          `etak: \`${name}\` is not implemented yet in this scaffold.\n`,
        );
        process.exit(4);
      });
  }

  return program;
}

async function main(argv: string[]): Promise<void> {
  const program = buildProgram();
  await program.parseAsync(argv);
}

main(process.argv).catch((err: unknown) => {
  const message = err instanceof Error ? err.message : String(err);
  process.stderr.write(`etak: ${message}\n`);
  process.exit(1);
});
