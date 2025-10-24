import { RotateCcw } from "lucide-react";
import React from "react";

import type { DueDateBadgeProps } from "../types/date";
import StatusBadge from "./shared/StatusBadge";

const DueDateBadge: React.FC<DueDateBadgeProps> = ({
  dueDate,
  isOverdue,
  isDueToday,
  isDueTomorrow,
  formatDueDate,
  isRecurrence = false,
}) => {
  const getVariant = () => {
    if (isOverdue()) {
      return "danger";
    }
    if (isDueToday()) {
      return "warning";
    }
    if (isDueTomorrow()) {
      return "info";
    }
    return "neutral";
  };

  return (
    <StatusBadge
      variant={getVariant()}
      size="small"
      className="border-0 bg-transparent"
    >
      期限: {formatDueDate(dueDate)} {isRecurrence && <RotateCcw size={12} />}
    </StatusBadge>
  );
};

export default DueDateBadge;
