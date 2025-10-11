import React from 'react';
import { Box } from '@primer/react';
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';

interface EmojiPickerModalProps {
  isVisible: boolean;
  onEmojiClick: (emojiData: EmojiClickData) => void;
}

/**
 * Emoji選択モーダルコンポーネント
 */
export const EmojiPickerModal: React.FC<EmojiPickerModalProps> = ({
  isVisible,
  onEmojiClick,
}) => {
  if (!isVisible) {
    return null;
  }

  return (
    <Box
      data-emoji-picker
      sx={{
        position: 'fixed',
        top: '50%',
        left: '50%',
        transform: 'translate(-50%, -50%)',
        zIndex: 9999,
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 3,
        backgroundColor: 'canvas.default',
        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.2), 0 10px 40px rgba(0, 0, 0, 0.15), 0 5px 20px rgba(0, 0, 0, 0.1)',
        '& h2': {
          fontSize: '14px'
        },
        '& .epr-category-nav': {
          py: '4px'
        },
        // アニメーション効果
        animation: 'fadeIn 0.2s ease-out',
        '@keyframes fadeIn': {
          from: {
            opacity: 0,
            transform: 'translate(-50%, -50%) scale(0.95)',
          },
          to: {
            opacity: 1,
            transform: 'translate(-50%, -50%) scale(1)',
          },
        },
      }}
    >
      <EmojiPicker
        onEmojiClick={onEmojiClick}
        emojiStyle={EmojiStyle.NATIVE}
        height={400}
        width={350}
        skinTonesDisabled
        previewConfig={{
          showPreview: false
        }}
        style={{
          '--epr-category-navigation-button-size': '22px',
          '--epr-emoji-size': '22px'
        } as React.CSSProperties}
      />
    </Box>
  );
};