import React, { useRef, useCallback } from 'react';

// インポート: カスタムコンポーネント
import { Toolbar, EmojiPickerModal } from './components';

// インポート: カスタムフック
import { useEditorCommands } from './hooks/useEditorCommands';
import { useLinkManagement } from './hooks/useLinkManagement';
import { useEmojiPicker } from './hooks/useEmojiPicker';
import { useFocusManagement } from './hooks/useFocusManagement';

// タイプ定義
export interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

/**
 * リッチテキストエディタコンポーネント
 *
 * モダンなリッチテキスト編集機能を提供します：
 * - 基本フォーマット（太字、斜体、下線、取り消し線）
 * - リンク挿入・編集
 * - インラインコード・コードブロック
 * - 箇条書き・番号付きリスト
 * - 絵文字挿入
 * - キーボードショートカット対応
 * - ペースト時のHTMLサニタイズ
 */
export const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = '説明を入力してください...',
  disabled = false,
  minHeight = '120px'
}) => {
  // Refs
  const editorRef = useRef<HTMLDivElement>(null);

  // 入力ハンドラー
  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  // カスタムフック: コマンド実行
  const { executeCommand, insertCode, insertCodeBlock } = useEditorCommands(
    editorRef as React.RefObject<HTMLDivElement>,
    handleInput
  );

  // カスタムフック: リンク管理
  const { insertLink } = useLinkManagement(
    editorRef as React.RefObject<HTMLDivElement>, 
    handleInput
  );

  // カスタムフック: 絵文字ピッカー
  const {
    showEmojiPicker,
    emojiButtonRef,
    handleEmojiPickerToggle,
    handleEmojiClick
  } = useEmojiPicker(editorRef as React.RefObject<HTMLDivElement>, handleInput);

  // カスタムフック: フォーカス管理
  const {
    isEditorFocused,
    isToolbarInteraction,
    handleFocus,
    handleBlur,
    handleToolbarButtonClick
  } = useFocusManagement(editorRef as React.RefObject<HTMLDivElement>);

  // キーボードショートカット処理
  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // Ctrl+B で太字
    if (e.ctrlKey && e.key === 'b') {
      e.preventDefault();
      executeCommand('bold');
    }
    // Ctrl+I で斜体
    if (e.ctrlKey && e.key === 'i') {
      e.preventDefault();
      executeCommand('italic');
    }
    // Ctrl+U で下線
    if (e.ctrlKey && e.key === 'u') {
      e.preventDefault();
      executeCommand('underline');
    }
    // Ctrl+Shift+X で取り消し線
    if (e.ctrlKey && e.shiftKey && e.key === 'X') {
      e.preventDefault();
      executeCommand('strikeThrough');
    }
    // Ctrl+K でリンク
    if (e.ctrlKey && e.key === 'k') {
      e.preventDefault();
      insertLink();
    }
    // Ctrl+` でコード
    if (e.ctrlKey && e.key === '`') {
      e.preventDefault();
      insertCode();
    }
    // Ctrl+Shift+` でコードブロック
    if (e.ctrlKey && e.shiftKey && e.key === '~') {
      e.preventDefault();
      insertCodeBlock();
    }
  }, [executeCommand, insertLink, insertCode, insertCodeBlock]);

  // ペースト処理
  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();
    try {
      const plainText = e.clipboardData.getData('text/plain');
      if (plainText && plainText.trim() !== '') {
        const escapedText = plainText
          .replace(/&/g, '&amp;')
          .replace(/</g, '&lt;')
          .replace(/>/g, '&gt;')
          .replace(/"/g, '&quot;')
          .replace(/'/g, '&#39;')
          .replace(/\n/g, '<br>');

        document.execCommand('insertHTML', false, escapedText);
        handleInput();
      }
    } catch (error) {
      // ペースト処理エラー - プロダクションではサイレント
    }
  }, [handleInput]);

  // リンククリックハンドラー
  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;
    const linkElement = target.closest('a');
    if (linkElement) {
      e.preventDefault();
      if (e.ctrlKey || e.metaKey) {
        window.open(linkElement.href, '_blank', 'noopener,noreferrer');
      }
    }
  }, []);

  // 表示制御
  const shouldShowToolbar = !disabled && (isEditorFocused || value.trim() !== '' || isToolbarInteraction);

  // エディタの値が変更された時にエディタの内容を更新
  React.useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  return (
    <div className="relative border border-border rounded-md overflow-hidden w-full focus-within:border-ring focus-within:ring-2 focus-within:ring-ring/20">
      {/* ツールバー */}
      {shouldShowToolbar && (
        <Toolbar
          onBold={() => handleToolbarButtonClick(() => executeCommand('bold'))}
          onItalic={() => handleToolbarButtonClick(() => executeCommand('italic'))}
          onUnderline={() => handleToolbarButtonClick(() => executeCommand('underline'))}
          onStrikethrough={() => handleToolbarButtonClick(() => executeCommand('strikeThrough'))}
          onLink={() => handleToolbarButtonClick(insertLink)}
          onCode={() => handleToolbarButtonClick(insertCode)}
          onCodeBlock={() => handleToolbarButtonClick(insertCodeBlock)}
          onUnorderedList={() => handleToolbarButtonClick(() => executeCommand('insertUnorderedList'))}
          onOrderedList={() => handleToolbarButtonClick(() => executeCommand('insertOrderedList'))}
          onEmoji={() => handleToolbarButtonClick(handleEmojiPickerToggle)}
          emojiButtonRef={emojiButtonRef as React.RefObject<HTMLButtonElement>}
        />
      )}

      {/* エディタ本体 */}
      <div
        ref={editorRef}
        contentEditable={!disabled}
        suppressContentEditableWarning
        onInput={handleInput}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onKeyDown={handleKeyDown}
        onPaste={handlePaste}
        onClick={handleLinkClick}
        data-placeholder={placeholder}
        className={`p-3 outline-none text-sm leading-6 ${
          disabled
            ? 'text-muted-foreground bg-muted'
            : 'text-foreground bg-transparent'
        } ${value.trim() === '' ? 'empty-editor' : ''}`}
        style={{
          minHeight,
          cursor: disabled ? 'not-allowed' : 'text',
        }}
      >
      </div>

      {/* 絵文字ピッカーモーダル */}
      <EmojiPickerModal
        isVisible={showEmojiPicker}
        onEmojiClick={handleEmojiClick}
      />

      {/* 背景オーバーレイ（絵文字ピッカー表示時） */}
      {showEmojiPicker && (
        <div
          style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.1)',
            zIndex: 9998,
            backdropFilter: 'blur(2px)',
          }}
          onClick={() => {
            // 背景クリックで絵文字ピッカーを閉じる
            const emojiPickerEvent = new CustomEvent('emoji-picker-close');
            document.dispatchEvent(emojiPickerEvent);
          }}
        />
      )}

      {/* リンクダイアログは別途TaskCreateDialog等から提供される想定 */}
    </div>
  );
};