import { Box, Text } from '@primer/react';
import React, { memo } from 'react';

interface ContentBoxProps {
  children: React.ReactNode;
  bg?: string;
  emptyText?: string;
  isEmpty?: boolean;
}

const ContentBox = memo<ContentBoxProps>(({ 
  children, 
  bg = 'canvas.subtle',
  emptyText,
  isEmpty = false
}) => (
    <Box
      sx={{
        p: 3,
        bg,
        borderRadius: 2,
      }}
    >
      {isEmpty && emptyText ? (
        <Text sx={{ fontSize: 1, color: 'fg.muted', fontStyle: 'italic' }}>
          {emptyText}
        </Text>
      ) : (
        children
      )}
    </Box>
  ));

ContentBox.displayName = 'ContentBox';

export default ContentBox;