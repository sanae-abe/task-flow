import React from 'react';

/**
 * ドラッグ&ドロップ時の挿入位置を示すインジケーターコンポーネント
 */
interface DropIndicatorProps {
  /** インジケーターの表示状態 */
  isVisible: boolean;
}

/**
 * ドラッグ&ドロップ操作時に挿入位置を視覚的に示すコンポーネント
 * Primerデザインシステムに準拠し、アクセシビリティにも配慮
 */
const DropIndicator: React.FC<DropIndicatorProps> = ({ isVisible }) => {
  if (!isVisible) {
    return null;
  }

  return (
    <div
      role="separator"
      aria-label="ドロップ位置インジケーター"
      style={{
        height: '2px',
        backgroundColor: 'var(--color-accent-emphasis)',
        borderRadius: '1px',
        margin: '4px 8px',
        transition: 'all 0.2s ease',
        position: 'relative',
        zIndex: 10,
      }}
    >
      <style>
        {`
          @keyframes drop-indicator-pulse {
            0% {
              opacity: 1;
              transform: scaleY(1);
            }
            50% {
              opacity: 0.6;
              transform: scaleY(1.2);
            }
            100% {
              opacity: 1;
              transform: scaleY(1);
            }
          }
        `}
      </style>
      <div
        style={{
          content: '""',
          position: 'absolute',
          top: '-1px',
          left: '-4px',
          right: '-4px',
          bottom: '-1px',
          backgroundColor: 'var(--color-accent-subtle)',
          borderRadius: '2px',
          opacity: 0.3,
          animation: 'drop-indicator-pulse 1.2s ease-in-out infinite'
        }}
      />
    </div>
  );
};

export default DropIndicator;