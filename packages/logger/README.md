# @appbuildersph/logger

Enterprise logger for the App Builders PH SDK.

## Levels

`debug`, `info`, `warning`, `error`, `critical`, `audit`, `security` — each has a
convenience method (`logger.error(...)`) and all funnel through `logger.log(level, ...)`.

## Transports

- `ConsoleTransport` — colored stdout/stderr output
- `JsonTransport` — ndjson file output for log shipping
- `FileTransport` — plain-text file output with size-based rotation and gzip compression

Implement the `Transport` interface for remote/cloud shipping (Datadog, App Builders Cloud, etc.).

## Usage

```ts
import { Logger, ConsoleTransport, FileTransport } from "@appbuildersph/logger";

const logger = new Logger({
  minLevel: "info",
  transports: [new ConsoleTransport(), new FileTransport({ filePath: "./logs/app.log" })],
});

logger.info("server started");
logger.child("database").error("connection lost");

logger.query({ level: "error", search: "connection" });
logger.groupByCategory();
logger.export("json");
```
