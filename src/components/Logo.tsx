import React from 'react';
import { Box, Heading } from '@primer/react';
import { CloudOfflineIcon } from '@primer/octicons-react';

const Logo: React.FC = () => {
  return (
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
      <CloudOfflineIcon size={20} />
      <Heading sx={{ fontSize: 3, margin: 0, color: 'fg.default', fontWeight: '600' }}>
        Kanban
      </Heading>
    </Box>
  );
};

export default Logo;