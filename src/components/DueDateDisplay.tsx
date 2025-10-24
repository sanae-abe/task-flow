import { AlertIcon, ClockIcon, XCircleIcon } from "@primer/octicons-react";
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

const getTextColor = (
  isOverdue: boolean,
  isDueToday: boolean,
  isDueTomorrow: boolean,
): string => {
  if (isOverdue) {
    return "text-red-600";
  }
  if (isDueToday) {
    return "text-yellow-600";
  }
  if (isDueTomorrow) {
    return "text-blue-600";
  }
  return "text-inherit";
};

const DueDateDisplay = memo<DueDateDisplayProps>(
  ({ dueDate, showYear = false }) => {
    const { isOverdue, isDueToday, isDueTomorrow } = getDateStatus(dueDate);
    const badgeConfig = getBadgeConfig(isOverdue, isDueToday, isDueTomorrow);
    const textColorClass = getTextColor(isOverdue, isDueToday, isDueTomorrow);
    const formattedDate = showYear
      ? formatDueDateWithYear(dueDate)
      : formatDueDate(dueDate);

    return (
      <div className={`flex items-center gap-2 ${textColorClass}`}>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm">{formattedDate}</span>
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
