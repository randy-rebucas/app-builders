export type NotificationType =
  | "success"
  | "information"
  | "warning"
  | "critical"
  | "security"
  | "performance"
  | "deployment"
  | "incident"
  | "ai-recommendation";

export interface Notification {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  context?: Record<string, unknown>;
}

export interface Channel {
  name: string;
  send(notification: Notification): void | Promise<void>;
}
