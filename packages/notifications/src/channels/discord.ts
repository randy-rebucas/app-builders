import { colorIntFor, emojiFor } from "../format.js";
import { postJson } from "../http.js";
import type { Channel, Notification } from "../types.js";

export interface DiscordChannelOptions {
  webhookUrl: string;
}

export class DiscordChannel implements Channel {
  readonly name = "discord";
  constructor(private readonly options: DiscordChannelOptions) {}

  async send(notification: Notification): Promise<void> {
    await postJson(this.options.webhookUrl, {
      embeds: [
        {
          title: `${emojiFor(notification.type)} ${notification.title}`,
          description: notification.message,
          color: colorIntFor(notification.type),
          timestamp: notification.timestamp,
        },
      ],
    });
  }
}
