import { useState, useCallback } from 'react';
import { insertHtmlAtCursor } from '../utils/htmlHelpers';

/**
 * リンク管理用カスタムフック
 */
export const useLinkManagement = (
  editorRef: React.RefObject<HTMLDivElement>,
  handleInput: () => void
) => {
  const [showLinkDialog, setShowLinkDialog] = useState(false);
  const [selectedText, setSelectedText] = useState('');
  const [savedRange, setSavedRange] = useState<Range | null>(null);
  const [editingLink, setEditingLink] = useState<HTMLAnchorElement | null>(null);
  const [showLinkEditDialog, setShowLinkEditDialog] = useState(false);

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
        insertHtmlAtCursor(linkHtml);
      } else {
        // 選択がない場合は新しいリンクを挿入
        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${linkText || url}</a>`;
        insertHtmlAtCursor(linkHtml);
      }

      handleInput();
    }
    setShowLinkDialog(false);
    setSelectedText('');
    setSavedRange(null);
  }, [selectedText, savedRange, handleInput, editorRef]);

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
  }, [editingLink, handleInput, editorRef]);

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

  return {
    // ダイアログ状態
    showLinkDialog,
    showLinkEditDialog,

    // リンク情報
    selectedText,
    editingLink,

    // ハンドラー
    insertLink,
    handleLinkInsert,
    handleLinkEdit,
    handleLinkClick,

    // ダイアログ制御
    setShowLinkDialog,
    setShowLinkEditDialog,
    setSelectedText,
    setSavedRange,
    setEditingLink,
  };
};