import { init, getInstance } from "./app-builders.js";

export const AppBuilders = {
  init,
  verify: () => getInstance().verify(),
  identity: () => getInstance().identity(),
  logger: () => getInstance().logger(),
  notifications: () => getInstance().notifications(),
  watcher: () => getInstance().watcher(),
  badge: () => getInstance().badge(),
  shutdown: () => getInstance().shutdown(),
};

export type { AppBuildersInstance } from "./app-builders.js";
export * from "@appbuildersph/shared";
