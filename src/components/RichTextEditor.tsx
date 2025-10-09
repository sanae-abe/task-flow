import { Box, Text, IconButton } from '@primer/react';
import { BoldIcon, ItalicIcon, ListUnorderedIcon, ListOrderedIcon, LinkIcon, CodeIcon, FileCodeIcon } from '@primer/octicons-react';
import React, { useRef, useCallback, useEffect, useState } from 'react';

import LinkInsertDialog from './LinkInsertDialog';

// 下線アイコン（カスタム）
const UnderlineIcon = () => (
  <svg width="16" height="16" viewBox="0 0 16 16" fill="currentColor">
    <path d="M8 13c2.21 0 4-1.79 4-4V3h-1.5v6c0 1.38-1.12 2.5-2.5 2.5S5.5 10.38 5.5 9V3H4v6c0 2.21 1.79 4 4 4z"/>
    <path d="M3 14h10v1H3v-1z"/>
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

  // 値が変更されたときにエディタの内容を更新
  useEffect(() => {
    if (editorRef.current && editorRef.current.innerHTML !== value) {
      editorRef.current.innerHTML = value;
    }
  }, [value]);

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


  const handlePaste = useCallback((e: React.ClipboardEvent) => {
    e.preventDefault();

    // クリップボードからプレーンテキストを取得
    const plainText = e.clipboardData.getData('text/plain');

    if (plainText) {
      // HTMLエスケープして安全にする
      const escapedText = plainText
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;')
        .replace(/\n/g, '<br>'); // 改行をBRタグに変換

      // プレーンテキストとして挿入
      document.execCommand('insertHTML', false, escapedText);
      handleInput();
    }
  }, [handleInput]);

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
              textDecoration: 'underline',
              '&:hover': {
                color: 'accent.emphasis',
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
            リッチテキストエディタ。Ctrl+Bで太字、Ctrl+Iで斜体、Ctrl+Uで下線、Ctrl+Kでリンク、Ctrl+`でコード、Ctrl+Shift+`でコードブロックを挿入できます。ペーストはプレーンテキストとして貼り付けられます。
          </Text>
        )}
      </Box>

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

    </Box>
  );
};

export default RichTextEditor;