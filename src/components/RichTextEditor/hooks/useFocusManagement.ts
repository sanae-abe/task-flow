import { useState, useCallback } from 'react';

/**
 * フォーカス管理用カスタムフック
 */
export const useFocusManagement = (editorRef: React.RefObject<HTMLDivElement>) => {
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [isToolbarInteraction, setIsToolbarInteraction] = useState(false);

  const handleFocus = useCallback(() => {
    setIsEditorFocused(true);
    setIsToolbarInteraction(false);
  }, []);

  const handleBlur = useCallback(() => {
    // ツールバーとの相互作用中でなければフォーカスを解除
    setTimeout(() => {
      if (!isToolbarInteraction) {
        setIsEditorFocused(false);
      }
    }, 100);
  }, [isToolbarInteraction]);

  // ツールバーボタンクリック時のハンドラー
  const handleToolbarButtonClick = useCallback((action: () => void) => {
    setIsToolbarInteraction(true);
    action();
    // エディタにフォーカスを戻す
    setTimeout(() => {
      if (editorRef.current) {
        editorRef.current.focus();
      }
      setIsToolbarInteraction(false);
    }, 50);
  }, [editorRef]);

  return {
    isEditorFocused,
    isToolbarInteraction,
    handleFocus,
    handleBlur,
    handleToolbarButtonClick,
  };
};