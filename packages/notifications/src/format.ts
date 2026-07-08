import type { NotificationType } from "./types.js";

const EMOJI: Record<NotificationType, string> = {
  success: "✅",
  information: "ℹ️",
  warning: "⚠️",
  critical: "🚨",
  security: "🛡️",
  performance: "⚡",
  deployment: "🚀",
  incident: "🔥",
  "ai-recommendation": "🤖",
};

const COLOR_HEX: Record<NotificationType, string> = {
  success: "2ECC71",
  information: "3498DB",
  warning: "F39C12",
  critical: "E74C3C",
  security: "9B59B6",
  performance: "1ABC9C",
  deployment: "2980B9",
  incident: "C0392B",
  "ai-recommendation": "8E44AD",
};

export function emojiFor(type: NotificationType): string {
  return EMOJI[type];
}

export function colorHexFor(type: NotificationType): string {
  return COLOR_HEX[type];
}

export function colorIntFor(type: NotificationType): number {
  return parseInt(COLOR_HEX[type], 16);
}
