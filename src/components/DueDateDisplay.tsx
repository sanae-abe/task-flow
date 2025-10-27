import { AlertTriangle, Clock, XCircle } from "lucide-react";
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
    icon: XCircle,
  },
  today: {
    variant: "warning" as const,
    text: "本日期限",
    icon: AlertTriangle,
  },
  tomorrow: {
    variant: "info" as const,
    text: "明日期限",
    icon: Clock,
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
    return "text-destructive";
  }
  if (isDueToday) {
    return "text-warning";
  }
  if (isDueTomorrow) {
    return "text-primary";
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
      <div className={`flex items-center gap-1 text-sm ${textColorClass}`}>
        <div className="flex items-center gap-2 flex-1">
          <span className="text-sm">{formattedDate}</span>
        </div>
        {badgeConfig && (
          <StatusBadge
            variant={badgeConfig.variant}
            icon={badgeConfig.icon}
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
