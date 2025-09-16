import { Box } from '@primer/react';
import React from 'react';

interface LogoProps {
  size?: 'small' | 'medium' | 'large';
}

const CustomLogo: React.FC<{ size: number }> = ({ size }) => (
  <svg width={size} height={size} viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18.5819 2.40002H13.2341C12.5525 2.40002 12 3.17766 12 4.13691V8.47914C12 9.43839 12.5525 10.216 13.2341 10.216H18.5819C19.2635 10.216 19.816 9.43839 19.816 8.47914V4.13691C19.816 3.17766 19.2635 2.40002 18.5819 2.40002Z" fill="#0969DA"/>
    <path d="M8.97885 2.40002H3.63345C2.95218 2.40002 2.3999 3.17766 2.3999 4.13691V8.47914C2.3999 9.43839 2.95218 10.216 3.63345 10.216H8.97885C9.66012 10.216 10.2124 9.43839 10.2124 8.47914V4.13691C10.2124 3.17766 9.66012 2.40002 8.97885 2.40002Z" fill="#0969DA"/>
    <path d="M28.179 2.40002H22.8337C22.1524 2.40002 21.6001 3.17766 21.6001 4.13691V8.47914C21.6001 9.43839 22.1524 10.216 22.8337 10.216H28.179C28.8603 10.216 29.4126 9.43839 29.4126 8.47914V4.13691C29.4126 3.17766 28.8603 2.40002 28.179 2.40002Z" fill="#0969DA"/>
    <path d="M28.179 12H22.8337C22.1524 12 21.6001 12.7776 21.6001 13.7369V18.0791C21.6001 19.0384 22.1524 19.816 22.8337 19.816H28.179C28.8603 19.816 29.4126 19.0384 29.4126 18.0791V13.7369C29.4126 12.7776 28.8603 12 28.179 12Z" fill="#0969DA"/>
    <path d="M18.5819 12H13.2341C12.5525 12 12 12.7776 12 13.7369V18.0791C12 19.0384 12.5525 19.816 13.2341 19.816H18.5819C19.2635 19.816 19.816 19.0384 19.816 18.0791V13.7369C19.816 12.7776 19.2635 12 18.5819 12Z" fill="#0969DA"/>
    <path d="M18.5819 21.6H13.2341C12.5525 21.6 12 22.3776 12 23.3369V27.6791C12 28.6383 12.5525 29.416 13.2341 29.416H18.5819C19.2635 29.416 19.816 28.6383 19.816 27.6791V23.3369C19.816 22.3776 19.2635 21.6 18.5819 21.6Z" fill="#0969DA"/>
  </svg>
);

const Logo: React.FC<LogoProps> = ({ size = 'medium' }) => {
  const sizeConfig = {
    small: { iconSize: 16, fontSize: '12px', gap: 0.5 },
    medium: { iconSize: 28, fontSize: '18px', gap: 1 },
    large: { iconSize: 36, fontSize: '24px', gap: 2 }
  };

  const { iconSize, fontSize, gap } = sizeConfig[size];

  return (
    <Box
      as="div"
      role="banner"
      aria-label="TaskFlowアプリケーションロゴ"
      sx={{
        display: 'flex',
        alignItems: 'flex-end',
        gap,
        userSelect: 'none'
      }}
    >
      <Box
        sx={{
          display: 'flex',
          alignItems: 'center'
        }}
      >
        <CustomLogo size={iconSize} />
      </Box>
      <Box
        as="h1"
        sx={{
          fontSize,
          margin: 0,
          color: 'var(--fgColor-default)',
          fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", "Noto Sans", Helvetica, Arial, sans-serif',
          fontWeight: '600',
          lineHeight: 'condensed',
          translate: '0 -2px'
        }}
      >
        Task<span style={{ color: 'var(--fgColor-accent)' }}>Flow</span>
      </Box>
    </Box>
  );
};

export default Logo;