import { Box } from '@primer/react';
import { memo } from 'react';

import type { Label } from '../types';

import LabelChip from './LabelChip';

interface TaskLabelsProps {
  labels?: Label[];
}

const TaskLabels = memo<TaskLabelsProps>(({ labels }) => {
  if (!labels || labels.length === 0) {
    return null;
  }

  return (
    <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 1, alignItems: 'center' }}>
      {labels.map((label) => (
        <LabelChip
          key={label.id}
          label={label}
          showRemove={false}
        />
      ))}
    </Box>
  );
});

export default TaskLabels;