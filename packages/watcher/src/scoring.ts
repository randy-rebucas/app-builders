import type { MetricsSnapshot } from "./types.js";

/** 0-100 score: penalizes high CPU and event-loop delay. */
export function computePerformanceScore(snapshot: MetricsSnapshot): number {
  const cpuPenalty = snapshot.cpuPercent;
  const eventLoopPenalty = Math.min(50, snapshot.eventLoopDelayMs);
  const score = 100 - cpuPenalty * 0.5 - eventLoopPenalty;
  return Math.max(0, Math.min(100, Math.round(score)));
}

/** 0-100 score: performance plus a penalty for recent incident volume. */
export function computeHealthScore(
  performanceScore: number,
  recentIncidentCount: number,
): number {
  const incidentPenalty = Math.min(60, recentIncidentCount * 15);
  return Math.max(0, Math.min(100, performanceScore - incidentPenalty));
}

/**
 * Detects a sustained upward trend in heap usage across the sample history —
 * a lightweight proxy for a memory leak (not a definitive diagnosis).
 */
export function detectMemoryLeakTrend(history: MetricsSnapshot[]): boolean {
  if (history.length < 6) return false;

  const heapValues = history.map((s) => s.memory.heapUsedBytes);
  const midpoint = Math.floor(heapValues.length / 2);
  const firstHalfAvg = average(heapValues.slice(0, midpoint));
  const secondHalfAvg = average(heapValues.slice(midpoint));

  if (firstHalfAvg === 0) return false;
  const growth = (secondHalfAvg - firstHalfAvg) / firstHalfAvg;
  return growth > 0.2;
}

function average(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, v) => sum + v, 0) / values.length;
}
