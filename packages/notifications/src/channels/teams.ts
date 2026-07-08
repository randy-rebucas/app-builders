import { colorHexFor, emojiFor } from "../format.js";
import { postJson } from "../http.js";
import type { Channel, Notification } from "../types.js";

export interface TeamsChannelOptions {
  webhookUrl: string;
}

export class TeamsChannel implements Channel {
  readonly name = "teams";
  constructor(private readonly options: TeamsChannelOptions) {}

  async send(notification: Notification): Promise<void> {
    await postJson(this.options.webhookUrl, {
      "@type": "MessageCard",
      "@context": "http://schema.org/extensions",
      themeColor: colorHexFor(notification.type),
      title: `${emojiFor(notification.type)} ${notification.title}`,
      text: notification.message,
    });
  }
}
