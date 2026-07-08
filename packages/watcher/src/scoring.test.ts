import { describe, expect, it } from "vitest";
import { computeHealthScore, computePerformanceScore, detectMemoryLeakTrend } from "./scoring.js";
import type { MetricsSnapshot } from "./types.js";

function snapshot(overrides: Partial<MetricsSnapshot> = {}): MetricsSnapshot {
  return {
    timestamp: new Date().toISOString(),
    cpuPercent: 0,
    memory: {
      rssBytes: 0,
      heapUsedBytes: 0,
      heapTotalBytes: 0,
      systemFreeBytes: 0,
      systemTotalBytes: 0,
    },
    eventLoopDelayMs: 0,
    uptimeSeconds: 0,
    ...overrides,
  };
}

describe("computePerformanceScore", () => {
  it("returns 100 for an idle system", () => {
    expect(computePerformanceScore(snapshot())).toBe(100);
  });

  it("penalizes high CPU and event-loop delay", () => {
    const score = computePerformanceScore(snapshot({ cpuPercent: 80, eventLoopDelayMs: 40 }));
    expect(score).toBeLessThan(100);
    expect(score).toBeGreaterThanOrEqual(0);
  });
});

describe("computeHealthScore", () => {
  it("matches performance score with no incidents", () => {
    expect(computeHealthScore(90, 0)).toBe(90);
  });

  it("is penalized by recent incident count, floored at 0", () => {
    expect(computeHealthScore(90, 2)).toBe(60);
    expect(computeHealthScore(90, 10)).toBe(30);
  });
});

describe("detectMemoryLeakTrend", () => {
  it("returns false with insufficient history", () => {
    const history = Array.from({ length: 3 }, (_, i) =>
      snapshot({ memory: { ...snapshot().memory, heapUsedBytes: 1000 * (i + 1) } }),
    );
    expect(detectMemoryLeakTrend(history)).toBe(false);
  });

  it("detects sustained heap growth", () => {
    const heapValues = [10, 10, 10, 30, 35, 40].map((mb) => mb * 1024 * 1024);
    const history = heapValues.map((heapUsedBytes) =>
      snapshot({ memory: { ...snapshot().memory, heapUsedBytes } }),
    );
    expect(detectMemoryLeakTrend(history)).toBe(true);
  });

  it("returns false for flat memory usage", () => {
    const history = Array.from({ length: 8 }, () =>
      snapshot({ memory: { ...snapshot().memory, heapUsedBytes: 50 * 1024 * 1024 } }),
    );
    expect(detectMemoryLeakTrend(history)).toBe(false);
  });
});
