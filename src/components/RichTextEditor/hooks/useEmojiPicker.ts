import { useState, useCallback, useRef, useEffect } from 'react';
import { EmojiClickData } from 'emoji-picker-react';
import { insertHtmlAtCursor } from '../utils/htmlHelpers';

/**
 * Emoji管理用カスタムフック
 */
export const useEmojiPicker = (
  editorRef: React.RefObject<HTMLDivElement>,
  handleInput: () => void
) => {
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [savedEmojiRange, setSavedEmojiRange] = useState<Range | null>(null);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);

  const handleEmojiPickerToggle = useCallback(() => {
    if (!showEmojiPicker) {
      // 絵文字ピッカーを開く前にカーソル位置を保存
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        setSavedEmojiRange(range.cloneRange());
      } else {
        setSavedEmojiRange(null);
      }
    }
    setShowEmojiPicker(!showEmojiPicker);
  }, [showEmojiPicker]);

  const handleEmojiClick = useCallback((emojiData: EmojiClickData) => {
    if (editorRef.current) {
      editorRef.current.focus();

      // 保存されたカーソル位置を復元
      if (savedEmojiRange) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(savedEmojiRange);
        }
      }

      // 絵文字を挿入
      insertHtmlAtCursor(emojiData.emoji);

      handleInput();
      setShowEmojiPicker(false);
      setSavedEmojiRange(null);
    }
  }, [handleInput, savedEmojiRange, editorRef]);

  // 統合されたグローバルイベントハンドラー
  useEffect(() => {
    // 外部クリック時に絵文字ピッカーを閉じる
    const handleClickOutside = (event: MouseEvent) => {
      if (
        showEmojiPicker &&
        emojiButtonRef.current &&
        !emojiButtonRef.current.contains(event.target as Node) &&
        !(event.target as Element).closest('[data-emoji-picker]')
      ) {
        setShowEmojiPicker(false);
      }
    };

    // ESCキーで絵文字ピッカーを閉じる
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showEmojiPicker && event.key === 'Escape') {
        setShowEmojiPicker(false);
      }
    };

    if (showEmojiPicker) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleKeyDown);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showEmojiPicker]);

  return {
    showEmojiPicker,
    emojiButtonRef,
    handleEmojiPickerToggle,
    handleEmojiClick,
  };
};