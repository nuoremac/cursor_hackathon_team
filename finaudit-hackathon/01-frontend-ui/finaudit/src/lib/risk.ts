import type { RiskLevel } from "./types";
import type { TranslationKey } from "./i18n";

export type RiskKind = RiskLevel | "normal";

export const RISK_COLOR: Record<RiskKind, string> = {
  high: "var(--danger)",
  medium: "var(--warning)",
  low: "var(--info)",
  normal: "var(--success)",
};

export const RISK_BADGE_CLASS: Record<RiskKind, string> = {
  high: "badge-high",
  medium: "badge-medium",
  low: "badge-low",
  normal: "badge-normal",
};

export const RISK_ROW_CLASS: Record<RiskLevel, string> = {
  high: "row-high",
  medium: "row-medium",
  low: "row-low",
};

export const RISK_LABEL_KEY: Record<RiskKind, TranslationKey> = {
  high: "risk.high",
  medium: "risk.medium",
  low: "risk.low",
  normal: "risk.normal",
};

export const RISK_SHORT_KEY: Record<RiskKind, TranslationKey> = {
  high: "risk.highShort",
  medium: "risk.mediumShort",
  low: "risk.lowShort",
  normal: "risk.normalShort",
};

export const RISK_ARIA_KEY: Record<RiskKind, TranslationKey> = {
  high: "risk.ariaHigh",
  medium: "risk.ariaMedium",
  low: "risk.ariaLow",
  normal: "risk.ariaNormal",
};
