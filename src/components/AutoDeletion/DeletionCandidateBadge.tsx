import React from "react";
import { Box, Text, Tooltip } from "@primer/react";
import { ClockIcon, AlertIcon } from "@primer/octicons-react";
import type { Task } from "../../types";

interface DeletionCandidateBadgeProps {
  task: Task;
  daysUntilDeletion: number;
  size?: "small" | "medium";
  showTooltip?: boolean;
}

export const DeletionCandidateBadge: React.FC<DeletionCandidateBadgeProps> = ({
  task,
  daysUntilDeletion,
  size = "small",
  showTooltip = true,
}) => {
  const isUrgent = daysUntilDeletion <= 1;
  const isOverdue = daysUntilDeletion <= 0;

  const getBadgeVariant = () => {
    if (isOverdue) {
      return "danger";
    }
    if (isUrgent) {
      return "severe";
    }
    return "attention";
  };

  const getBadgeText = () => {
    if (isOverdue) {
      return "削除予定";
    }
    if (daysUntilDeletion === 1) {
      return "明日削除";
    }
    return `${daysUntilDeletion}日後`;
  };

  const getTooltipText = () => {
    if (isOverdue) {
      return `このタスクは削除予定です。完了日: ${
        task.completedAt ? new Date(task.completedAt).toLocaleDateString("ja-JP") : "不明"
      }`;
    }
    return `このタスクは${daysUntilDeletion}日後に自動削除されます。完了日: ${
      task.completedAt ? new Date(task.completedAt).toLocaleDateString("ja-JP") : "不明"
    }`;
  };

  const badgeElement = (
    <Box
      sx={{
        display: "inline-flex",
        alignItems: "center",
        gap: 1,
        px: size === "small" ? 1 : 2,
        py: size === "small" ? "2px" : 1,
        bg: getBadgeVariant() === "danger"
          ? "danger.subtle"
          : getBadgeVariant() === "severe"
          ? "severe.subtle"
          : "attention.subtle",
        color: getBadgeVariant() === "danger"
          ? "danger.fg"
          : getBadgeVariant() === "severe"
          ? "severe.fg"
          : "attention.fg",
        border: "1px solid",
        borderColor: getBadgeVariant() === "danger"
          ? "danger.muted"
          : getBadgeVariant() === "severe"
          ? "severe.muted"
          : "attention.muted",
        borderRadius: 1,
        fontSize: size === "small" ? 0 : 1,
        fontWeight: "medium",
        lineHeight: "condensed",
      }}
    >
      {isUrgent ? (
        <AlertIcon size={size === "small" ? 12 : 14} />
      ) : (
        <ClockIcon size={size === "small" ? 12 : 14} />
      )}
      <Text sx={{ fontSize: "inherit" }}>
        {getBadgeText()}
      </Text>
    </Box>
  );

  if (!showTooltip) {
    return badgeElement;
  }

  return (
    <Tooltip text={getTooltipText()} direction="n">
      {badgeElement}
    </Tooltip>
  );
};

export default DeletionCandidateBadge;