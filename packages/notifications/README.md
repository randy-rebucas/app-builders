# @appbuildersph/notifications

Notification center for the App Builders PH SDK — one call fans out to every
configured channel, with per-type routing and in-memory history for the dashboard.

## Types

`success`, `information`, `warning`, `critical`, `security`, `performance`,
`deployment`, `incident`, `ai-recommendation` — each has a convenience method
(`center.security(...)`) alongside the generic `notify(type, title, message, context?)`.

## Channels

- `WebhookChannel` — posts the raw notification as JSON
- `SlackChannel` / `DiscordChannel` / `TeamsChannel` / `TelegramChannel` — formatted for each platform's webhook/bot API
- `ToastChannel` — in-process pub/sub (no network I/O) for the badge/dashboard UI to subscribe to

## Usage

```ts
import { NotificationCenter, SlackChannel, ToastChannel } from "@appbuildersph/notifications";

const toast = new ToastChannel();
const center = new NotificationCenter({
  channels: [toast, new SlackChannel({ webhookUrl: process.env.SLACK_WEBHOOK_URL! })],
  routing: {
    security: [new SlackChannel({ webhookUrl: process.env.SECURITY_SLACK_WEBHOOK_URL! })],
  },
  onError: (error, channel) => logger.error(`notification delivery failed via ${channel.name}`, { error }),
});

toast.subscribe((notification) => renderToast(notification));

await center.incident("Payment webhook failing", "5 consecutive 500s from /webhooks/stripe");
center.getHistory("incident");
```

Wire `Watcher`'s `onIncident` hook into `center.incident(...)` to get automatic
crash/incident alerts across every configured channel.
