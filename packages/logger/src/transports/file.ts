import { appendFile, mkdir, rename, stat } from "node:fs/promises";
import { createReadStream, createWriteStream } from "node:fs";
import { createGzip } from "node:zlib";
import { pipeline } from "node:stream/promises";
import { dirname } from "node:path";
import type { LoggerEntry, Transport } from "../types.js";

export interface FileTransportOptions {
  filePath: string;
  /** Rotate once the file exceeds this many bytes. Default 10 MiB. */
  maxBytes?: number;
  /** Gzip the rotated file. Default true. */
  compress?: boolean;
}

/** Plain-text file transport with size-based rotation and optional gzip compression. */
export class FileTransport implements Transport {
  readonly name = "file";
  private readonly filePath: string;
  private readonly maxBytes: number;
  private readonly compress: boolean;
  private ready: Promise<void>;
  private rotating: Promise<void> = Promise.resolve();

  constructor(options: FileTransportOptions) {
    this.filePath = options.filePath;
    this.maxBytes = options.maxBytes ?? 10 * 1024 * 1024;
    this.compress = options.compress ?? true;
    this.ready = mkdir(dirname(this.filePath), { recursive: true }).then(() => undefined);
  }

  async write(entry: LoggerEntry): Promise<void> {
    await this.ready;
    await this.rotating;
    await this.rotateIfNeeded();

    const line = `${entry.timestamp} [${entry.level.toUpperCase()}] ${entry.message}${
      entry.context ? ` ${JSON.stringify(entry.context)}` : ""
    }\n`;
    await appendFile(this.filePath, line, "utf8");
  }

  private async rotateIfNeeded(): Promise<void> {
    const size = await stat(this.filePath)
      .then((s) => s.size)
      .catch(() => 0);
    if (size < this.maxBytes) return;

    this.rotating = this.rotate();
    await this.rotating;
  }

  private async rotate(): Promise<void> {
    const rotatedPath = `${this.filePath}.${Date.now()}`;
    await rename(this.filePath, rotatedPath);

    if (this.compress) {
      await pipeline(
        createReadStream(rotatedPath),
        createGzip(),
        createWriteStream(`${rotatedPath}.gz`),
      );
      const { unlink } = await import("node:fs/promises");
      await unlink(rotatedPath);
    }
  }
}
