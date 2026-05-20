"use client";

import { InfoTooltip } from "@/components/ui/InfoTooltip";

export function LabelWithInfo({
  label,
  info,
  className = "",
}: {
  label: string;
  info: string;
  className?: string;
}) {
  return (
    <span className={`inline-flex items-center gap-1.5 ${className}`}>
      {label}
      <InfoTooltip text={info} />
    </span>
  );
}
