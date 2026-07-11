# @appbuildersph/core

## 0.0.4

### Patch Changes

- Add `verifyUrl` (click-through link to a verification page) and `logoUrl` (custom logo, falls back to a PH flag) to `BadgeConfig`. Add a `Badge.setStatus()` API and a `status` field on badge identity so the status dot can be updated live; `@appbuildersph/core` now wires this up automatically to `Watcher` incidents/health when both `badge` and `watcher` are enabled.
- Updated dependencies
  - @appbuildersph/badge@0.2.0
  - @appbuildersph/shared@0.1.0
  - @appbuildersph/logger@0.0.4
  - @appbuildersph/notifications@0.0.4
  - @appbuildersph/watcher@0.0.4

## 0.0.3

### Patch Changes

- ed468c1: Add/update README documentation with usage examples.
- Updated dependencies [ed468c1]
  - @appbuildersph/badge@0.1.1
  - @appbuildersph/shared@0.0.3
  - @appbuildersph/logger@0.0.3
  - @appbuildersph/notifications@0.0.3
  - @appbuildersph/watcher@0.0.3

## 0.0.2

### Patch Changes

- 1964b63: Bump all packages for a release. Adds the new @appbuildersph/badge package (floating Verified Badge web component) and wires it into core.
- Updated dependencies [1964b63]
  - @appbuildersph/logger@0.0.2
  - @appbuildersph/watcher@0.0.2
  - @appbuildersph/notifications@0.0.2
  - @appbuildersph/shared@0.0.2
  - @appbuildersph/badge@0.1.0
