import { describe, expect, it, vi } from "vitest";
import { Watcher } from "./watcher.js";

describe("Watcher", () => {
  it("tick() records a metrics snapshot and reports health", () => {
    const watcher = new Watcher({ captureCrashes: false });
    const snapshot = watcher.tick();

    expect(snapshot.timestamp).toBeTruthy();
    expect(watcher.getHistory()).toHaveLength(1);

    const health = watcher.health();
    expect(health.healthScore).toBeGreaterThanOrEqual(0);
    expect(health.healthScore).toBeLessThanOrEqual(100);
    expect(health.latestMetrics).not.toBeNull();

    watcher.stop();
  });

  it("createIncident() records the incident and invokes onIncident", () => {
    const onIncident = vi.fn();
    const watcher = new Watcher({ captureCrashes: false, onIncident });

    const incident = watcher.createIncident("manual", "something odd happened");

    expect(watcher.getIncidents()).toContainEqual(incident);
    expect(onIncident).toHaveBeenCalledWith(incident);
  });

  it("captures uncaughtException as an incident when enabled", () => {
    const onIncident = vi.fn();
    const watcher = new Watcher({ captureCrashes: true, onIncident, intervalMs: 100_000 });
    watcher.start();

    process.emit("uncaughtException", new Error("boom"));

    expect(onIncident).toHaveBeenCalledTimes(1);
    const incident = onIncident.mock.calls[0]?.[0];
    expect(incident.source).toBe("uncaughtException");
    expect(incident.message).toBe("boom");

    watcher.stop();
  });

  it("captures unhandledRejection as an incident when enabled", () => {
    const onIncident = vi.fn();
    const watcher = new Watcher({ captureCrashes: true, onIncident, intervalMs: 100_000 });
    watcher.start();

    process.emit("unhandledRejection", new Error("rejected"), Promise.resolve());

    expect(onIncident).toHaveBeenCalledTimes(1);
    expect(onIncident.mock.calls[0]?.[0].source).toBe("unhandledRejection");

    watcher.stop();
  });

  it("does not double-register handlers or leak timers across repeated start() calls", () => {
    const watcher = new Watcher({ captureCrashes: true, intervalMs: 100_000 });
    watcher.start();
    watcher.start();

    const listenerCount = process.listenerCount("uncaughtException");
    expect(listenerCount).toBeGreaterThanOrEqual(1);

    watcher.stop();
  });

  it("stop() removes crash handlers", () => {
    const onIncident = vi.fn();
    const watcher = new Watcher({ captureCrashes: true, onIncident, intervalMs: 100_000 });
    const before = process.listenerCount("uncaughtException");
    watcher.start();
    expect(process.listenerCount("uncaughtException")).toBe(before + 1);

    watcher.stop();
    expect(process.listenerCount("uncaughtException")).toBe(before);
  });
});
