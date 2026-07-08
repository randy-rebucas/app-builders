export interface MetricsSnapshot {
  timestamp: string;
  cpuPercent: number;
  memory: {
    rssBytes: number;
    heapUsedBytes: number;
    heapTotalBytes: number;
    systemFreeBytes: number;
    systemTotalBytes: number;
  };
  eventLoopDelayMs: number;
  uptimeSeconds: number;
}

export type IncidentSource =
  | "uncaughtException"
  | "unhandledRejection"
  | "memoryLeak"
  | "manual";

export interface Incident {
  id: string;
  source: IncidentSource;
  message: string;
  stack?: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface HealthReportDetail {
  healthScore: number;
  performanceScore: number;
  uptimeSeconds: number;
  lastSync: string;
  latestMetrics: MetricsSnapshot | null;
  recentIncidents: Incident[];
}

export interface WatcherOptions {
  /** Sampling interval in milliseconds. Default 5000. */
  intervalMs?: number;
  /** Number of metric samples kept for trend analysis (e.g. memory leak detection). Default 60. */
  historySize?: number;
  /** Install process-level crash handlers (uncaughtException/unhandledRejection). Default true. */
  captureCrashes?: boolean;
  onIncident?: (incident: Incident) => void;
  onMetrics?: (snapshot: MetricsSnapshot) => void;
}
