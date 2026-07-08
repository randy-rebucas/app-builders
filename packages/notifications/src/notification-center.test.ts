import { describe, expect, it, vi } from "vitest";
import { NotificationCenter } from "./notification-center.js";
import type { Channel, Notification } from "./types.js";

class RecordingChannel implements Channel {
  readonly name: string;
  received: Notification[] = [];
  constructor(name = "recording") {
    this.name = name;
  }
  send(notification: Notification): void {
    this.received.push(notification);
  }
}

describe("NotificationCenter", () => {
  it("dispatches to all registered channels by default", async () => {
    const a = new RecordingChannel("a");
    const b = new RecordingChannel("b");
    const center = new NotificationCenter({ channels: [a, b] });

    await center.critical("DB down", "connection pool exhausted");

    expect(a.received).toHaveLength(1);
    expect(b.received).toHaveLength(1);
  });

  it("routes by notification type when routing is configured", async () => {
    const securityChannel = new RecordingChannel("security");
    const generalChannel = new RecordingChannel("general");
    const center = new NotificationCenter({
      channels: [generalChannel],
      routing: { security: [securityChannel] },
    });

    await center.security("Brute force detected", "10 failed logins in 1 minute");
    await center.information("Deploy finished", "v1.2.3 is live");

    expect(securityChannel.received).toHaveLength(1);
    expect(generalChannel.received).toHaveLength(1);
    expect(generalChannel.received[0]?.type).toBe("information");
  });

  it("all convenience methods produce the correct notification type", async () => {
    const channel = new RecordingChannel();
    const center = new NotificationCenter({ channels: [channel] });

    await center.success("s", "s");
    await center.warning("w", "w");
    await center.performance("p", "p");
    await center.deployment("d", "d");
    await center.incident("i", "i");
    await center.aiRecommendation("ai", "ai");

    expect(channel.received.map((n) => n.type)).toEqual([
      "success",
      "warning",
      "performance",
      "deployment",
      "incident",
      "ai-recommendation",
    ]);
  });

  it("calls onError and continues when a channel throws", async () => {
    const onError = vi.fn();
    const failing: Channel = {
      name: "failing",
      send: () => {
        throw new Error("delivery failed");
      },
    };
    const succeeding = new RecordingChannel();
    const center = new NotificationCenter({ channels: [failing, succeeding], onError });

    await center.warning("title", "message");

    expect(onError).toHaveBeenCalledTimes(1);
    expect(succeeding.received).toHaveLength(1);
  });

  it("getHistory() filters by type and respects historySize as a ring buffer", async () => {
    const center = new NotificationCenter({ channels: [], historySize: 2 });

    await center.information("one", "one");
    await center.warning("two", "two");
    await center.critical("three", "three");

    expect(center.getHistory()).toHaveLength(2);
    expect(center.getHistory().map((n) => n.title)).toEqual(["two", "three"]);
    expect(center.getHistory("critical")).toHaveLength(1);
  });

  it("clearHistory() empties the buffer", async () => {
    const center = new NotificationCenter({ channels: [] });
    await center.information("one", "one");
    center.clearHistory();
    expect(center.getHistory()).toHaveLength(0);
  });
});
