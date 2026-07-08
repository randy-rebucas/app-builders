import { freemem, totalmem } from "node:os";
import { monitorEventLoopDelay } from "node:perf_hooks";
import type { MetricsSnapshot } from "./types.js";

/** Samples CPU (as % of one core) and event-loop delay across successive calls. */
export class MetricsSampler {
  private lastCpuUsage = process.cpuUsage();
  private lastSampleTime = process.hrtime.bigint();
  private readonly eventLoopMonitor = monitorEventLoopDelay({ resolution: 20 });

  constructor() {
    this.eventLoopMonitor.enable();
  }

  sample(): MetricsSnapshot {
    const now = process.hrtime.bigint();
    const elapsedMs = Number(now - this.lastSampleTime) / 1e6;
    const cpuUsage = process.cpuUsage(this.lastCpuUsage);
    const cpuMs = (cpuUsage.user + cpuUsage.system) / 1000;
    const cpuPercent = elapsedMs > 0 ? Math.min(100, (cpuMs / elapsedMs) * 100) : 0;

    this.lastCpuUsage = process.cpuUsage();
    this.lastSampleTime = now;

    const mem = process.memoryUsage();
    const eventLoopDelayMs = this.eventLoopMonitor.mean / 1e6 || 0;
    this.eventLoopMonitor.reset();

    return {
      timestamp: new Date().toISOString(),
      cpuPercent: Number(cpuPercent.toFixed(2)),
      memory: {
        rssBytes: mem.rss,
        heapUsedBytes: mem.heapUsed,
        heapTotalBytes: mem.heapTotal,
        systemFreeBytes: freemem(),
        systemTotalBytes: totalmem(),
      },
      eventLoopDelayMs: Number(eventLoopDelayMs.toFixed(2)),
      uptimeSeconds: Math.floor(process.uptime()),
    };
  }

  dispose(): void {
    this.eventLoopMonitor.disable();
  }
}
