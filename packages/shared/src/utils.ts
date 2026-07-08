import { randomUUID } from "node:crypto";

export function generateUuid(): string {
  return randomUUID();
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function resolveEnvironment(): "development" | "staging" | "production" | "test" {
  const env = process.env.NODE_ENV;
  if (env === "production" || env === "test" || env === "staging") return env;
  return "development";
}
