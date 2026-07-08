import { init, getInstance } from "./app-builders.js";

export const AppBuilders = {
  init,
  verify: () => getInstance().verify(),
  identity: () => getInstance().identity(),
};

export type { AppBuildersInstance } from "./app-builders.js";
export * from "@appbuildersph/shared";
