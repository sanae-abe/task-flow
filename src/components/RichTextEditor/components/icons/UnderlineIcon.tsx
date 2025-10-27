/**
 * Custom Underline Icon Component
 *
 * Provides a custom underline icon for the RichTextEditor toolbar.
 */

import React from 'react';

interface UnderlineIconProps {
  size?: number;
}

const UnderlineIcon: React.FC<UnderlineIconProps> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 16 16"
    fill="currentColor"
    aria-label="Underline"
  >
    <path d="M8 13c2.21 0 4-1.79 4-4V3h-1.5v6c0 1.38-1.12 2.5-2.5 2.5S5.5 10.38 5.5 9V3H4v6c0 2.21 1.79 4 4 4z" />
    <path d="M3 14h10v1H3v-1z" />
  </svg>
);

export default UnderlineIcon;