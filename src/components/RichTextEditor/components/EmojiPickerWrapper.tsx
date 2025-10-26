/**
 * Emoji Picker Wrapper Component
 *
 * This component wraps the emoji-picker-react component for the RichTextEditor.
 */

import React from 'react';
import EmojiPicker, { EmojiClickData, EmojiStyle } from "emoji-picker-react";

interface EmojiPickerWrapperProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

const EmojiPickerWrapper: React.FC<EmojiPickerWrapperProps> = ({
  isOpen,
  onClose,
  onEmojiSelect,
  buttonRef,
}) => {
  if (!isOpen) {
    return null;
  }

  // Calculate position relative to the emoji button
  const getPickerPosition = () => {
    if (!buttonRef.current) {
      return { top: 0, left: 0 };
    }

    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 5,
      left: Math.max(10, rect.left - 270), // Adjusted for new width (350px)
    };
  };

  const position = getPickerPosition();

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    onClose();
  };

  return (
    <div
      data-emoji-picker
      className="fixed z-[500] border border-border rounded-lg bg-background animate-in fade-in duration-200"
      style={{
        top: position.top,
        left: position.left,
        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.2), 0 10px 40px rgba(0, 0, 0, 0.15), 0 5px 20px rgba(0, 0, 0, 0.1)',
        '--epr-category-navigation-button-size': '16px',
        '--epr-emoji-size': '16px'
      } as React.CSSProperties}
    >
      <EmojiPicker
        onEmojiClick={handleEmojiClick}
        emojiStyle={EmojiStyle.NATIVE}
        width={350}
        height={400}
        searchDisabled={false}
        skinTonesDisabled
        previewConfig={{
          showPreview: false
        }}
      />
    </div>
  );
};

export default EmojiPickerWrapper;