export { Watcher } from "./watcher.js";
export { MetricsSampler } from "./metrics.js";
export { computeHealthScore, computePerformanceScore, detectMemoryLeakTrend } from "./scoring.js";
export type {
  MetricsSnapshot,
  Incident,
  IncidentSource,
  HealthReportDetail,
  WatcherOptions,
} from "./types.js";
