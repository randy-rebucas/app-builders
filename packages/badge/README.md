# @appbuildersph/badge

Floating "Verified Badge" web component for the App Builders PH SDK — a small,
self-contained widget any site can append to show it's built/monitored by App
Builders PH.

## How it works

- Renders as a `<appbuilders-badge>` custom element with a Shadow DOM, so its
  styles never leak into (or get overridden by) the host page.
- Pure client-side: `mount()`/`unmount()` are safe no-ops when there's no
  `document` (SSR, Node scripts), so the package can be imported anywhere
  without guards.
- v1 is a static badge: it shows "Verified by App Builders PH" and, if
  `expandable`, expands on click to show the app name, organization, and
  environment.

## Usage via `@appbuildersph/core` (recommended)

If you're using `AppBuilders.init()`, the badge is wired up automatically —
enabled by default and mounted for you:

```ts
import { AppBuilders } from "@appbuildersph/core";

AppBuilders.init({
  appName: "My App",
  organization: "Acme Inc",
  environment: "production",
  badge: {
    position: "bottom-left",
    theme: "dark",
    expandable: true,
  },
  // or simply `badge: false` to disable it
});

// later, e.g. on unmount/cleanup:
AppBuilders.badge()?.unmount();
```

## Standalone usage (no core)

```ts
import { Badge } from "@appbuildersph/badge";

const badge = new Badge(
  { appName: "My App", organization: "Acme Inc", environment: "production", verified: true },
  { position: "bottom-right", theme: "system", expandable: true },
);

badge.mount(); // appends <appbuilders-badge> to document.body
badge.update({ theme: "dark" }); // re-render with new config
badge.unmount(); // remove it
```

## Script tag / CDN usage

For plain HTML pages with no build step, use the prebuilt IIFE bundle
(`dist/appbuilders-badge.global.js`), which exposes a global `AppBuildersBadge`:

```html
<script src="https://unpkg.com/@appbuildersph/badge/dist/appbuilders-badge.global.js"></script>
<script>
  new AppBuildersBadge.Badge({ appName: "My Site" }, true).mount();
</script>
```

## Config

`badge` accepts `true` / `false` or a `BadgeConfig` object (all fields optional):

| Field        | Values                                                    | Default        |
| ------------ | ---------------------------------------------------------- | -------------- |
| `enabled`    | `boolean`                                                   | `true`         |
| `theme`      | `"dark" \| "light" \| "system"`                             | `"system"`     |
| `position`   | `"bottom-right" \| "bottom-left" \| "top-right" \| "top-left"` | `"bottom-right"` |
| `animation`  | `boolean`                                                   | `true`         |
| `expandable` | `boolean`                                                   | `true`         |
