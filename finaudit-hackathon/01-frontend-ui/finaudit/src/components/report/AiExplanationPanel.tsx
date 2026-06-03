"use client";

import { IconSparkles } from "@tabler/icons-react";
import { useApp } from "@/context/AppContext";
import { SkeletonLines } from "@/components/ui/Skeleton";

type AiExplanationPanelProps = {
  loading: boolean;
  explanation?: string;
};

export function AiExplanationPanel({ loading, explanation }: AiExplanationPanelProps) {
  const { t } = useApp();
  if (!loading && !explanation) return null;

  return (
    <div
      className="fade-up mt-4 rounded-md border-l-[3px] border-accent bg-accent-soft p-4"
      style={{ borderRadius: "0 6px 6px 0" }}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <IconSparkles size={14} className="text-accent" stroke={1.85} aria-hidden />
        <span className="text-[11px] font-medium uppercase tracking-wide text-accent">
          {t("report.aiExplanation")}
        </span>
      </div>
      {loading ? (
        <SkeletonLines />
      ) : (
        <p className="text-[13px] leading-[1.7] text-tprimary">{explanation}</p>
      )}
    </div>
  );
}
