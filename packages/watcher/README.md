# @appbuildersph/watcher

Application watcher for the App Builders PH SDK — continuous CPU/RAM/event-loop
sampling, crash capture, and health/performance scoring.

## What it monitors

- CPU (% of one core) and event-loop delay, sampled on an interval
- RSS/heap memory vs. system free/total memory
- Uptime
- A lightweight heap-growth heuristic that flags a likely memory leak
- `uncaughtException` / `unhandledRejection` — auto-captured as incidents

## Usage

```ts
import { Watcher } from "@appbuildersph/watcher";

const watcher = new Watcher({
  intervalMs: 5000,
  onIncident: (incident) => logger.critical(incident.message, { incident }),
  onMetrics: (snapshot) => logger.debug("metrics", { snapshot }),
});

watcher.start();

watcher.health();
// => { healthScore, performanceScore, uptimeSeconds, lastSync, latestMetrics, recentIncidents }

watcher.createIncident("manual", "payment webhook retried 5 times");
watcher.stop();
```

`healthScore` and `performanceScore` are 0-100: performance is penalized by CPU and
event-loop delay, and health is further penalized by incidents raised in the last 5
minutes. Incidents from `uncaughtException`/`unhandledRejection` are captured
automatically unless `captureCrashes: false` is set.
