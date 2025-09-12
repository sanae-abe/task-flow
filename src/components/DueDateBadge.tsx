import { CalendarIcon } from '@primer/octicons-react';
import React from 'react';

import type { DueDateBadgeProps } from '../types/date';
import StatusBadge from './shared/StatusBadge';

const DueDateBadge: React.FC<DueDateBadgeProps> = ({
  dueDate,
  isOverdue,
  isDueToday,
  isDueTomorrow,
  formatDueDate
}) => {
  const getVariant = () => {
    if (isOverdue()) {
      return 'danger';
    }
    if (isDueToday()) {
      return 'warning';
    }
    if (isDueTomorrow()) {
      return 'info';
    }
    return 'neutral';
  };

  return (
    <StatusBadge
      variant={getVariant()}
      icon={CalendarIcon}
      size="medium"
      sx={{ border: 'none' }}
    >
      期限: {formatDueDate(dueDate)}
    </StatusBadge>
  );
};

export default DueDateBadge;