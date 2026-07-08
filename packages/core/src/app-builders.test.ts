import { describe, expect, it } from "vitest";
import { init } from "./app-builders.js";

describe("AppBuilders.init", () => {
  it("creates an instance with a verified identity by default", () => {
    const app = init({ appName: "Test App" });
    expect(app.verify()).toBe(true);
  });

  it("generates a signed identity snapshot", () => {
    const app = init({ appName: "Test App", organization: "App Builders PH" });
    const snapshot = app.identity().get();
    expect(snapshot).not.toBeNull();
    expect(snapshot?.verificationHash).toHaveLength(64);
    expect(snapshot?.organizationId).toBe("App Builders PH");
  });

  it("skips identity generation when disabled", () => {
    const app = init({ appName: "Test App", identity: false });
    expect(app.verify()).toBe(false);
  });

  it("refresh() regenerates the identity snapshot", () => {
    const app = init({ appName: "Test App" });
    const first = app.identity().get();
    const refreshed = app.identity().refresh();
    expect(refreshed.appUuid).not.toBe(first?.appUuid);
  });
});
