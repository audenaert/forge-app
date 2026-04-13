---
name: "Etak CLI core"
type: workstream
project: etak-cli
status: planned
---

## Overview

The single workstream for the `@etak/cli` v1 project. Covers package scaffolding, Zod schemas for all 6 discovery types, storage adapter interface plus fs adapter plus graphql stub, CLI chassis (commander wiring, output formatter, exit codes), drift-aware markdown body parsing, the full command surface for all discovery types, and hardening (cross-type ops, error messages, README, QE audit).

A single workstream is correct here because the CLI is a small, tightly coupled package — splitting schema work from adapter work from chassis work would create artificial coordination costs. Parallelism lives at the story level within this workstream, not across workstreams.
