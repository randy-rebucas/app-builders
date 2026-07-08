import { template } from "./template.js";
import type { BadgeIdentityInfo, ResolvedBadgeConfig } from "./types.js";

export const BADGE_TAG = "appbuilders-badge";

let registered = false;

export function defineBadgeElement(): void {
  if (registered) return;
  if (typeof window === "undefined" || typeof HTMLElement === "undefined") return;
  if (customElements.get(BADGE_TAG)) {
    registered = true;
    return;
  }

  class AppBuildersBadgeElement extends HTMLElement {
    private readonly shadow: ShadowRoot;

    constructor() {
      super();
      this.shadow = this.attachShadow({ mode: "open" });
    }

    setConfig(config: ResolvedBadgeConfig, identity: BadgeIdentityInfo): void {
      this.shadow.innerHTML = template(config, identity);

      if (config.expandable) {
        this.shadow.querySelector(".ab-badge")?.addEventListener("click", (event) => {
          (event.currentTarget as HTMLElement).classList.toggle("ab-badge--expanded");
        });
      }
    }
  }

  customElements.define(BADGE_TAG, AppBuildersBadgeElement);
  registered = true;
}

export interface BadgeElement extends HTMLElement {
  setConfig(config: ResolvedBadgeConfig, identity: BadgeIdentityInfo): void;
}
