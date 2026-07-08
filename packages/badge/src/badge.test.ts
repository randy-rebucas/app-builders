import { describe, expect, it } from "vitest";
import { Badge } from "./badge.js";
import { DEFAULT_BADGE_CONFIG, resolveBadgeConfig } from "./types.js";

describe("resolveBadgeConfig", () => {
  it("returns defaults for true/undefined", () => {
    expect(resolveBadgeConfig(true)).toEqual(DEFAULT_BADGE_CONFIG);
    expect(resolveBadgeConfig(undefined)).toEqual(DEFAULT_BADGE_CONFIG);
  });

  it("returns null when disabled", () => {
    expect(resolveBadgeConfig(false)).toBeNull();
    expect(resolveBadgeConfig({ enabled: false })).toBeNull();
  });

  it("merges partial config over defaults", () => {
    expect(resolveBadgeConfig({ position: "top-left" })).toEqual({
      ...DEFAULT_BADGE_CONFIG,
      position: "top-left",
    });
  });
});

describe("Badge (Node/SSR environment, no DOM)", () => {
  it("mount() is a safe no-op without a document global", () => {
    const badge = new Badge({ appName: "Test App" }, true);
    expect(() => badge.mount()).not.toThrow();
    expect(badge.isMounted()).toBe(false);
  });

  it("unmount() before mount() is a safe no-op", () => {
    const badge = new Badge({ appName: "Test App" }, true);
    expect(() => badge.unmount()).not.toThrow();
  });

  it("does not mount when the resolved config is disabled", () => {
    const badge = new Badge({ appName: "Test App" }, false);
    badge.mount();
    expect(badge.isMounted()).toBe(false);
  });
});
