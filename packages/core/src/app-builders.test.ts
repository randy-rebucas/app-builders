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

  it("enables logger and notifications by default", () => {
    const app = init({ appName: "Test App" });
    expect(app.logger()).not.toBeNull();
    expect(app.notifications()).not.toBeNull();
  });

  it("disables logger and notifications when configured off", () => {
    const app = init({ appName: "Test App", logger: false, notifications: false });
    expect(app.logger()).toBeNull();
    expect(app.notifications()).toBeNull();
  });

  it("only starts the watcher when explicitly enabled", () => {
    const withoutWatcher = init({ appName: "Test App" });
    expect(withoutWatcher.watcher()).toBeNull();

    const withWatcher = init({ appName: "Test App", watcher: true });
    expect(withWatcher.watcher()).not.toBeNull();
    withWatcher.shutdown();
  });

  it("runs registered plugins with a hook-enabled context", () => {
    let received: unknown;
    const app = init({
      appName: "Test App",
      watcher: true,
      plugins: [
        {
          name: "test-plugin",
          setup: (ctx) => {
            ctx.registerHook("incident", (incident) => {
              received = incident;
            });
          },
        },
      ],
    });

    app.watcher()?.createIncident("manual", "test incident");
    expect(received).toMatchObject({ source: "manual", message: "test incident" });
    app.shutdown();
  });
});
