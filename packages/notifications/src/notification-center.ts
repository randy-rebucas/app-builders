import { randomUUID } from "node:crypto";
import type { Channel, Notification, NotificationType } from "./types.js";

export interface NotificationCenterOptions {
  channels?: Channel[];
  /** Number of notifications kept in memory for the dashboard/history query. Default 500. */
  historySize?: number;
  /** Only these types are dispatched to channels. Default: all types. */
  routing?: Partial<Record<NotificationType, Channel[]>>;
  onError?: (error: unknown, channel: Channel, notification: Notification) => void;
}

export class NotificationCenter {
  private readonly channels: Channel[];
  private readonly historySize: number;
  private readonly routing: Partial<Record<NotificationType, Channel[]>>;
  private readonly onError?: NotificationCenterOptions["onError"];
  private history: Notification[] = [];

  constructor(options: NotificationCenterOptions = {}) {
    this.channels = options.channels ?? [];
    this.historySize = options.historySize ?? 500;
    this.routing = options.routing ?? {};
    this.onError = options.onError;
  }

  addChannel(channel: Channel): void {
    this.channels.push(channel);
  }

  async notify(
    type: NotificationType,
    title: string,
    message: string,
    context?: Record<string, unknown>,
  ): Promise<Notification> {
    const notification: Notification = {
      id: randomUUID(),
      type,
      title,
      message,
      context,
      timestamp: new Date().toISOString(),
    };

    this.history.push(notification);
    if (this.history.length > this.historySize) this.history.shift();

    const targets = this.routing[type] ?? this.channels;
    await Promise.all(
      targets.map(async (channel) => {
        try {
          await channel.send(notification);
        } catch (error) {
          this.onError?.(error, channel, notification);
        }
      }),
    );

    return notification;
  }

  success(title: string, message: string, context?: Record<string, unknown>) {
    return this.notify("success", title, message, context);
  }
  information(title: string, message: string, context?: Record<string, unknown>) {
    return this.notify("information", title, message, context);
  }
  warning(title: string, message: string, context?: Record<string, unknown>) {
    return this.notify("warning", title, message, context);
  }
  critical(title: string, message: string, context?: Record<string, unknown>) {
    return this.notify("critical", title, message, context);
  }
  security(title: string, message: string, context?: Record<string, unknown>) {
    return this.notify("security", title, message, context);
  }
  performance(title: string, message: string, context?: Record<string, unknown>) {
    return this.notify("performance", title, message, context);
  }
  deployment(title: string, message: string, context?: Record<string, unknown>) {
    return this.notify("deployment", title, message, context);
  }
  incident(title: string, message: string, context?: Record<string, unknown>) {
    return this.notify("incident", title, message, context);
  }
  aiRecommendation(title: string, message: string, context?: Record<string, unknown>) {
    return this.notify("ai-recommendation", title, message, context);
  }

  getHistory(type?: NotificationType): Notification[] {
    return type ? this.history.filter((n) => n.type === type) : [...this.history];
  }

  clearHistory(): void {
    this.history = [];
  }
}
