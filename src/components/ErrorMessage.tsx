import { Box, Text } from '@primer/react';
import React from 'react';

interface ErrorMessageProps {
  error: string | null;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ error }) => {
  if (!error) {
    return null;
  }

  return (
    <Box sx={{ 
      p: 2, 
      bg: 'danger.subtle', 
      border: '1px solid', 
      borderColor: 'danger.muted', 
      borderRadius: 1 
    }}>
      <Text sx={{ color: 'danger.fg', fontSize: 1 }}>
        {error}
      </Text>
    </Box>
  );
};

export default ErrorMessage;