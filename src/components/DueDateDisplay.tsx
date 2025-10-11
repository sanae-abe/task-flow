import { AlertIcon, ClockIcon, XCircleIcon } from "@primer/octicons-react";
import { Text } from "@primer/react";
import { memo } from "react";

import {
  getDateStatus,
  formatDueDate,
  formatDueDateWithYear,
} from "../utils/dateHelpers";
import StatusBadge from "./shared/StatusBadge";

interface DueDateDisplayProps {
  dueDate: Date;
  showYear?: boolean;
}

interface BadgeConfig {
  variant: "danger" | "warning" | "info";
  text: string;
  icon: React.ComponentType<{ size: number }>;
}

const BADGE_CONFIGS = {
  overdue: {
    variant: "danger" as const,
    text: "期限切れ",
    icon: XCircleIcon,
  },
  today: {
    variant: "warning" as const,
    text: "本日期限",
    icon: AlertIcon,
  },
  tomorrow: {
    variant: "info" as const,
    text: "明日期限",
    icon: ClockIcon,
  },
} as const;

const getBadgeConfig = (
  isOverdue: boolean,
  isDueToday: boolean,
  isDueTomorrow: boolean,
): BadgeConfig | null => {
  if (isOverdue) {
    return BADGE_CONFIGS["overdue"];
  }
  if (isDueToday) {
    return BADGE_CONFIGS["today"];
  }
  if (isDueTomorrow) {
    return BADGE_CONFIGS["tomorrow"];
  }
  return null;
};

const getContainerStyles = (
  isOverdue: boolean,
  isDueToday: boolean,
  isDueTomorrow: boolean,
) => ({
  bg: "transparent",
  color: isOverdue
    ? "danger.emphasis"
    : isDueToday
      ? "attention.emphasis"
      : isDueTomorrow
        ? "accent.emphasis"
        : "inherit",
});

const DueDateDisplay = memo<DueDateDisplayProps>(
  ({ dueDate, showYear = false }) => {
    const { isOverdue, isDueToday, isDueTomorrow } = getDateStatus(dueDate);
    const badgeConfig = getBadgeConfig(isOverdue, isDueToday, isDueTomorrow);
    const containerStyles = getContainerStyles(
      isOverdue,
      isDueToday,
      isDueTomorrow,
    );
    const formattedDate = showYear
      ? formatDueDateWithYear(dueDate)
      : formatDueDate(dueDate);

    return (
      <div
        style={{
          display: "flex",
          alignItems: "center",
          gap: "8px",
          ...containerStyles,
        }}
      >
        <div
          style={{ display: "flex", alignItems: "center", gap: "8px", flex: 1 }}
        >
          <Text sx={{ fontSize: 1 }}>{formattedDate}</Text>
        </div>
        {badgeConfig && (
          <StatusBadge
            variant={badgeConfig.variant}
            icon={badgeConfig.icon}
            size="small"
          >
            {badgeConfig.text}
          </StatusBadge>
        )}
      </div>
    );
  },
);

DueDateDisplay.displayName = "DueDateDisplay";

export default DueDateDisplay;
