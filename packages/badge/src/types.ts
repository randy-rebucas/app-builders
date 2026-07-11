import type { BadgeConfig, BadgePosition, Environment, Theme } from "@appbuildersph/shared";

export type BadgeStatus = "verified" | "degraded" | "offline" | "unverified";

export interface BadgeIdentityInfo {
  appName: string;
  organization?: string;
  developer?: string;
  environment?: Environment;
  verified?: boolean;
  status?: BadgeStatus;
}

export function resolveBadgeStatus(identity: BadgeIdentityInfo): BadgeStatus {
  return identity.status ?? (identity.verified ? "verified" : "unverified");
}

export interface ResolvedBadgeConfig {
  theme: Theme;
  position: BadgePosition;
  animation: boolean;
  expandable: boolean;
  verifyUrl?: string;
  logoUrl?: string;
}

export const DEFAULT_BADGE_CONFIG: ResolvedBadgeConfig = {
  theme: "system",
  position: "bottom-right",
  animation: true,
  expandable: true,
};

export function resolveBadgeConfig(input?: boolean | BadgeConfig): ResolvedBadgeConfig | null {
  if (input === false) return null;
  if (input === undefined || input === true) return { ...DEFAULT_BADGE_CONFIG };
  if (input.enabled === false) return null;

  return {
    theme: input.theme ?? DEFAULT_BADGE_CONFIG.theme,
    position: input.position ?? DEFAULT_BADGE_CONFIG.position,
    animation: input.animation ?? DEFAULT_BADGE_CONFIG.animation,
    expandable: input.expandable ?? DEFAULT_BADGE_CONFIG.expandable,
    verifyUrl: input.verifyUrl,
    logoUrl: input.logoUrl,
  };
}
