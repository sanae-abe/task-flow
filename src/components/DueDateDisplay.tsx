import { CalendarIcon } from '@primer/octicons-react';
import { Box, Text } from '@primer/react';
import { memo } from 'react';

import { getDateStatus, formatDueDate, formatDueDateWithYear } from '../utils/dateHelpers';

interface DueDateDisplayProps {
  dueDate: Date;
  showYear?: boolean;
}

interface BadgeConfig {
  bg: string;
  text: string;
}

const BADGE_CONFIGS = {
  overdue: {
    bg: 'danger.emphasis',
    text: '期限切れ'
  },
  today: {
    bg: 'attention.emphasis', 
    text: '本日期限'
  },
  tomorrow: {
    bg: 'accent.emphasis',
    text: '明日期限'
  }
} as const;

const getBadgeConfig = (isOverdue: boolean, isDueToday: boolean, isDueTomorrow: boolean): BadgeConfig | null => {
  if (isOverdue) {return BADGE_CONFIGS['overdue'];}
  if (isDueToday) {return BADGE_CONFIGS['today'];}
  if (isDueTomorrow) {return BADGE_CONFIGS['tomorrow'];}
  return null;
};

const getContainerStyles = (isOverdue: boolean, isDueToday: boolean, isDueTomorrow: boolean) => ({
  bg: 'transparent',
  color: isOverdue 
    ? 'danger.emphasis' 
    : isDueToday 
    ? 'attention.emphasis'
    : isDueTomorrow 
    ? 'accent.emphasis' 
    : 'inherit'
});

const StatusBadge = memo<{ config: BadgeConfig }>(({ config }) => (
  <Text
    sx={{
      fontSize: 0,
      fontWeight: '700',
      color: config.bg, // 背景色を文字色として使用
      bg: 'transparent',
      px: 2,
      py: 1,
      borderRadius: 2,
      textTransform: 'uppercase',
      letterSpacing: '0.025em'
    }}
  >
    {config.text}
  </Text>
));

StatusBadge.displayName = 'StatusBadge';

const DueDateDisplay = memo<DueDateDisplayProps>(({ dueDate, showYear = false }) => {
  const { isOverdue, isDueToday, isDueTomorrow } = getDateStatus(dueDate);
  const badgeConfig = getBadgeConfig(isOverdue, isDueToday, isDueTomorrow);
  const containerStyles = getContainerStyles(isOverdue, isDueToday, isDueTomorrow);
  const formattedDate = showYear ? formatDueDateWithYear(dueDate) : formatDueDate(dueDate);

  return (
    <Box
      sx={{
        p: 3,
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        ...containerStyles
      }}
    >
      <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
        <CalendarIcon size={16} />
        <Text sx={{ fontSize: 1 }}>{formattedDate}</Text>
      </Box>
      {badgeConfig && <StatusBadge config={badgeConfig} />}
    </Box>
  );
});

DueDateDisplay.displayName = 'DueDateDisplay';

export default DueDateDisplay;