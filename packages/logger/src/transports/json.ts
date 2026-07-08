import { appendFile, mkdir } from "node:fs/promises";
import { dirname } from "node:path";
import type { LoggerEntry, Transport } from "../types.js";

export interface JsonTransportOptions {
  filePath: string;
}

/** Writes one JSON object per line (ndjson) — suited for log shipping/ingestion. */
export class JsonTransport implements Transport {
  readonly name = "json";
  private readonly filePath: string;
  private ready: Promise<void>;

  constructor(options: JsonTransportOptions) {
    this.filePath = options.filePath;
    this.ready = mkdir(dirname(this.filePath), { recursive: true }).then(() => undefined);
  }

  async write(entry: LoggerEntry): Promise<void> {
    await this.ready;
    await appendFile(this.filePath, `${JSON.stringify(entry)}\n`, "utf8");
  }
}
