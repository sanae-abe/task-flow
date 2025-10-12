import React from 'react';
import { Text } from '@primer/react';

const EmptyState: React.FC = () => (
  <div
    style={{
      textAlign: 'center',
      paddingBlock: '24px',
      border: '1px dashed',
      borderColor: 'var(--borderColor-muted)',
      borderRadius: 'var(--borderRadius-medium)',
      display: 'flex',
      flexDirection: 'column',
      gap: "8px",
      justifyContent: 'center',
      alignItems: 'center'
    }}
  >
    <Text sx={{ color: 'fg.muted' }}>
      まだラベルがありません
    </Text>
  </div>
);

export default EmptyState;