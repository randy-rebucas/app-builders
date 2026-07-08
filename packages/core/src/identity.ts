import { createHash, randomUUID } from "node:crypto";
import { hostname } from "node:os";
import type { AppBuildersConfig, IdentitySnapshot } from "@appbuildersph/shared";
import { nowIso, resolveEnvironment } from "@appbuildersph/shared";

export function createIdentitySnapshot(config: AppBuildersConfig): IdentitySnapshot {
  const timestamp = nowIso();
  const environment = config.environment ?? resolveEnvironment();

  const base: Omit<IdentitySnapshot, "verificationHash"> = {
    appUuid: randomUUID(),
    projectUuid: randomUUID(),
    developerId: config.developer,
    organizationId: config.organization,
    hostname: hostname(),
    domain: process.env.APPBUILDERS_DOMAIN,
    environment,
    gitCommit: process.env.GIT_COMMIT ?? process.env.VERCEL_GIT_COMMIT_SHA,
    gitBranch: process.env.GIT_BRANCH ?? process.env.VERCEL_GIT_COMMIT_REF,
    buildNumber: process.env.BUILD_NUMBER,
    packageVersion: process.env.npm_package_version,
    deploymentProvider: process.env.VERCEL ? "vercel" : undefined,
    timestamp,
  };

  const verificationHash = createHash("sha256")
    .update(JSON.stringify(base))
    .digest("hex");

  return { ...base, verificationHash };
}
