import type { LogLevel } from "@appbuildersph/shared";
import type { LoggerEntry, Transport } from "../types.js";

const COLOR: Partial<Record<LogLevel, string>> = {
  debug: "\x1b[90m",
  info: "\x1b[36m",
  warning: "\x1b[33m",
  error: "\x1b[31m",
  critical: "\x1b[41m",
  audit: "\x1b[35m",
  security: "\x1b[35m",
};
const RESET = "\x1b[0m";

export interface ConsoleTransportOptions {
  colors?: boolean;
}

export class ConsoleTransport implements Transport {
  readonly name = "console";
  private readonly colors: boolean;

  constructor(options: ConsoleTransportOptions = {}) {
    this.colors = options.colors ?? true;
  }

  write(entry: LoggerEntry): void {
    const tag = `[${entry.level.toUpperCase()}]${entry.category ? ` (${entry.category})` : ""}`;
    const line = `${entry.timestamp} ${tag} ${entry.message}`;
    const output = this.colors ? `${COLOR[entry.level] ?? ""}${line}${RESET}` : line;

    const method =
      entry.level === "critical" || entry.level === "error"
        ? console.error
        : entry.level === "warning"
          ? console.warn
          : console.log;

    method(output, entry.context ?? "");
  }
}
