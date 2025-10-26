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
  if (!isOpen) return null;

  // Calculate position relative to the emoji button
  const getPickerPosition = () => {
    if (!buttonRef.current) return { top: 0, left: 0 };

    const rect = buttonRef.current.getBoundingClientRect();
    return {
      top: rect.bottom + 5,
      left: Math.max(10, rect.left - 250), // Ensure it doesn't go off-screen
    };
  };

  const position = getPickerPosition();

  const handleEmojiClick = (emojiData: EmojiClickData) => {
    onEmojiSelect(emojiData.emoji);
    onClose();
  };

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-40"
        onClick={onClose}
      />

      {/* Emoji Picker */}
      <div
        className="fixed z-50"
        style={{
          top: position.top,
          left: position.left,
        }}
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          emojiStyle={EmojiStyle.NATIVE}
          width={300}
          height={400}
          searchDisabled={false}
          skinTonesDisabled={false}
          previewConfig={{
            defaultEmoji: "1f60a",
            defaultCaption: "絵文字を選択してください",
            showPreview: true,
          }}
        />
      </div>
    </>
  );
};

export default EmojiPickerWrapper;