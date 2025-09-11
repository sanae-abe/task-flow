import React from 'react';
import { Box, Heading } from '@primer/react';
import type { Column } from '../types';

interface ColumnTitleProps {
  column: Column;
  onTitleEdit: () => void;
}

const ColumnTitle: React.FC<ColumnTitleProps> = ({
  column
}) => {
  return (
    <Box sx={{ display: "flex", flex: "1", alignItems: "center", gap: 1 }}>
      <Heading 
        sx={{ 
          fontSize: 2, 
          margin: 0, 
          fontWeight: '600',
          color: 'fg.default',
        }}
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