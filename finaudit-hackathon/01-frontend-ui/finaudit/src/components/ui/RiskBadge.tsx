"use client";

import {
  IconAlertTriangle,
  IconAlertCircle,
  IconInfoCircle,
  IconCircleCheck,
} from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import {
  RISK_ARIA_KEY,
  RISK_BADGE_CLASS,
  RISK_SHORT_KEY,
  type RiskKind,
} from "@/lib/risk";

const RISK_ICON: Record<RiskKind, typeof IconAlertTriangle> = {
  high: IconAlertCircle,
  medium: IconAlertTriangle,
  low: IconInfoCircle,
  normal: IconCircleCheck,
};

type RiskBadgeProps = {
  risk: RiskKind;
  withIcon?: boolean;
};

export function RiskBadge({ risk, withIcon = true }: RiskBadgeProps) {
  const { t } = useApp();
  const Icon = RISK_ICON[risk];
  return (
    <span
      className={`badge ${RISK_BADGE_CLASS[risk]}`}
      role="status"
      aria-label={t(RISK_ARIA_KEY[risk])}
    >
      {withIcon ? <Icon size={12} stroke={2} aria-hidden /> : null}
      {t(RISK_SHORT_KEY[risk])}
    </span>
  );
}
