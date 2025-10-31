/**
 * Custom Strikethrough Icon Component
 *
 * Provides a custom strikethrough icon for the RichTextEditor toolbar.
 */

import React from 'react';

interface StrikethroughIconProps {
  size?: number;
}

const StrikethroughIcon: React.FC<StrikethroughIconProps> = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox='0 0 24 24'
    fill='currentColor'
    aria-label='Strikethrough'
  >
    <path
      fillRule='nonzero'
      d='M13.848 11.5H19.5a1 1 0 1 1 0 2h-2.387a4.03 4.03 0 0 1 .998 2.685c0 2.929-3.28 4.915-7.033 4.478-2.328-.27-3.965-1.218-4.827-2.832-.26-.487-.207-1.016.248-1.331s1.256-.099 1.516.389c.533.997 1.604 1.591 3.294 1.788 2.586.3 4.802-.91 4.802-2.492 0-1.099-.547-1.94-2.107-2.685H5a1 1 0 0 1 0-2h8.848M6.987 9.695a5 5 0 0 1-.298-.51c-.3-.59-.468-1.214-.435-1.835.16-2.965 2.934-4.713 6.602-4.287 2.26.263 3.99 1.084 5.147 2.487.352.426.273 1.048-.153 1.4s-1.048.326-1.4-.1c-.813-.985-2.068-1.596-3.825-1.8-2.56-.298-4.371.718-4.371 2.323 0 .714.239 1.22.762 1.81q.337.381 1.266.815h-3.09q-.167-.244-.205-.303'
    />
  </svg>
);

export default StrikethroughIcon;
