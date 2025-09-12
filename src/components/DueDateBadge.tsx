import { CalendarIcon } from '@primer/octicons-react';
import { Box } from '@primer/react';
import React from 'react';

import type { DueDateBadgeProps } from '../types/date';

const DueDateBadge: React.FC<DueDateBadgeProps> = ({
  dueDate,
  isOverdue,
  isDueToday,
  isDueTomorrow,
  formatDueDate
}) => {
  const getBadgeStyle = () => {
    if (isOverdue()) {
      return { bg: 'danger.subtle', color: 'danger.fg' };
    }
    if (isDueToday()) {
      return { bg: 'attention.subtle', color: 'attention.fg' };
    }
    if (isDueTomorrow()) {
      return { bg: 'accent.subtle', color: 'accent.fg' };
    }
    return { bg: 'neutral.subtle', color: 'fg.muted' };
  };

  const style = getBadgeStyle();

  return (
    <Box
      sx={{
        display: "inline-flex",
        gap: 1,
        ...style,
        px: 2,
        py: 1,
        alignItems: "center",
        borderRadius: 2,
        fontSize: 0,
        fontWeight: "700",
        alignSelf: 'flex-start'
      }}
    >
      <CalendarIcon size={12} />
      期限: {formatDueDate(dueDate)}
    </Box>
  );
};

export default DueDateBadge;