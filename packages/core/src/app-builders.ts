import type { AppBuildersConfig, IdentitySnapshot } from "@appbuildersph/shared";
import { Badge } from "@appbuildersph/badge";
import { Logger } from "@appbuildersph/logger";
import { NotificationCenter } from "@appbuildersph/notifications";
import { Watcher } from "@appbuildersph/watcher";
import { createIdentitySnapshot } from "./identity.js";
import { createHookRegistry } from "./hooks.js";

export class AppBuildersInstance {
  readonly config: AppBuildersConfig;
  private identitySnapshot: IdentitySnapshot | null = null;
  private readonly loggerInstance: Logger | null = null;
  private readonly notificationCenter: NotificationCenter | null = null;
  private readonly watcherInstance: Watcher | null = null;
  private readonly badgeInstance: Badge | null = null;
  private readonly hooks = createHookRegistry();

  constructor(config: AppBuildersConfig) {
    this.config = config;

    if (config.identity ?? true) {
      this.identitySnapshot = createIdentitySnapshot(config);
    }

    if (config.logger ?? true) {
      this.loggerInstance = new Logger();
    }

    if (config.notifications ?? true) {
      this.notificationCenter = new NotificationCenter();
    }

    if (config.badge ?? true) {
      this.badgeInstance = new Badge(
        {
          appName: config.appName,
          organization: config.organization,
          developer: config.developer,
          environment: config.environment,
          verified: this.identitySnapshot !== null,
        },
        config.badge,
      );
      this.badgeInstance.mount();
    }

    if (config.watcher) {
      this.watcherInstance = new Watcher({
        onIncident: (incident) => {
          this.hooks.emit("incident", incident);
          this.badgeInstance?.setStatus("degraded");
        },
        onMetrics: (snapshot) => {
          this.hooks.emit("metrics", snapshot);
          const healthScore = this.watcherInstance?.health().healthScore ?? 0;
          if (healthScore >= 80) this.badgeInstance?.setStatus("verified");
        },
      });
      this.watcherInstance.start();
    }

    for (const plugin of config.plugins ?? []) {
      plugin.setup({ config, registerHook: this.hooks.register });
    }
  }

  identity() {
    return {
      get: (): IdentitySnapshot | null => this.identitySnapshot,
      refresh: (): IdentitySnapshot => {
        this.identitySnapshot = createIdentitySnapshot(this.config);
        return this.identitySnapshot;
      },
      verify: (): boolean => this.identitySnapshot !== null,
      export: (): string => JSON.stringify(this.identitySnapshot, null, 2),
    };
  }

  logger(): Logger | null {
    return this.loggerInstance;
  }

  notifications(): NotificationCenter | null {
    return this.notificationCenter;
  }

  watcher(): Watcher | null {
    return this.watcherInstance;
  }

  badge(): Badge | null {
    return this.badgeInstance;
  }

  verify(): boolean {
    return this.identitySnapshot !== null;
  }

  shutdown(): void {
    this.watcherInstance?.stop();
    this.badgeInstance?.unmount();
  }
}

let instance: AppBuildersInstance | null = null;

export function init(config: AppBuildersConfig): AppBuildersInstance {
  instance = new AppBuildersInstance(config);
  return instance;
}

export function getInstance(): AppBuildersInstance {
  if (!instance) {
    throw new Error(
      "@appbuildersph/core: AppBuilders.init() must be called before using the SDK.",
    );
  }
  return instance;
}
