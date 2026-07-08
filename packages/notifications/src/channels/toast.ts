import type { Channel, Notification } from "../types.js";

export type ToastListener = (notification: Notification) => void;

/**
 * In-process channel for UI surfaces (badge/dashboard) to subscribe to and render
 * as toasts. No network I/O — just an in-memory pub/sub.
 */
export class ToastChannel implements Channel {
  readonly name = "toast";
  private readonly listeners = new Set<ToastListener>();

  subscribe(listener: ToastListener): () => void {
    this.listeners.add(listener);
    return () => this.listeners.delete(listener);
  }

  send(notification: Notification): void {
    for (const listener of this.listeners) listener(notification);
  }
}
