import type { LogLevel } from "@appbuildersph/shared";
import { nowIso } from "@appbuildersph/shared";
import { meetsMinLevel } from "./level.js";
import { ConsoleTransport } from "./transports/console.js";
import type { LogCategory, LoggerEntry, LoggerOptions, LogQuery, Transport } from "./types.js";

export class Logger {
  private readonly transports: Transport[];
  private readonly minLevel: LogLevel;
  private readonly bufferSize: number;
  private readonly category?: LogCategory;
  private buffer: LoggerEntry[] = [];

  constructor(options: LoggerOptions = {}) {
    this.transports = options.transports ?? [new ConsoleTransport()];
    this.minLevel = options.minLevel ?? "debug";
    this.bufferSize = options.bufferSize ?? 1000;
    this.category = options.category;
  }

  /** Returns a logger scoped to a category, sharing this logger's transports and buffer. */
  child(category: LogCategory): Logger {
    const scoped = new Logger({
      transports: this.transports,
      minLevel: this.minLevel,
      bufferSize: this.bufferSize,
      category,
    });
    scoped.buffer = this.buffer;
    return scoped;
  }

  log(level: LogLevel, message: string, context?: Record<string, unknown>): void {
    if (!meetsMinLevel(level, this.minLevel)) return;

    const entry: LoggerEntry = {
      level,
      message,
      context,
      category: this.category,
      timestamp: nowIso(),
    };

    this.buffer.push(entry);
    if (this.buffer.length > this.bufferSize) this.buffer.shift();

    for (const transport of this.transports) {
      void transport.write(entry);
    }
  }

  debug(message: string, context?: Record<string, unknown>): void {
    this.log("debug", message, context);
  }
  info(message: string, context?: Record<string, unknown>): void {
    this.log("info", message, context);
  }
  warning(message: string, context?: Record<string, unknown>): void {
    this.log("warning", message, context);
  }
  error(message: string, context?: Record<string, unknown>): void {
    this.log("error", message, context);
  }
  critical(message: string, context?: Record<string, unknown>): void {
    this.log("critical", message, context);
  }
  audit(message: string, context?: Record<string, unknown>): void {
    this.log("audit", message, context);
  }
  security(message: string, context?: Record<string, unknown>): void {
    this.log("security", message, context);
  }

  /** Search/filter over the in-memory buffer (level, category, free-text, time range). */
  query(query: LogQuery = {}): LoggerEntry[] {
    const from = query.from ? new Date(query.from) : undefined;
    const to = query.to ? new Date(query.to) : undefined;

    return this.buffer.filter((entry) => {
      if (query.level && entry.level !== query.level) return false;
      if (query.category && entry.category !== query.category) return false;
      if (query.search && !entry.message.toLowerCase().includes(query.search.toLowerCase())) {
        return false;
      }
      const entryTime = new Date(entry.timestamp);
      if (from && entryTime < from) return false;
      if (to && entryTime > to) return false;
      return true;
    });
  }

  /** Groups buffered entries by category (or "uncategorized"). */
  groupByCategory(): Record<string, LoggerEntry[]> {
    return this.buffer.reduce<Record<string, LoggerEntry[]>>((groups, entry) => {
      const key = entry.category ?? "uncategorized";
      (groups[key] ??= []).push(entry);
      return groups;
    }, {});
  }

  export(format: "json" | "text" = "json"): string {
    if (format === "json") return JSON.stringify(this.buffer, null, 2);
    return this.buffer
      .map((e) => `${e.timestamp} [${e.level.toUpperCase()}] ${e.message}`)
      .join("\n");
  }

  clear(): void {
    this.buffer = [];
  }
}
