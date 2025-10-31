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
      role='separator'
      aria-label='ドロップ位置インジケーター'
      style={{
        backgroundColor: 'var(--primary)',
      }}
      className='h-2 mx-1 my-2 rounded-[1px] transition-all duration-200 ease relative z-250'
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
          backgroundColor: 'var(--accent)',
          animation: 'drop-indicator-pulse 1.2s ease-in-out infinite',
        }}
        className="content-[''] absolute top-[-1px] left-[-4px] right-[-4px] bottom-[-1px] rounded-[2px] opacity-30"
      />
    </div>
  );
};

export default DropIndicator;
