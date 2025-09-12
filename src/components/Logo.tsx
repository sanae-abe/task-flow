import { CloudOfflineIcon } from '@primer/octicons-react';
import { Box, Heading } from '@primer/react';
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const sizeConfig = {
    small: { iconSize: 16, fontSize: 2 },
    medium: { iconSize: 20, fontSize: 3 },
    large: { iconSize: 24, fontSize: 4 }
  };

  const { iconSize, fontSize } = sizeConfig[size];

  return (
    <Box
      as="div"
      role="banner"
      aria-label="Kanbanアプリケーションロゴ"
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        userSelect: 'none'
      }}
    >
      <Box
        sx={{
          color: '#0969da',
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <CloudOfflineIcon 
          size={iconSize} 
          aria-hidden="true"
        />
      </Box>
      <Heading
        sx={{
          fontSize,
          margin: 0,
          color: 'fg.default',
          fontWeight: '700',
          lineHeight: 'condensed'
        }}
      >
        Kanban
      </Heading>
    </Box>
  );
};

export default Logo;