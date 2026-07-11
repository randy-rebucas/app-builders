import type { BadgeIdentityInfo, BadgeStatus, ResolvedBadgeConfig } from "./types.js";
import { resolveBadgeStatus } from "./types.js";

const POSITION_STYLES: Record<ResolvedBadgeConfig["position"], string> = {
  "bottom-right": "bottom:16px;right:16px;",
  "bottom-left": "bottom:16px;left:16px;",
  "top-right": "top:16px;right:16px;",
  "top-left": "top:16px;left:16px;",
};

const STATUS_COLORS: Record<BadgeStatus, string> = {
  verified: "#22c55e",
  degraded: "#f59e0b",
  unverified: "#94a3b8",
  offline: "#ef4444",
};

const PH_FLAG_LOGO = `<svg class="ab-badge__logo" viewBox="0 0 24 16" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="PH flag">
  <rect width="24" height="8" y="0" fill="#0038a8" />
  <rect width="24" height="8" y="8" fill="#ce1126" />
  <path d="M0 0 L9 8 L0 16 Z" fill="#fff" />
  <circle cx="3.4" cy="8" r="1.4" fill="#fcd116" />
</svg>`;

function resolveTheme(theme: ResolvedBadgeConfig["theme"]): "dark" | "light" {
  if (theme !== "system") return theme;
  if (typeof window !== "undefined" && window.matchMedia) {
    return window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
  }
  return "dark";
}

export function template(config: ResolvedBadgeConfig, identity: BadgeIdentityInfo): string {
  const theme = resolveTheme(config.theme);
  const status = resolveBadgeStatus(identity);
  const details = [identity.appName, identity.organization, identity.environment]
    .filter(Boolean)
    .join(" · ");
  const link = config.verifyUrl
    ? `<a class="ab-badge__link" href="${config.verifyUrl}" target="_blank" rel="noopener noreferrer">Learn more →</a>`
    : "";
  const logo = config.logoUrl
    ? `<img class="ab-badge__logo" src="${config.logoUrl}" alt="" />`
    : PH_FLAG_LOGO;

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
      .ab-badge__logo {
        width: 14px;
        height: 14px;
        border-radius: 3px;
        object-fit: contain;
        flex-shrink: 0;
      }
      .ab-badge__dot {
        width: 6px;
        height: 6px;
        border-radius: 50%;
        background: ${STATUS_COLORS[status]};
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
      .ab-badge__link {
        margin-left: 6px;
        color: inherit;
        opacity: 0.9;
        text-decoration: underline;
      }
    </style>
    <div class="ab-badge" part="badge">
      ${logo}
      <span class="ab-badge__dot"></span>
      <span>Verified by App Builders PH</span>
      <span class="ab-badge__details">${details}${link}</span>
    </div>
  `;
}
