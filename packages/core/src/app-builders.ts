import type { AppBuildersConfig, IdentitySnapshot } from "@appbuildersph/shared";
import { createIdentitySnapshot } from "./identity.js";

export class AppBuildersInstance {
  readonly config: AppBuildersConfig;
  private identitySnapshot: IdentitySnapshot | null = null;

  constructor(config: AppBuildersConfig) {
    this.config = config;

    if (config.identity ?? true) {
      this.identitySnapshot = createIdentitySnapshot(config);
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

  verify(): boolean {
    return this.identitySnapshot !== null;
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
