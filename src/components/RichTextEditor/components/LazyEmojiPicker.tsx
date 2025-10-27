/**
 * Lazy Loading Emoji Picker Component
 *
 * This component implements lazy loading for the emoji-picker-react library
 * to improve initial bundle size and loading performance.
 */

import React, { Suspense } from 'react';
import { EmojiClickData, EmojiStyle } from "emoji-picker-react";

// Lazy load the EmojiPicker component
const EmojiPicker = React.lazy(() =>
  import("emoji-picker-react").then(module => ({
    default: module.default
  }))
);

interface LazyEmojiPickerProps {
  isOpen: boolean;
  onClose: () => void;
  onEmojiSelect: (emoji: string) => void;
  buttonRef: React.RefObject<HTMLButtonElement | null>;
}

// Loading component shown while emoji picker is loading
const EmojiPickerLoading: React.FC = () => (
  <div
    className="fixed z-500 border border-border rounded-lg bg-background animate-in fade-in duration-200"
    style={{
      width: 350,
      height: 400,
      boxShadow: '0 20px 80px rgba(0, 0, 0, 0.2), 0 10px 40px rgba(0, 0, 0, 0.15), 0 5px 20px rgba(0, 0, 0, 0.1)',
    }}
  >
    <div className="flex items-center justify-center h-full">
      <div className="flex flex-col items-center space-y-2">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-gray-600" />
        <p className="text-sm text-zinc-700">絵文字ピッカーを読み込み中...</p>
      </div>
    </div>
  </div>
);

// Internal component that actually renders the emoji picker
const EmojiPickerContent: React.FC<Omit<LazyEmojiPickerProps, 'isOpen'>> = ({
  onClose,
  onEmojiSelect,
  buttonRef,
}) => {
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
      className="fixed z-500 border border-border rounded-lg bg-background animate-in fade-in duration-200"
      style={{
        top: position.top,
        left: position.left,
        boxShadow: '0 20px 80px rgba(0, 0, 0, 0.2), 0 10px 40px rgba(0, 0, 0, 0.15), 0 5px 20px rgba(0, 0, 0, 0.1)',
        // Emoji Picker CSS variables - 24px強制適用
        '--epr-emoji-size': '22px !important',
        '--epr-category-navigation-button-size': '32px !important',
      } as React.CSSProperties}
    >
      <style>
        {`
          [data-emoji-picker] .epr-btn {
            width: 32px !important;
            height: 32px !important;
            font-size: 32px !important;
          }
          [data-emoji-picker] .epr-emoji > span {
            padding :0 !important;
            width: 22px !important;
            height: 22px !important;
            font-size: 22px !important;
          }
          [data-emoji-picker] .epr-cat-btn {
            width: 32px !important;
            height: 32px !important;
          }
          [data-emoji-picker] .epr-emoji-variation-picker {
            width: 32px !important;
            height: 32px !important;
          }
          [data-emoji-picker] .epr-category-nav {
            padding-top: 4px !important;
            padding-bottom: 4px !important;
          }
          [data-emoji-picker] .epr-emoji-category-label {
            font-size: 14px !important;
            height: auto !important;
            margin-top: 8px !important;
            margin-bottom: 4px !important;
          }
        `}
      </style>
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

const LazyEmojiPicker: React.FC<LazyEmojiPickerProps> = ({
  isOpen,
  onClose,
  onEmojiSelect,
  buttonRef,
}) => {
  if (!isOpen) {
    return null;
  }

  return (
    <Suspense fallback={<EmojiPickerLoading />}>
      <EmojiPickerContent
        onClose={onClose}
        onEmojiSelect={onEmojiSelect}
        buttonRef={buttonRef}
      />
    </Suspense>
  );
};

export default LazyEmojiPicker;