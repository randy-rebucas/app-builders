import { emojiFor } from "../format.js";
import { postJson } from "../http.js";
import type { Channel, Notification } from "../types.js";

export interface TelegramChannelOptions {
  botToken: string;
  chatId: string;
}

export class TelegramChannel implements Channel {
  readonly name = "telegram";
  constructor(private readonly options: TelegramChannelOptions) {}

  async send(notification: Notification): Promise<void> {
    const url = `https://api.telegram.org/bot${this.options.botToken}/sendMessage`;
    await postJson(url, {
      chat_id: this.options.chatId,
      text: `${emojiFor(notification.type)} ${notification.title}\n${notification.message}`,
    });
  }
}
