import React from 'react';
import { Box, Text } from '@primer/react';

const EmptyState: React.FC = () => (
  <Box
    sx={{
      textAlign: 'center',
      py: 6,
      border: '1px dashed',
      borderColor: 'border.muted',
      borderRadius: 2,
      display: 'flex',
      flexDirection: 'column',
      gap: 2,
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <Text sx={{ color: 'fg.muted' }}>
      まだラベルがありません
    </Text>
  </Box>
);

export default EmptyState;