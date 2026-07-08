import type { BadgeIdentityInfo, ResolvedBadgeConfig } from "./types.js";

const POSITION_STYLES: Record<ResolvedBadgeConfig["position"], string> = {
  "bottom-right": "bottom:16px;right:16px;",
  "bottom-left": "bottom:16px;left:16px;",
  "top-right": "top:16px;right:16px;",
  "top-left": "top:16px;left:16px;",
};

function resolveTheme(theme: ResolvedBadgeConfig["theme"]): "dark" | "light" {
  if (theme !== "system") return theme;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
}

export function template(config: ResolvedBadgeConfig, identity: BadgeIdentityInfo): string {
  const theme = resolveTheme(config.theme);
  const details = [identity.appName, identity.organization, identity.environment]
    .filter(Boolean)
    .join(" · ");

  return `
    <style>
      :host { all: initial; }
      .ab-badge {
        position: fixed;
        ${POSITION_STYLES[config.position]}
        z-index: 2147483647;
        display: flex;
        align-items: center;
        gap: 6px;
        padding: 6px 10px;
        border-radius: 999px;
        font-family: system-ui, -apple-system, sans-serif;
        font-size: 12px;
        line-height: 1.4;
        background: ${theme === "dark" ? "#111" : "#fff"};
        color: ${theme === "dark" ? "#fff" : "#111"};
        box-shadow: 0 2px 8px rgba(0, 0, 0, 0.25);
        cursor: ${config.expandable ? "pointer" : "default"};
        transition: ${config.animation ? "all 0.2s ease" : "none"};
        user-select: none;
      }
      .ab-badge__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${identity.verified ? "#22c55e" : "#94a3b8"};
        flex-shrink: 0;
      }
      .ab-badge__details {
        display: none;
        margin-left: 4px;
        opacity: 0.75;
        white-space: nowrap;
      }
      .ab-badge--expanded .ab-badge__details {
        display: inline;
      }
    </style>
    <div class="ab-badge" part="badge">
      <span class="ab-badge__dot"></span>
      <span>Verified by App Builders PH</span>
      <span class="ab-badge__details">${details}</span>
    </div>
  `;
}
