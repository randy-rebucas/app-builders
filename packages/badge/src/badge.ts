import type { BadgeConfig } from "@appbuildersph/shared";
import { BADGE_TAG, defineBadgeElement, type BadgeElement } from "./element.js";
import {
  resolveBadgeConfig,
  type BadgeIdentityInfo,
  type BadgeStatus,
  type ResolvedBadgeConfig,
} from "./types.js";

export class Badge {
  private readonly identity: BadgeIdentityInfo;
  private config: ResolvedBadgeConfig | null;
  private el: BadgeElement | null = null;

  constructor(identity: BadgeIdentityInfo, config?: boolean | BadgeConfig) {
    this.identity = identity;
    this.config = resolveBadgeConfig(config);
  }

  isMounted(): boolean {
    return this.el !== null;
  }

  mount(target?: Element): void {
    if (typeof document === "undefined") return;
    if (this.config === null) return;
    if (this.el) return;

    defineBadgeElement();
    const el = document.createElement(BADGE_TAG) as BadgeElement;
    el.setConfig(this.config, this.identity);
    (target ?? document.body).appendChild(el);
    this.el = el;
  }

  unmount(): void {
    if (!this.el) return;
    this.el.remove();
    this.el = null;
  }

  update(config?: boolean | BadgeConfig): void {
    this.config = resolveBadgeConfig(config);

    if (!this.el) return;
    if (this.config === null) {
      this.unmount();
      return;
    }
    this.el.setConfig(this.config, this.identity);
  }

  setStatus(status: BadgeStatus): void {
    this.identity.status = status;
    if (!this.el || !this.config) return;
    this.el.setConfig(this.config, this.identity);
  }
}
