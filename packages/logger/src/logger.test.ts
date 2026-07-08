import { describe, expect, it } from "vitest";
import { Logger } from "./logger.js";
import type { LoggerEntry, Transport } from "./types.js";

class MemoryTransport implements Transport {
  readonly name = "memory";
  entries: LoggerEntry[] = [];
  write(entry: LoggerEntry): void {
    this.entries.push(entry);
  }
}

describe("Logger", () => {
  it("dispatches entries to all configured transports", () => {
    const transport = new MemoryTransport();
    const logger = new Logger({ transports: [transport] });

    logger.info("hello");

    expect(transport.entries).toHaveLength(1);
    expect(transport.entries[0]?.message).toBe("hello");
    expect(transport.entries[0]?.level).toBe("info");
  });

  it("drops entries below minLevel", () => {
    const transport = new MemoryTransport();
    const logger = new Logger({ transports: [transport], minLevel: "error" });

    logger.debug("noisy");
    logger.info("also noisy");
    logger.error("this matters");

    expect(transport.entries).toHaveLength(1);
    expect(transport.entries[0]?.message).toBe("this matters");
  });

  it("supports all level convenience methods", () => {
    const transport = new MemoryTransport();
    const logger = new Logger({ transports: [transport] });

    logger.debug("d");
    logger.info("i");
    logger.warning("w");
    logger.error("e");
    logger.critical("c");
    logger.audit("a");
    logger.security("s");

    expect(transport.entries.map((e) => e.level)).toEqual([
      "debug",
      "info",
      "warning",
      "error",
      "critical",
      "audit",
      "security",
    ]);
  });

  it("child() tags entries with a category and shares the buffer", () => {
    const transport = new MemoryTransport();
    const logger = new Logger({ transports: [transport] });
    const dbLogger = logger.child("database");

    logger.info("root entry");
    dbLogger.warning("slow query");

    expect(logger.query({ category: "database" })).toHaveLength(1);
    expect(logger.query({ category: "database" })[0]?.message).toBe("slow query");
  });

  it("query() filters by level, search text, and time range", () => {
    const logger = new Logger({ transports: [] });
    logger.info("user login succeeded");
    logger.error("user login failed");

    expect(logger.query({ level: "error" })).toHaveLength(1);
    expect(logger.query({ search: "succeeded" })).toHaveLength(1);
    expect(logger.query({ search: "login" })).toHaveLength(2);
    expect(logger.query({ from: new Date(Date.now() + 60_000) })).toHaveLength(0);
  });

  it("groupByCategory() groups buffered entries", () => {
    const logger = new Logger({ transports: [] });
    logger.child("api").info("request handled");
    logger.child("database").error("connection lost");
    logger.info("uncategorized entry");

    const grouped = logger.groupByCategory();
    expect(grouped.api).toHaveLength(1);
    expect(grouped.database).toHaveLength(1);
    expect(grouped.uncategorized).toHaveLength(1);
  });

  it("export() returns JSON or plain text", () => {
    const logger = new Logger({ transports: [] });
    logger.info("exportable");

    const json = JSON.parse(logger.export("json")) as unknown[];
    expect(json).toHaveLength(1);

    const text = logger.export("text");
    expect(text).toContain("[INFO] exportable");
  });

  it("respects bufferSize as a ring buffer", () => {
    const logger = new Logger({ transports: [], bufferSize: 2 });
    logger.info("one");
    logger.info("two");
    logger.info("three");

    const all = logger.query();
    expect(all).toHaveLength(2);
    expect(all.map((e) => e.message)).toEqual(["two", "three"]);
  });
});
