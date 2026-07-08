export type Environment = "development" | "staging" | "production" | "test";

export type Theme = "dark" | "light" | "system";

export type BadgePosition =
  | "bottom-right"
  | "bottom-left"
  | "top-right"
  | "top-left";

export interface BadgeConfig {
  enabled?: boolean;
  theme?: Theme;
  position?: BadgePosition;
  animation?: boolean;
  expandable?: boolean;
}

export interface AppBuildersConfig {
  appName: string;
  organization?: string;
  developer?: string;
  environment?: Environment;
  badge?: boolean | BadgeConfig;
  identity?: boolean;
  watcher?: boolean;
  logger?: boolean;
  notifications?: boolean;
  security?: boolean;
  dashboard?: boolean;
  ai?: boolean;
  plugins?: AppBuildersPlugin[];
  theme?: Theme;
}

export interface AppBuildersPlugin {
  name: string;
  setup: (ctx: PluginContext) => void | Promise<void>;
}

export interface PluginContext {
  config: AppBuildersConfig;
  registerHook: (event: string, handler: (...args: unknown[]) => void) => void;
}

export interface IdentitySnapshot {
  appUuid: string;
  projectUuid: string;
  developerId?: string;
  organizationId?: string;
  hostname?: string;
  domain?: string;
  environment: Environment;
  gitCommit?: string;
  gitBranch?: string;
  buildNumber?: string;
  packageVersion?: string;
  deploymentProvider?: string;
  timestamp: string;
  verificationHash: string;
}

export interface HealthReport {
  healthScore: number;
  performanceScore: number;
  uptimeSeconds: number;
  lastSync: string;
}

export interface SecurityReport {
  securityScore: number;
  threatLevel: "none" | "low" | "medium" | "high" | "critical";
  recommendations: string[];
}

export type LogLevel =
  | "info"
  | "debug"
  | "warning"
  | "error"
  | "critical"
  | "audit"
  | "security";

export interface LogEntry {
  level: LogLevel;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}
