import { AlertTriangle, Clock, XCircle, type LucideIcon } from 'lucide-react';
import { memo } from 'react';
import { useTranslation } from 'react-i18next';

import {
  getDateStatus,
  formatDueDate,
  formatDueDateWithYear,
} from '../utils/dateHelpers';
import StatusBadge from './shared/StatusBadge';

interface DueDateDisplayProps {
  dueDate: Date;
  showYear?: boolean;
}

interface BadgeConfig {
  variant: 'danger' | 'warning' | 'info';
  text: string;
  icon: LucideIcon;
}

const getBadgeConfigs = (t: (key: string) => string) =>
  ({
    overdue: {
      variant: 'danger' as const,
      text: t('task.overdue'),
      icon: XCircle,
    },
    today: {
      variant: 'warning' as const,
      text: t('task.dueToday'),
      icon: AlertTriangle,
    },
    tomorrow: {
      variant: 'info' as const,
      text: t('task.dueTomorrow'),
      icon: Clock,
    },
  }) as const;

const getBadgeConfig = (
  isOverdue: boolean,
  isDueToday: boolean,
  isDueTomorrow: boolean,
  badgeConfigs: ReturnType<typeof getBadgeConfigs>
): BadgeConfig | null => {
  if (isOverdue) {
    return badgeConfigs.overdue;
  }
  if (isDueToday) {
    return badgeConfigs.today;
  }
  if (isDueTomorrow) {
    return badgeConfigs.tomorrow;
  }
  return null;
};

const getTextColor = (
  isOverdue: boolean,
  isDueToday: boolean,
  isDueTomorrow: boolean
): string => {
  if (isOverdue) {
    return 'text-destructive';
  }
  if (isDueToday) {
    return 'text-warning';
  }
  if (isDueTomorrow) {
    return 'text-primary';
  }
  return 'text-inherit';
};

const DueDateDisplay = memo<DueDateDisplayProps>(
  ({ dueDate, showYear = false }) => {
    const { t } = useTranslation();
    const { isOverdue, isDueToday, isDueTomorrow } = getDateStatus(dueDate);
    const badgeConfigs = getBadgeConfigs(t);
    const badgeConfig = getBadgeConfig(
      isOverdue,
      isDueToday,
      isDueTomorrow,
      badgeConfigs
    );
    const textColorClass = getTextColor(isOverdue, isDueToday, isDueTomorrow);
    const formattedDate = showYear
      ? formatDueDateWithYear(dueDate)
      : formatDueDate(dueDate);

    return (
      <div className={`flex items-center gap-1 text-sm ${textColorClass}`}>
        <div className='flex items-center gap-2 flex-1'>
          <span className='text-sm'>{formattedDate}</span>
        </div>
        {badgeConfig && (
          <StatusBadge variant={badgeConfig.variant} icon={badgeConfig.icon}>
            {badgeConfig.text}
          </StatusBadge>
        )}
      </div>
    );
  }
);

DueDateDisplay.displayName = 'DueDateDisplay';

export default DueDateDisplay;
