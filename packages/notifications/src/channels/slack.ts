import { emojiFor } from "../format.js";
import { postJson } from "../http.js";
import type { Channel, Notification } from "../types.js";

export interface SlackChannelOptions {
  webhookUrl: string;
}

export class SlackChannel implements Channel {
  readonly name = "slack";
  constructor(private readonly options: SlackChannelOptions) {}

  async send(notification: Notification): Promise<void> {
    await postJson(this.options.webhookUrl, {
      text: `${emojiFor(notification.type)} *${notification.title}*\n${notification.message}`,
    });
  }
}
