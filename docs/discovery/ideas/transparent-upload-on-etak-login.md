---
name: "Transparent upload on first `etak login`"
type: idea
status: draft
addresses:
  - disruptive-migration-from-local-to-cloud
delivered_by: null
---

## Description

When a user runs `etak login` for the first time from a project that already has local artifacts under `docs/discovery/` or `docs/development/`, the CLI detects them, shows a summary of what it found, and offers to upload them into the user's new cloud domain as part of the login flow. No separate migration command, no manual re-entry, no lost work.

From the user's perspective:

```
$ etak login
Signed in as user@example.com — new domain "my-project" created.
Found 14 local artifacts (3 objectives, 5 opportunities, 6 ideas).
Upload to cloud domain? [Y/n]
```

After upload, subsequent `etak` invocations in the same project use the cloud backend by default. The local files can be kept as a mirror, archived, or removed — decided by the user at upload time.

## Why This Could Work

This removes the classic "now rebuild everything in the new tool" cliff. The user's first cloud experience starts with their real work already present, which is the single strongest signal that the upgrade was worth it.

It also aligns the upgrade moment with the moment the user is already giving the tool their full attention — they're running `login` because they decided to upgrade. Bundling the migration into that same interaction means they never have to come back later and do it as a separate task. Separate tasks don't get done.

## Open Questions

- What happens to the local files afterward — keep as mirror, archive, delete? Different users will want different answers.
- How do we handle conflicts if the same project slug already exists in the cloud domain (e.g., the user logged in, then deleted local files, then re-created them)?
- Should the upload be atomic (all-or-nothing) or incremental (upload what succeeds, report what failed)?
- Does the transparent path preclude the explicit `etak migrate` path, or do both coexist for different user preferences?
