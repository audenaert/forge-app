---
name: "Explicit `etak migrate` command"
type: idea
status: draft
addresses:
  - disruptive-migration-from-local-to-cloud
delivered_by: null
---

## Description

A first-class `etak migrate` command that moves artifacts between backends with explicit user control. The default form uploads local artifacts into a cloud domain, but the command is bidirectional in principle:

```
etak migrate --to cloud            # local filesystem -> cloud domain
etak migrate --to local            # cloud domain -> local filesystem (for offline work)
etak migrate --to cloud --dry-run  # preview without writing
```

Every migration produces a preview showing what would move, what would conflict, and what would be skipped. The user confirms before any write happens. Conflict handling (newer wins, local wins, remote wins, prompt-per-item) is configurable.

## Why This Could Work

Some users want control, not magic. An explicit command gives them a moment to review what's moving, handle conflicts, and commit with intent. This matters especially when:

- The local artifacts have been shared or edited by multiple people already (e.g., via git), and a blind upload could overwrite work.
- The user is migrating for a specific reason (handing off to a team, archiving) and wants the operation to be deliberate rather than incidental.
- The user wants to move in the reverse direction — pull cloud artifacts down for offline work, travel, or a branch-like experiment.

Having an explicit command also makes the migration surface testable, scriptable, and debuggable in a way that a hidden upload-on-login flow is not.

## Why This Could Coexist With Transparent Upload

`transparent-upload-on-etak-login` optimizes for the first-time user who wants zero friction. This idea optimizes for the power user who wants control and the repeat operation that happens after the first login. They're complementary: the login flow can call into the same migration machinery this command exposes, and the command gives users an escape hatch when the transparent flow isn't what they want.

## Open Questions

- Is this in addition to transparent upload, or do we pick one?
- What's the conflict resolution UX when two backends disagree on an artifact's content?
- Should the command support partial migrations (specific artifact types, specific slugs, specific date ranges)?
- How does bidirectional migration interact with the graph backend's relational integrity — can you round-trip an artifact and its edges cleanly?
