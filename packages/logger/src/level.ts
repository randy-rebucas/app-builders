import type { LogLevel } from "@appbuildersph/shared";

/** Severity order, low to high. "audit" and "security" are treated as high-priority. */
const LEVEL_WEIGHT: Record<LogLevel, number> = {
  debug: 0,
  info: 1,
  warning: 2,
  error: 3,
  audit: 4,
  security: 4,
  critical: 5,
};

export function meetsMinLevel(level: LogLevel, minLevel: LogLevel): boolean {
  return LEVEL_WEIGHT[level] >= LEVEL_WEIGHT[minLevel];
}
