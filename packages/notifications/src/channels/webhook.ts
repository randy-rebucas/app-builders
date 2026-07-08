import { postJson } from "../http.js";
import type { Channel, Notification } from "../types.js";

export interface WebhookChannelOptions {
  url: string;
}

/** Posts the raw notification payload as JSON — for custom/internal receivers. */
export class WebhookChannel implements Channel {
  readonly name = "webhook";
  constructor(private readonly options: WebhookChannelOptions) {}

  async send(notification: Notification): Promise<void> {
    await postJson(this.options.url, notification);
  }
}
