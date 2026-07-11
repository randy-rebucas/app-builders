# @appbuildersph/shared

## 0.1.0

### Minor Changes

- Add `verifyUrl` (click-through link to a verification page) and `logoUrl` (custom logo, falls back to a PH flag) to `BadgeConfig`. Add a `Badge.setStatus()` API and a `status` field on badge identity so the status dot can be updated live; `@appbuildersph/core` now wires this up automatically to `Watcher` incidents/health when both `badge` and `watcher` are enabled.

## 0.0.3

### Patch Changes

- ed468c1: Add/update README documentation with usage examples.

## 0.0.2

### Patch Changes

- 1964b63: Bump all packages for a release. Adds the new @appbuildersph/badge package (floating Verified Badge web component) and wires it into core.
