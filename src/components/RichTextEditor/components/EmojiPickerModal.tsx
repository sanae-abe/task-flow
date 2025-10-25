import React from 'react';
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
    <div
      data-emoji-picker
      className="fixed top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 z-[500] border border-border rounded-lg bg-background animate-in fade-in duration-200"
      style={{
        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.2), 0 10px 40px rgba(0, 0, 0, 0.15), 0 5px 20px rgba(0, 0, 0, 0.1)',
        '--epr-category-navigation-button-size': '22px',
        '--epr-emoji-size': '22px'
      } as React.CSSProperties}
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
      />
    </div>
  );
};