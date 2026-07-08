import { afterEach, describe, expect, it, vi } from "vitest";
import { DiscordChannel } from "./discord.js";
import { SlackChannel } from "./slack.js";
import { TeamsChannel } from "./teams.js";
import { TelegramChannel } from "./telegram.js";
import { ToastChannel } from "./toast.js";
import { WebhookChannel } from "./webhook.js";
import type { Notification } from "../types.js";

function makeNotification(overrides: Partial<Notification> = {}): Notification {
  return {
    id: "n1",
    type: "critical",
    title: "Database down",
    message: "Connection pool exhausted",
    timestamp: "2026-01-01T00:00:00.000Z",
    ...overrides,
  };
}

describe("outbound channels", () => {
  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("WebhookChannel posts the raw notification as JSON", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const channel = new WebhookChannel({ url: "https://example.com/hook" });
    const notification = makeNotification();
    await channel.send(notification);

    expect(fetchMock).toHaveBeenCalledWith(
      "https://example.com/hook",
      expect.objectContaining({ method: "POST" }),
    );
    const body = JSON.parse(fetchMock.mock.calls[0]?.[1].body);
    expect(body).toEqual(notification);
  });

  it("SlackChannel formats a text payload", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const channel = new SlackChannel({ webhookUrl: "https://hooks.slack.com/x" });
    await channel.send(makeNotification());

    const body = JSON.parse(fetchMock.mock.calls[0]?.[1].body);
    expect(body.text).toContain("Database down");
    expect(body.text).toContain("Connection pool exhausted");
  });

  it("DiscordChannel formats an embed", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const channel = new DiscordChannel({ webhookUrl: "https://discord.com/api/webhooks/x" });
    await channel.send(makeNotification());

    const body = JSON.parse(fetchMock.mock.calls[0]?.[1].body);
    expect(body.embeds[0].title).toContain("Database down");
    expect(typeof body.embeds[0].color).toBe("number");
  });

  it("TeamsChannel formats a MessageCard", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const channel = new TeamsChannel({ webhookUrl: "https://outlook.office.com/webhook/x" });
    await channel.send(makeNotification());

    const body = JSON.parse(fetchMock.mock.calls[0]?.[1].body);
    expect(body["@type"]).toBe("MessageCard");
    expect(body.text).toBe("Connection pool exhausted");
  });

  it("TelegramChannel posts to the bot API with chat_id", async () => {
    const fetchMock = vi.fn().mockResolvedValue({ ok: true, status: 200 });
    vi.stubGlobal("fetch", fetchMock);

    const channel = new TelegramChannel({ botToken: "123:ABC", chatId: "42" });
    await channel.send(makeNotification());

    expect(fetchMock).toHaveBeenCalledWith(
      "https://api.telegram.org/bot123:ABC/sendMessage",
      expect.anything(),
    );
    const body = JSON.parse(fetchMock.mock.calls[0]?.[1].body);
    expect(body.chat_id).toBe("42");
  });

  it("throws when the delivery HTTP call fails", async () => {
    vi.stubGlobal("fetch", vi.fn().mockResolvedValue({ ok: false, status: 500 }));
    const channel = new WebhookChannel({ url: "https://example.com/hook" });

    await expect(channel.send(makeNotification())).rejects.toThrow(/status 500/);
  });

  it("ToastChannel dispatches to subscribers without network I/O", () => {
    const channel = new ToastChannel();
    const received: Notification[] = [];
    const unsubscribe = channel.subscribe((n) => received.push(n));

    channel.send(makeNotification());
    expect(received).toHaveLength(1);

    unsubscribe();
    channel.send(makeNotification({ id: "n2" }));
    expect(received).toHaveLength(1);
  });
});
