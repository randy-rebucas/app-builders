import { describe, expect, it } from "vitest";
import { Badge } from "./badge.js";
import { DEFAULT_BADGE_CONFIG, resolveBadgeConfig, resolveBadgeStatus } from "./types.js";

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

  it("passes through verifyUrl when provided", () => {
    expect(resolveBadgeConfig({ verifyUrl: "https://example.com/verify" })).toEqual({
      ...DEFAULT_BADGE_CONFIG,
      verifyUrl: "https://example.com/verify",
    });
  });

  it("passes through logoUrl when provided", () => {
    expect(resolveBadgeConfig({ logoUrl: "https://example.com/logo.png" })).toEqual({
      ...DEFAULT_BADGE_CONFIG,
      logoUrl: "https://example.com/logo.png",
    });
  });
});

describe("resolveBadgeStatus", () => {
  it("uses status when provided, regardless of verified", () => {
    expect(resolveBadgeStatus({ appName: "Test", status: "degraded", verified: true })).toBe(
      "degraded",
    );
  });

  it("falls back to verified/unverified when status is absent", () => {
    expect(resolveBadgeStatus({ appName: "Test", verified: true })).toBe("verified");
    expect(resolveBadgeStatus({ appName: "Test", verified: false })).toBe("unverified");
    expect(resolveBadgeStatus({ appName: "Test" })).toBe("unverified");
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

  it("setStatus() before mount() is a safe no-op", () => {
    const badge = new Badge({ appName: "Test App" }, true);
    expect(() => badge.setStatus("degraded")).not.toThrow();
    expect(badge.isMounted()).toBe(false);
  });
});
