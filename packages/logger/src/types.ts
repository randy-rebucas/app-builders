import type { LogEntry, LogLevel } from "@appbuildersph/shared";

export type LogCategory =
  | "authentication"
  | "database"
  | "api"
  | "performance"
  | "system"
  | "crash"
  | string;

export interface LoggerEntry extends LogEntry {
  category?: LogCategory;
}

export interface Transport {
  name: string;
  write(entry: LoggerEntry): void | Promise<void>;
}

export interface LoggerOptions {
  /** Minimum severity that reaches transports. Entries below this are dropped. */
  minLevel?: LogLevel;
  transports?: Transport[];
  /** Max entries kept in the in-memory ring buffer for query()/export(). */
  bufferSize?: number;
  category?: LogCategory;
}

export interface LogQuery {
  level?: LogLevel;
  category?: LogCategory;
  search?: string;
  from?: Date | string;
  to?: Date | string;
}
