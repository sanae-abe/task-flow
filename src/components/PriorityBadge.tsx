import React from "react";

import type { Priority } from "../types";
import { priorityConfig } from "../utils/priorityConfig";

interface PriorityBadgeProps {
  priority?: Priority;
  showIcon?: boolean;
  showLabel?: boolean;
  useEnglishLabel?: boolean;
}

const PriorityBadge: React.FC<PriorityBadgeProps> = ({
  priority,
  showIcon = true,
  showLabel = true,
  useEnglishLabel = false,
}) => {
  // 優先度が設定されていない場合は何も表示しない
  if (!priority) {
    return null;
  }

  const config = priorityConfig[priority];

  if (!config) {
    return null;
  }

  const Icon = config.icon;
  const colors = config.colors.subtle;
  const displayLabel = useEnglishLabel ? config.labelEn : config.label;

  return (
    <div
      style={{
        display: "inline-flex",
        alignItems: "center",
        gap: "4px",
        fontSize: "12px",
        fontWeight: showLabel ? "500" : "400",
        lineHeight: "1.5",
        padding: "3px 8px",
        borderRadius: "3px",
        color: colors.text,
        backgroundColor: colors.bg,
        cursor: "default",
      }}
      aria-label={`優先度: ${displayLabel} - ${config.description}`}
      role="status"
    >
      {showIcon && <Icon aria-hidden size={14} />}
      {showLabel && <span>{displayLabel}</span>}
    </div>
  );
};

export default PriorityBadge;
