/**
 * Editor event handlers hook
 *
 * This hook manages all event handlers for the RichTextEditor component
 * including input, focus, blur, keyboard, and click events.
 */

import { useCallback } from 'react';
import type { UseEditorStateReturn } from './useEditorState';
import { executeEditorCommand, saveSelection, restoreRange, getSelectedText } from '../utils/editor';
import { applyInlineCode, insertCodeBlock, getCurrentLink } from '../utils/formatting';

export interface UseEditorHandlersProps {
  editorState: UseEditorStateReturn;
  onChange?: (value: string) => void;
  disabled?: boolean;
}

export interface UseEditorHandlersReturn {
  handleInput: () => void;
  handleFocus: () => void;
  handleBlur: () => void;
  handleKeyDown: (event: React.KeyboardEvent) => void;
  handlePaste: (event: React.ClipboardEvent) => void;
  handleLinkClick: (event: React.MouseEvent) => void;
  handleToolbarButtonClick: (command: string) => void;
  handleLinkInsert: (url: string) => void;
  handleLinkEdit: (url: string) => void;
}

export const useEditorHandlers = ({
  editorState,
  onChange,
  disabled
}: UseEditorHandlersProps): UseEditorHandlersReturn => {
  const {
    editorRef,
    setIsEditorFocused,
    setShowLinkDialog,
    setSelectedText,
    setSavedRange,
    setEditingLink,
    setShowLinkEditDialog,
    setShowEmojiPicker,
    setSavedEmojiRange,
    setIsToolbarInteraction,
    savedRange,
    editingLink,
    savedEmojiRange,
  } = editorState;

  // Handle input changes
  const handleInput = useCallback(() => {
    if (editorRef.current && onChange && !disabled) {
      onChange(editorRef.current.innerHTML);
    }
  }, [onChange, disabled]);

  // Handle editor focus
  const handleFocus = useCallback(() => {
    if (!disabled) {
      setIsEditorFocused(true);
    }
  }, [disabled, setIsEditorFocused]);

  // Handle editor blur
  const handleBlur = useCallback(() => {
    // Delay blur to handle toolbar interactions
    setTimeout(() => {
      setIsEditorFocused(false);
    }, 100);
  }, [setIsEditorFocused]);

  // Handle keyboard shortcuts
  const handleKeyDown = useCallback((event: React.KeyboardEvent) => {
    if (disabled) return;

    const { ctrlKey, metaKey, key } = event;
    const isCmd = ctrlKey || metaKey;

    if (isCmd) {
      switch (key.toLowerCase()) {
        case 'b':
          event.preventDefault();
          executeEditorCommand('bold', undefined, handleInput);
          break;
        case 'i':
          event.preventDefault();
          executeEditorCommand('italic', undefined, handleInput);
          break;
        case 'u':
          event.preventDefault();
          executeEditorCommand('underline', undefined, handleInput);
          break;
        case 'k':
          event.preventDefault();
          const selection = getSelectedText();
          if (selection) {
            setSelectedText(selection);
            setSavedRange(saveSelection());
            setShowLinkDialog(true);
          }
          break;
        case '`':
          event.preventDefault();
          applyInlineCode();
          handleInput();
          break;
      }
    }

    // Handle Enter key in code blocks
    if (key === 'Enter') {
      const selection = window.getSelection();
      if (selection && selection.rangeCount > 0) {
        const range = selection.getRangeAt(0);
        let node = range.startContainer;

        // Check if we're inside a code block
        while (node && node !== editorRef.current) {
          if (node.nodeType === Node.ELEMENT_NODE) {
            const element = node as Element;
            if (element.tagName === 'PRE' || element.tagName === 'CODE') {
              // We're in a code block, allow default behavior
              return;
            }
          }
          node = node.parentNode;
        }
      }
    }
  }, [disabled, handleInput, setSelectedText, setSavedRange, setShowLinkDialog]);

  // Handle paste events
  const handlePaste = useCallback((event: React.ClipboardEvent) => {
    if (disabled) return;

    event.preventDefault();
    const text = event.clipboardData.getData('text/plain');

    if (text) {
      executeEditorCommand('insertText', text, handleInput);
    }
  }, [disabled, handleInput]);

  // Handle link clicks in editor
  const handleLinkClick = useCallback((event: React.MouseEvent) => {
    if (disabled) return;

    const target = event.target as HTMLElement;
    if (target.tagName === 'A') {
      event.preventDefault();
      const link = target as HTMLAnchorElement;
      setEditingLink(link);
      setShowLinkEditDialog(true);
    }
  }, [disabled, setEditingLink, setShowLinkEditDialog]);

  // Handle toolbar button clicks
  const handleToolbarButtonClick = useCallback((command: string) => {
    if (disabled || !editorRef.current) return;

    setIsToolbarInteraction(true);
    editorRef.current.focus();

    switch (command) {
      case 'bold':
      case 'italic':
      case 'underline':
      case 'strikethrough':
      case 'unorderedList':
      case 'orderedList':
        executeEditorCommand(command, undefined, handleInput);
        break;
      case 'code':
        applyInlineCode();
        handleInput();
        break;
      case 'codeBlock':
        insertCodeBlock();
        handleInput();
        break;
      case 'link':
        const selection = getSelectedText();
        if (selection) {
          setSelectedText(selection);
          setSavedRange(saveSelection());
          setShowLinkDialog(true);
        }
        break;
      case 'emoji':
        setSavedEmojiRange(saveSelection());
        setShowEmojiPicker(true);
        break;
    }

    setTimeout(() => setIsToolbarInteraction(false), 100);
  }, [
    disabled,
    handleInput,
    setIsToolbarInteraction,
    setSelectedText,
    setSavedRange,
    setShowLinkDialog,
    setSavedEmojiRange,
    setShowEmojiPicker
  ]);

  // Handle link insertion
  const handleLinkInsert = useCallback((url: string) => {
    if (savedRange && editorRef.current) {
      editorRef.current.focus();
      restoreRange(savedRange);

      const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${editorState.selectedText}</a>`;
      executeEditorCommand('insertHTML', linkHtml, handleInput);
    }

    setShowLinkDialog(false);
    setSelectedText("");
    setSavedRange(null);
  }, [savedRange, editorState.selectedText, handleInput, setShowLinkDialog, setSelectedText, setSavedRange]);

  // Handle link editing
  const handleLinkEdit = useCallback((url: string) => {
    if (editingLink) {
      editingLink.href = url;
      handleInput();
    }

    setShowLinkEditDialog(false);
    setEditingLink(null);
  }, [editingLink, handleInput, setShowLinkEditDialog, setEditingLink]);

  return {
    handleInput,
    handleFocus,
    handleBlur,
    handleKeyDown,
    handlePaste,
    handleLinkClick,
    handleToolbarButtonClick,
    handleLinkInsert,
    handleLinkEdit,
  };
};