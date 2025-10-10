import { Box, Text, IconButton } from '@primer/react';
import { BoldIcon, ItalicIcon, ListUnorderedIcon, ListOrderedIcon, LinkIcon, CodeIcon, FileCodeIcon, SmileyIcon } from '@primer/octicons-react';
import React, { useRef, useCallback, useEffect, useState } from 'react';
import EmojiPicker, { EmojiClickData, EmojiStyle } from 'emoji-picker-react';

import LinkInsertDialog from './LinkInsertDialog';

// 下線アイコン（カスタム）
const UnderlineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 13c2.21 0 4-1.79 4-4V3h-1.5v6c0 1.38-1.12 2.5-2.5 2.5S5.5 10.38 5.5 9V3H4v6c0 2.21 1.79 4 4 4z"/>
    <path d="M3 14h10v1H3v-1z"/>
  </svg>
);

// 取り消し線アイコン（カスタム）
const StrikethroughIcon = () => (
  <svg width="16" height="16" viewBox="0 0 24 24" fill="currentColor">
    <path fillRule="nonzero" d="M13.848 11.5H19.5a1 1 0 1 1 0 2h-2.387a4.03 4.03 0 0 1 .998 2.685c0 2.929-3.28 4.915-7.033 4.478-2.328-.27-3.965-1.218-4.827-2.832-.26-.487-.207-1.016.248-1.331s1.256-.099 1.516.389c.533.997 1.604 1.591 3.294 1.788 2.586.3 4.802-.91 4.802-2.492 0-1.099-.547-1.94-2.107-2.685H5a1 1 0 0 1 0-2h8.848M6.987 9.695a5 5 0 0 1-.298-.51c-.3-.59-.468-1.214-.435-1.835.16-2.965 2.934-4.713 6.602-4.287 2.26.263 3.99 1.084 5.147 2.487.352.426.273 1.048-.153 1.4s-1.048.326-1.4-.1c-.813-.985-2.068-1.596-3.825-1.8-2.56-.298-4.371.718-4.371 2.323 0 .714.239 1.22.762 1.81q.337.381 1.266.815h-3.09q-.167-.244-.205-.303"/>
  </svg>
);

interface RichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

/**
 * シンプルなリッチテキストエディタコンポーネント
 * contentEditableベースで基本的なリッチテキスト機能を提供
 */
const RichTextEditor: React.FC<RichTextEditorProps> = ({
  value = '',
  onChange,
  placeholder = '説明を入力してください...',
  disabled = false,
  minHeight = '120px'
}) => {
  const editorRef = useRef<HTMLDivElement>(null);
  const [isEditorFocused, setIsEditorFocused] = useState(false);
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [editingLink, setEditingLink] = useState<HTMLAnchorElement | null>(null);
  const [showLinkEditDialog, setShowLinkEditDialog] = useState(false);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiButtonRef = useRef<HTMLButtonElement>(null);
  const [savedEmojiRange, setSavedEmojiRange] = useState<Range | null>(null);

  // 値が変更されたときにエディタの内容を更新
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

  // 外部クリック時に絵文字ピッカーを閉じる
  useEffect(() => {
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

    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showEmojiPicker]);

  // ESCキーで絵文字ピッカーを閉じる
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (showEmojiPicker && event.key === 'Escape') {
        setShowEmojiPicker(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => {
      document.removeEventListener('keydown', handleKeyDown);
    };
  }, [showEmojiPicker]);

  const handleInput = useCallback(() => {
    if (editorRef.current && onChange) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange]);

  const executeCommand = useCallback((command: string, value?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();
      if (value) {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command);
      }
      handleInput();
    }
  }, [handleInput]);

  const insertLink = useCallback(() => {
    const selection = window.getSelection();
    if (selection && selection.rangeCount > 0) {
      const range = selection.getRangeAt(0);
      setSavedRange(range.cloneRange());

      if (selection.toString()) {
        setSelectedText(selection.toString());
      } else {
        setSelectedText('');
      }
    } else {
      setSavedRange(null);
      setSelectedText('');
    }
    setShowLinkDialog(true);
  }, []);

  const insertCode = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();

      if (selection && selection.toString()) {
        // 選択されたテキストをインラインコードで囲む
        const selectedText = selection.toString();
        const codeHtml = `<code style="background-color: #e8f5e8; color: #e01e5a; padding: 2px 4px; border-radius: 4px; font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 0.875em; border: 1px solid #d1d9e0;">${selectedText}</code>`;
        document.execCommand('insertHTML', false, codeHtml);
      } else {
        // 選択がない場合は空のインラインコードを挿入してカーソルを中に配置
        const codeHtml = `<code style="background-color: #e8f5e8; color: #e01e5a; padding: 2px 4px; border-radius: 4px; font-family: 'Monaco', 'Menlo', 'Consolas', monospace; font-size: 0.875em; border: 1px solid #d1d9e0;">コードを入力</code>`;
        document.execCommand('insertHTML', false, codeHtml);
      }

      handleInput();
    }
  }, [handleInput]);

  const insertCodeBlock = useCallback(() => {
    if (editorRef.current) {
      editorRef.current.focus();
      const selection = window.getSelection();

      let initialCode = 'コードを入力してください...';
      if (selection && selection.toString()) {
        initialCode = selection.toString();
      }

      // コードブロックを挿入（GitHub風）
      const codeBlockHtml = `<div style="margin: 0 0 8px; border: 1px solid #d0d7de !important; border-radius: 6px; padding: 8px; font-family: 'SFMono-Regular', 'Consolas', 'Liberation Mono', 'Menlo', monospace; font-size: 13px; line-height: 1.45; overflow-x: auto; color: #24292f; background-color: #f6f8fa;"><pre style="margin: 0 !important; white-space: pre; overflow-wrap: normal; color: inherit; background: transparent; border: none; padding: 0;" contenteditable="true" spellcheck="false">${initialCode}</pre></div>`;
      document.execCommand('insertHTML', false, codeBlockHtml);

      handleInput();
    }
  }, [handleInput]);

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
      document.execCommand('insertHTML', false, emojiData.emoji);

      handleInput();
      setShowEmojiPicker(false);
      setSavedEmojiRange(null);
    }
  }, [handleInput, savedEmojiRange]);

  const handleLinkInsert = useCallback((url: string, linkText?: string) => {
    if (editorRef.current) {
      editorRef.current.focus();

      // 保存されたカーソル位置を復元
      if (savedRange) {
        const selection = window.getSelection();
        if (selection) {
          selection.removeAllRanges();
          selection.addRange(savedRange);
        }
      }

      if (selectedText) {
        // 選択されたテキストがある場合はそれをリンクに変換
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText || selectedText}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      } else {
        // 選択がない場合は新しいリンクを挿入
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText || url}</a>`;
        document.execCommand('insertHTML', false, linkHtml);
      }

      handleInput();
    }
    setShowLinkDialog(false);
    setSelectedText('');
    setSavedRange(null);
  }, [selectedText, savedRange, handleInput]);

  // リンク編集用の関数
  const handleLinkEdit = useCallback((url: string, linkText?: string) => {
    if (editingLink && editorRef.current) {
      editorRef.current.focus();

      // リンクの内容を更新
      editingLink.href = url.startsWith('http') ? url : `https://${url}`;
      editingLink.textContent = linkText || url;

      handleInput();
    }
    setShowLinkEditDialog(false);
    setEditingLink(null);
  }, [editingLink, handleInput]);

  // リンククリックハンドラ
  const handleLinkClick = useCallback((e: React.MouseEvent) => {
    const target = e.target as HTMLElement;

    // aタグかその子要素がクリックされた場合
    const linkElement = target.closest('a');
    if (linkElement) {
      e.preventDefault();

      // Ctrl/Cmd キーが押されている場合は新しいタブで開く
      if (e.ctrlKey || e.metaKey) {
        window.open(linkElement.href, '_blank', 'noopener,noreferrer');
      } else {
        // 通常クリックの場合は編集モードに切り替え
        setEditingLink(linkElement);
        setShowLinkEditDialog(true);
      }
    }
  }, []);


  // HTMLエスケープ処理を行う関数
  const escapeHtml = useCallback((text: string): string => text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;')
    .replace(/\n/g, '<br>'), []); // 改行をBRタグに変換

  const handlePaste = useCallback((e: React.ClipboardEvent<HTMLDivElement>) => {
    e.preventDefault();

    try {
      // クリップボードからプレーンテキストを取得
      const plainText = e.clipboardData.getData('text/plain');

      if (plainText && plainText.trim() !== '') {
        // HTMLエスケープして安全にする
        const escapedText = escapeHtml(plainText);

        // プレーンテキストとして挿入
        document.execCommand('insertHTML', false, escapedText);
        handleInput();
      }
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('ペースト操作でエラーが発生しました:', error);
      // エラーが発生した場合は通常のペースト動作にフォールバック
      // この場合はpreventDefaultを無効化できないため、ログのみ出力
    }
  }, [escapeHtml, handleInput]);

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    // コードブロック内でのEnterキーの処理
    const target = e.target as HTMLElement;
    if (target.tagName === 'PRE' && target.getAttribute('contenteditable') === 'true') {
      if (e.key === 'Enter') {
        e.preventDefault();
        // 改行を挿入
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          range.deleteContents();
          range.insertNode(document.createTextNode('\n'));
          range.collapse(false);
          selection.removeAllRanges();
          selection.addRange(range);
          handleInput();
        }
        return;
      }
    }

    // 通常のキーボードショートカット
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
  }, [executeCommand, insertLink, insertCode, insertCodeBlock, handleInput]);

  const handleFocus = useCallback(() => {
    setIsEditorFocused(true);
  }, []);

  const handleBlur = useCallback(() => {
    setIsEditorFocused(false);
  }, []);

  const showPlaceholder = !value || value.trim() === '';

  return (
    <Box
      sx={{
        position: 'relative',
        border: '1px solid',
        borderColor: 'border.default',
        borderRadius: 2,
        overflow: 'hidden',
        width: '100%',
        '&:focus-within': {
          borderColor: 'accent.fg',
          boxShadow: '0 0 0 2px rgba(9, 105, 218, 0.3)',
        },
      }}
    >
      {/* ツールバー */}
      {!disabled && (isEditorFocused || value) && (
        <Box
          sx={{
            p: 2,
            borderBottom: '1px solid',
            borderColor: 'border.default',
            bg: 'canvas.subtle',
          }}
        >
          <Box sx={{ display: 'flex', gap: 1 }}>
            <IconButton
              size="small"
              variant="invisible"
              icon={BoldIcon}
              onClick={() => executeCommand('bold')}
              aria-label="太字 (Ctrl+B)"
            />
            <IconButton
              size="small"
              variant="invisible"
              icon={ItalicIcon}
              onClick={() => executeCommand('italic')}
              aria-label="斜体 (Ctrl+I)"
            />
            <IconButton
              size="small"
              variant="invisible"
              icon={UnderlineIcon}
              onClick={() => executeCommand('underline')}
              aria-label="下線 (Ctrl+U)"
            />
            <IconButton
              size="small"
              variant="invisible"
              icon={StrikethroughIcon}
              onClick={() => executeCommand('strikeThrough')}
              aria-label="取り消し線 (Ctrl+Shift+X)"
            />
            <Box sx={{ width: '1px', bg: 'border.default', mx: 1 }} />
            <IconButton
              size="small"
              variant="invisible"
              icon={LinkIcon}
              onClick={insertLink}
              aria-label="リンク (Ctrl+K)"
            />
            <IconButton
              size="small"
              variant="invisible"
              icon={CodeIcon}
              onClick={insertCode}
              aria-label="インラインコード (Ctrl+`)"
            />
            <IconButton
              size="small"
              variant="invisible"
              icon={FileCodeIcon}
              onClick={insertCodeBlock}
              aria-label="コードブロック (Ctrl+Shift+`)"
            />
            <Box sx={{ width: '1px', bg: 'border.default', mx: 1 }} />
            <IconButton
              size="small"
              variant="invisible"
              icon={ListUnorderedIcon}
              onClick={() => executeCommand('insertUnorderedList')}
              aria-label="箇条書きリスト"
            />
            <IconButton
              size="small"
              variant="invisible"
              icon={ListOrderedIcon}
              onClick={() => executeCommand('insertOrderedList')}
              aria-label="番号付きリスト"
            />
            <Box sx={{ width: '1px', bg: 'border.default', mx: 1 }} />
            <IconButton
              ref={emojiButtonRef}
              size="small"
              variant="invisible"
              icon={SmileyIcon}
              onClick={handleEmojiPickerToggle}
              aria-label="絵文字を挿入"
            />
          </Box>
        </Box>
      )}

      {/* エディタ本体 */}
      <Box sx={{ position: 'relative', minHeight,}}>
        <Box
          ref={editorRef}
          as="div"
          contentEditable={!disabled}
          role="textbox"
          aria-multiline="true"
          aria-label="リッチテキストエディタ"
          aria-describedby={disabled ? undefined : "rich-editor-help"}
          onInput={handleInput}
          onKeyDown={handleKeyDown}
          onPaste={handlePaste}
          onFocus={handleFocus}
          onBlur={handleBlur}
          onClick={handleLinkClick}
          suppressContentEditableWarning
          sx={{
            minHeight: 'inherit',
            padding: '8px 12px',
            outline: 'none',
            fontSize: '14px',
            lineHeight: 1.5,
            fontFamily: 'inherit',
            '& ul, & ol': {
              paddingLeft: '24px',
              margin: '8px 0',
            },
            '& li': {
              margin: '4px 0',
            },
            '& code': {
              backgroundColor: '#e8f5e8',
              color: '#e01e5a',
              padding: '2px 4px',
              borderRadius: '4px',
              fontFamily: "'Monaco', 'Menlo', 'Consolas', monospace",
              fontSize: '0.875em',
              border: '1px solid #d1d9e0',
            },
            '& a': {
              color: 'accent.fg',
              textDecoration: 'none',
              cursor: 'pointer',
              '&:hover': {
                color: 'accent.emphasis',
                textDecoration: 'underline',
              },
            },
            '& pre[contenteditable="true"]': {
              outline: 'none',
              whiteSpace: 'pre',
              overflowWrap: 'normal',
              tabSize: 2,
              '&:focus': {
                backgroundColor: 'transparent',
              },
            },
            '& div:has(> pre[contenteditable="true"]):focus-within': {
              borderColor: '#0969da',
              boxShadow: '0 0 0 2px rgba(9, 105, 218, 0.3)',
            },
          }}
        />
        {showPlaceholder && (
          <Text
            sx={{
              position: 'absolute',
              top: '8px',
              left: '12px',
              color: 'fg.muted',
              pointerEvents: 'none',
              fontSize: 1,
            }}
          >
            {placeholder}
          </Text>
        )}
        {!disabled && !isEditorFocused && !value && (
          <Text
            sx={{
              position: 'absolute',
              bottom: '4px',
              right: '8px',
              fontSize: 0,
              color: 'fg.muted',
              pointerEvents: 'none',
            }}
          >
            クリックして編集
          </Text>
        )}

        {/* アクセシビリティ用のヘルプテキスト */}
        {!disabled && (
          <Text
            id="rich-editor-help"
            sx={{
              position: 'absolute',
              left: '-9999px',
              width: '1px',
              height: '1px',
              overflow: 'hidden',
            }}
          >
            リッチテキストエディタ。Ctrl+Bで太字、Ctrl+Iで斜体、Ctrl+Uで下線、Ctrl+Shift+Xで取り消し線、Ctrl+Kでリンク、Ctrl+`でコード、Ctrl+Shift+`でコードブロックを挿入できます。リンクをクリックで編集、Ctrl+クリックで新しいタブで開きます。ペーストはプレーンテキストとして貼り付けられます。
          </Text>
        )}
      </Box>

      {/* 絵文字ピッカー */}
      {showEmojiPicker && (
        <>
          {/* 絵文字ピッカー本体 */}
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
              onEmojiClick={handleEmojiClick}
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
        </>
      )}

      {/* ダイアログ */}
      <LinkInsertDialog
        isOpen={showLinkDialog}
        onInsert={handleLinkInsert}
        onCancel={() => {
          setShowLinkDialog(false);
          setSelectedText('');
          setSavedRange(null);
        }}
      />

      {/* リンク編集ダイアログ */}
      <LinkInsertDialog
        isOpen={showLinkEditDialog}
        onInsert={handleLinkEdit}
        onCancel={() => {
          setShowLinkEditDialog(false);
          setEditingLink(null);
        }}
        initialUrl={editingLink?.href || ''}
        initialText={editingLink?.textContent || ''}
        title="リンクを編集"
      />

    </Box>
  );
};

export default RichTextEditor;