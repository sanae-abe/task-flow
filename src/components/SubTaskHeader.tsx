import { PlusIcon } from '@primer/octicons-react';
import { Box, Text, Button } from '@primer/react';
import React from 'react';

interface SubTaskHeaderProps {
  completedCount: number;
  totalCount: number;
  isAdding: boolean;
  onStartAdding: () => void;
}

const SubTaskHeader: React.FC<SubTaskHeaderProps> = ({
  completedCount,
  totalCount,
  isAdding,
  onStartAdding
}) => (
  <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
    <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>
      サブタスク {totalCount > 0 && `(${completedCount}/${totalCount})`}
    </Text>
    {!isAdding && (
      <Button
        onClick={onStartAdding}
        variant="invisible"
        size="small"
        leadingVisual={PlusIcon}
        aria-label="サブタスクを追加"
      >
        追加
      </Button>
    )}
  </Box>
);

export default SubTaskHeader;