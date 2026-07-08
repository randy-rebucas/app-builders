# @appbuildersph/core monorepo

> The Trust, Identity, Monitoring & AI SDK for Modern Applications.

## Status

Phase 1 scaffold: workspace tooling, `@appbuildersph/shared`, and `@appbuildersph/core`
with `AppBuilders.init()` + Application Identity (Feature 2) are implemented and tested.
Everything else below is reserved structure for upcoming phases.

## Structure

```
packages/
  core/           @appbuildersph/core — AppBuilders.init(), public SDK surface
  shared/         Cross-package types (AppBuildersConfig, IdentitySnapshot, LogEntry, ...)
  badge/          Feature 1: floating Verified Badge UI
  identity/       Feature 2/3: identity + digital certificate generation (moves here from core)
  watcher/        Feature 5: app/CPU/RAM/DB/queue health watcher
  logger/         Feature 4: enterprise logger (transports, levels, rotation)
  notifications/  Feature 7: notification center (toast/webhook/Slack/Discord/Teams)
  security/       Feature 6: security center (SQLi/XSS/CSRF/secrets/dep scanning)
  telemetry/      Shared metrics/event pipeline feeding watcher, security, dashboard
  dashboard/      Feature 10: Enterprise Dashboard UI opened from the badge
  plugins/        Feature 11: plugin registry + lifecycle hooks
  cli/            Feature 12: `npx appbuilders <command>`
examples/
  nextjs/ nestjs/ express/ expo/   Framework integration examples
docs/             Generated documentation (README, architecture, API reference, guides)
```

Each `packages/*` is an independent npm package (`@appbuildersph/<name>`), built with tsup
(ESM + CJS + `.d.ts`), typechecked with `tsc --noEmit`, and tested with Vitest. Packages
depend on `@appbuildersph/shared` via `workspace:*` and on each other explicitly as
features are implemented — `core` never reaches into a feature package's internals.

## Scripts

```bash
pnpm install      # install all workspace deps
pnpm build        # build every package (tsup)
pnpm test         # run all vitest suites
pnpm typecheck    # tsc --noEmit across packages
pnpm lint         # eslint
pnpm changeset    # record a changeset for release
```

## Next phases

- Feature 1 (Verified Badge) → `packages/badge`
- Feature 4 (Enterprise Logger) → `packages/logger`
- Feature 5 (Application Watcher) → `packages/watcher`
- Feature 6 (Security Center) → `packages/security`
- Feature 7 (Notification Center) → `packages/notifications`
- Feature 10 (Enterprise Dashboard) → `packages/dashboard`
- Feature 11 (Plugin System) → `packages/plugins`
- Feature 12 (CLI) → `packages/cli`
