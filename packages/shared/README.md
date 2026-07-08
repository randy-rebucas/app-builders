# @appbuildersph/shared

Cross-package types and small utilities used across the App Builders PH SDK.
You won't normally install this directly — `@appbuildersph/core` re-exports
everything from it — but it's useful as a reference for the config/data
shapes every package agrees on.

## Key types

```ts
import type {
  AppBuildersConfig, // the object passed to AppBuilders.init()
  BadgeConfig,       // packages/badge config shape
  IdentitySnapshot,  // returned by AppBuilders.identity().get()
  HealthReport,      // watcher.health() summary shape
  SecurityReport,    // reserved for @appbuildersph/security
  LogEntry,          // logger.query() result entries
  AppBuildersPlugin, // { name, setup(ctx) } plugin shape
} from "@appbuildersph/shared";
```

## Utilities

```ts
import { generateUuid, nowIso, resolveEnvironment } from "@appbuildersph/shared";

generateUuid();       // crypto.randomUUID()
nowIso();              // new Date().toISOString()
resolveEnvironment();  // "development" | "staging" | "production" | "test" from NODE_ENV
```
