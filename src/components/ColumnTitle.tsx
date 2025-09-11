import React from 'react';
import { Box, Heading } from '@primer/react';
import type { Column } from '../types';

interface ColumnTitleProps {
  column: Column;
  onTitleEdit: () => void;
}

const ColumnTitle: React.FC<ColumnTitleProps> = ({
  column,
  onTitleEdit
}) => {
  const handleTitleEdit = () => {
    onTitleEdit();
  };

  return (
    <Box sx={{ display: "flex", flex: "1", alignItems: "center", gap: 1 }}>
      <Heading 
        sx={{ 
          fontSize: 2, 
          margin: 0, 
          cursor: 'pointer',
          fontWeight: '600',
          color: 'fg.default',
          '&:hover': { color: 'accent.fg' }
        }}
        onDoubleClick={handleTitleEdit}
        title="ダブルクリックで編集"
      >
        {column.title}
      </Heading>
      <Box
        sx={{
          px: 2,
          py: 1,
          borderRadius: 2,
          fontSize: 1,
          fontWeight: '600'
        }}
      >
        {column.tasks.length}
      </Box>
    </Box>
  );
};

export default ColumnTitle;