import { randomUUID } from "node:crypto";
import { MetricsSampler } from "./metrics.js";
import { computeHealthScore, computePerformanceScore, detectMemoryLeakTrend } from "./scoring.js";
import type {
  HealthReportDetail,
  Incident,
  IncidentSource,
  MetricsSnapshot,
  WatcherOptions,
} from "./types.js";

const INCIDENT_WINDOW_MS = 5 * 60 * 1000;

export class Watcher {
  private readonly intervalMs: number;
  private readonly historySize: number;
  private readonly captureCrashes: boolean;
  private readonly onIncidentCallback?: (incident: Incident) => void;
  private readonly onMetricsCallback?: (snapshot: MetricsSnapshot) => void;

  private sampler: MetricsSampler | null = null;
  private timer: ReturnType<typeof setInterval> | null = null;
  private history: MetricsSnapshot[] = [];
  private incidents: Incident[] = [];
  private leakIncidentRaised = false;

  private readonly handleUncaughtException = (error: Error) => {
    this.createIncident("uncaughtException", error.message, { stack: error.stack });
  };

  private readonly handleUnhandledRejection = (reason: unknown) => {
    const message = reason instanceof Error ? reason.message : String(reason);
    const stack = reason instanceof Error ? reason.stack : undefined;
    this.createIncident("unhandledRejection", message, { stack });
  };

  constructor(options: WatcherOptions = {}) {
    this.intervalMs = options.intervalMs ?? 5000;
    this.historySize = options.historySize ?? 60;
    this.captureCrashes = options.captureCrashes ?? true;
    this.onIncidentCallback = options.onIncident;
    this.onMetricsCallback = options.onMetrics;
  }

  start(): void {
    if (this.timer) return;

    this.sampler = new MetricsSampler();
    this.timer = setInterval(() => this.tick(), this.intervalMs);
    this.timer.unref?.();

    if (this.captureCrashes) {
      process.on("uncaughtException", this.handleUncaughtException);
      process.on("unhandledRejection", this.handleUnhandledRejection);
    }
  }

  stop(): void {
    if (this.timer) {
      clearInterval(this.timer);
      this.timer = null;
    }
    this.sampler?.dispose();
    this.sampler = null;

    if (this.captureCrashes) {
      process.off("uncaughtException", this.handleUncaughtException);
      process.off("unhandledRejection", this.handleUnhandledRejection);
    }
  }

  /** Takes and records a single sample immediately (also used by start()'s interval). */
  tick(): MetricsSnapshot {
    const sampler = this.sampler ?? (this.sampler = new MetricsSampler());
    const snapshot = sampler.sample();

    this.history.push(snapshot);
    if (this.history.length > this.historySize) this.history.shift();

    if (detectMemoryLeakTrend(this.history) && !this.leakIncidentRaised) {
      this.leakIncidentRaised = true;
      this.createIncident("memoryLeak", "Sustained heap growth detected across recent samples");
    }

    this.onMetricsCallback?.(snapshot);
    return snapshot;
  }

  createIncident(
    source: IncidentSource,
    message: string,
    context?: Record<string, unknown>,
  ): Incident {
    const incident: Incident = {
      id: randomUUID(),
      source,
      message,
      stack: context?.stack as string | undefined,
      timestamp: new Date().toISOString(),
      context,
    };

    this.incidents.push(incident);
    this.onIncidentCallback?.(incident);
    return incident;
  }

  health(): HealthReportDetail {
    const latestMetrics = this.history.at(-1) ?? null;
    const recentIncidents = this.incidents.filter(
      (incident) => Date.now() - new Date(incident.timestamp).getTime() < INCIDENT_WINDOW_MS,
    );

    const performanceScore = latestMetrics ? computePerformanceScore(latestMetrics) : 100;
    const healthScore = computeHealthScore(performanceScore, recentIncidents.length);

    return {
      healthScore,
      performanceScore,
      uptimeSeconds: latestMetrics?.uptimeSeconds ?? Math.floor(process.uptime()),
      lastSync: new Date().toISOString(),
      latestMetrics,
      recentIncidents,
    };
  }

  getHistory(): MetricsSnapshot[] {
    return [...this.history];
  }

  getIncidents(): Incident[] {
    return [...this.incidents];
  }
}
