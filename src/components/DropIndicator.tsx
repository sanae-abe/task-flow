import { Box } from '@primer/react';
import React from 'react';

interface DropIndicatorProps {
  isVisible: boolean;
}

const DropIndicator: React.FC<DropIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <Box
      sx={{
        height: '2px',
        backgroundColor: '#d1d9e0',
        borderRadius: '1px',
        margin: '4px 8px',
        transition: 'all 0.2s ease',
        position: 'relative',
        zIndex: 10,
        '&::before': {
          content: '""',
          position: 'absolute',
          top: '-1px',
          left: '-4px',
          right: '-4px',
          bottom: '-1px',
          backgroundColor: '#d1d9e0',
          borderRadius: '2px',
          opacity: 0.2,
          animation: 'pulse 1.2s ease-in-out infinite'
        }
      }}
    />
  );
};

export default DropIndicator;