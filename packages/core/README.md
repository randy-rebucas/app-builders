# @appbuildersph/core

The Trust, Identity, Monitoring & AI SDK for Modern Applications — a single
`AppBuilders.init()` call wires up identity, logging, notifications, the
verified badge, and (opt-in) app health watching.

## Install

```bash
npm install @appbuildersph/core
```

## Usage

```ts
import { AppBuilders } from "@appbuildersph/core";

AppBuilders.init({
  appName: "My App",
  organization: "Acme Inc",
  developer: "jane@acme.com",
  environment: "production", // defaults to NODE_ENV-derived value

  // feature flags — see table below for defaults
  identity: true,
  logger: true,
  notifications: true,
  badge: true,
  watcher: false,

  plugins: [
    {
      name: "my-plugin",
      setup: ({ config, registerHook }) => {
        registerHook("incident", (incident) => console.error("incident!", incident));
      },
    },
  ],
});

AppBuilders.verify(); // true once identity is generated
AppBuilders.identity().get(); // IdentitySnapshot | null
AppBuilders.logger()?.info("server started");
await AppBuilders.notifications()?.success("Deployed", "v1.2.3 is live");
AppBuilders.badge(); // Badge | null — auto-mounted on init() in a browser
AppBuilders.watcher()?.health(); // only non-null if `watcher: true` (auto-started)

AppBuilders.shutdown(); // stops the watcher and unmounts the badge
```

## Feature flags

| Config key      | Default | Package                                        |
| ---------------- | ------- | ----------------------------------------------- |
| `identity`       | `true`  | built-in (application identity + verification hash) |
| `logger`         | `true`  | [`@appbuildersph/logger`](../logger)             |
| `notifications`  | `true`  | [`@appbuildersph/notifications`](../notifications) |
| `badge`          | `true`  | [`@appbuildersph/badge`](../badge)               |
| `watcher`        | `false` | [`@appbuildersph/watcher`](../watcher) — opt-in since it starts an interval timer and installs process crash hooks |

Each accessor (`logger()`, `notifications()`, `badge()`, `watcher()`) returns
`null` if its flag is disabled — always guard with `?.` or a null check.

## Plugins

`plugins` is a list of `{ name, setup(ctx) }` objects run once during
`init()`. `ctx.registerHook(event, handler)` subscribes to internal events —
currently `"incident"` and `"metrics"`, both emitted by the watcher when
enabled.

## Identity

Every app gets a signed `IdentitySnapshot` (uuid, org/developer, environment,
git commit/branch, hostname, a SHA-256 verification hash) unless
`identity: false`. See `AppBuilders.identity()` for `get()`, `refresh()`,
`verify()`, and `export()` (JSON string).
