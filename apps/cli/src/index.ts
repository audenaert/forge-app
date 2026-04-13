// Library entry point for @etak/cli.
//
// The package is consumed primarily as a bin (`etak`), but this module
// exposes the internal schema surface so adjacent packages (future web UI,
// shared-contract tests) can import validated types directly.
//
// Adapters, formatters, and command wiring land in later stories (M1-S4+).

export * from './schemas/index.js';
