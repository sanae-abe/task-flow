/**
 * Editor event handlers hook
 *
 * This hook manages all event handlers for the RichTextEditor component
 * including input, focus, blur, keyboard, and click events.
 */

import { useCallback } from 'react';
import type { UseEditorStateReturn } from './useEditorState';
import {
  executeEditorCommand,
  saveSelection,
  restoreRange,
  getSelectedText,
} from '../utils/editor';
import {
  applyInlineCode,
  insertCodeBlock,
  removeFormatting,
} from '../utils/formatting';

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
  disabled,
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
  } = editorState;

  // Handle input changes
  const handleInput = useCallback(() => {
    if (editorRef.current && onChange && !disabled) {
      onChange(editorRef.current.innerHTML);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [onChange, disabled]); // editorRef is intentionally omitted (stable ref)

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
  const handleKeyDown = useCallback(
    (event: React.KeyboardEvent) => {
      if (disabled) {
        return;
      }

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

      // Handle Delete and Backspace keys for code blocks
      if (key === 'Delete' || key === 'Backspace') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);

          // Check if we're deleting an empty code block
          if (range.collapsed) {
            const container = range.startContainer;
            let codeElement: Element | null = null;

            // Find if we're inside a code block
            let node = container;
            while (node && node !== editorRef.current) {
              if (node.nodeType === Node.ELEMENT_NODE) {
                const element = node as Element;
                if (element.tagName === 'PRE' || element.tagName === 'CODE') {
                  codeElement = element;
                  break;
                }
              }
              const parentNode = node.parentNode;
              if (!parentNode) {
                break;
              }
              node = parentNode;
            }

            // If we're in an empty code block, remove it entirely
            if (codeElement && codeElement.textContent?.trim() === '') {
              event.preventDefault();
              const textNode = document.createTextNode('');
              codeElement.parentNode?.replaceChild(textNode, codeElement);

              // Position cursor after the replacement
              const newRange = document.createRange();
              newRange.setStartAfter(textNode);
              newRange.collapse(true);
              selection.removeAllRanges();
              selection.addRange(newRange);

              handleInput();
              return;
            }

            // If we're at the boundary of a code block, handle deletion specially
            if (codeElement) {
              const isAtStart = range.startOffset === 0;
              const isAtEnd =
                range.startOffset === (container.textContent?.length || 0);

              if (
                (key === 'Backspace' && isAtStart) ||
                (key === 'Delete' && isAtEnd)
              ) {
                // Allow deletion to potentially break out of code block
                // This will be handled by the browser's default behavior
                return;
              }
            }
          }
        }
      }

      // Handle Escape key to exit code blocks and lists
      if (key === 'Escape') {
        event.preventDefault();

        // Direct DOM manipulation for escape
        if (editorRef.current) {
          try {
            // Create a new paragraph element
            const newParagraph = document.createElement('p');
            newParagraph.innerHTML = '<br>';

            // Append it to the end of the editor
            editorRef.current.appendChild(newParagraph);

            // Move cursor to the new paragraph
            const range = document.createRange();
            range.setStart(newParagraph, 0);
            range.collapse(true);

            const selection = window.getSelection();
            if (selection) {
              selection.removeAllRanges();
              selection.addRange(range);
            }

            // Focus the editor
            editorRef.current.focus();

            // Scroll to the new paragraph
            newParagraph.scrollIntoView({
              behavior: 'smooth',
              block: 'nearest',
            });

            handleInput();
          } catch (_error) {
            // Ultimate fallback: focus editor and scroll to bottom
            editorRef.current.focus();
            editorRef.current.scrollTop = editorRef.current.scrollHeight;
          }
        }
        return;
      }

      // Handle Enter key in code blocks and lists
      if (key === 'Enter') {
        const selection = window.getSelection();
        if (selection && selection.rangeCount > 0) {
          const range = selection.getRangeAt(0);
          let node = range.startContainer;
          let codeElement: Element | null = null;
          let listElement: Element | null = null;

          // Check if we're inside a code block or list
          while (node && node !== editorRef.current) {
            if (node.nodeType === Node.ELEMENT_NODE) {
              const element = node as Element;
              if (element.tagName === 'PRE' || element.tagName === 'CODE') {
                codeElement = element;
              }
              if (
                element.tagName === 'UL' ||
                element.tagName === 'OL' ||
                element.tagName === 'LI'
              ) {
                listElement = element;
              }
            }
            const parentNode = node.parentNode;
            if (!parentNode) {
              break;
            }
            node = parentNode;
          }

          // Shift+Enter always escapes from code blocks and lists
          if (event.shiftKey) {
            event.preventDefault();

            // Direct DOM manipulation for Shift+Enter
            if (editorRef.current) {
              try {
                // Create a new paragraph element
                const newParagraph = document.createElement('p');
                newParagraph.innerHTML = '<br>';

                // Append it to the end of the editor
                editorRef.current.appendChild(newParagraph);

                // Move cursor to the new paragraph
                const range = document.createRange();
                range.setStart(newParagraph, 0);
                range.collapse(true);

                const selection = window.getSelection();
                if (selection) {
                  selection.removeAllRanges();
                  selection.addRange(range);
                }

                // Focus the editor
                editorRef.current.focus();

                // Scroll to the new paragraph
                newParagraph.scrollIntoView({
                  behavior: 'smooth',
                  block: 'nearest',
                });

                handleInput();
              } catch (_error) {
                // Ultimate fallback: focus editor and scroll to bottom
                editorRef.current.focus();
                editorRef.current.scrollTop = editorRef.current.scrollHeight;
              }
            }
            return;
          }

          // Handle Enter in code blocks
          if (codeElement) {
            const parentElement =
              codeElement.tagName === 'CODE'
                ? codeElement.parentElement
                : codeElement;
            if (parentElement && parentElement.tagName === 'PRE') {
              // Always prevent default behavior to avoid creating new <pre> tags
              event.preventDefault();

              // Check if user pressed Enter twice (double Enter to escape)
              const codeContent = parentElement.textContent || '';
              const endsWithDoubleNewline =
                codeContent.endsWith('\n\n') || codeContent.endsWith('\n ');

              if (endsWithDoubleNewline) {
                // Double Enter pressed - escape from code block
                // Remove the extra newlines from the code block
                const cleanContent = codeContent
                  .replace(/\n\n$/, '\n')
                  .replace(/\n $/, '');
                if (parentElement.firstChild) {
                  parentElement.firstChild.textContent = cleanContent;
                }

                // Create a new paragraph after the code block
                const paragraph = document.createElement('p');
                paragraph.appendChild(document.createTextNode(''));
                parentElement.parentNode?.insertBefore(
                  paragraph,
                  parentElement.nextSibling
                );

                // Move cursor to the new paragraph
                const newRange = document.createRange();
                newRange.setStart(paragraph, 0);
                newRange.collapse(true);
                selection.removeAllRanges();
                selection.addRange(newRange);

                handleInput();
                return;
              } else {
                // Single Enter - add line break within code block
                const range = selection.getRangeAt(0);

                // Insert a plain newline character
                const textNode = document.createTextNode('\n');
                range.deleteContents();
                range.insertNode(textNode);

                // Position cursor after the newline
                range.setStartAfter(textNode);
                range.collapse(true);
                selection.removeAllRanges();
                selection.addRange(range);

                handleInput();
                return;
              }
            }
          }

          // Handle Enter in lists
          if (listElement) {
            // Find the list item we're in
            let listItem: Element | null = null;
            let currentNode = range.startContainer;

            while (currentNode && currentNode !== editorRef.current) {
              if (
                currentNode.nodeType === Node.ELEMENT_NODE &&
                (currentNode as Element).tagName === 'LI'
              ) {
                listItem = currentNode as Element;
                break;
              }
              const parentNode = currentNode.parentNode;
              if (!parentNode) {
                break;
              }
              currentNode = parentNode;
            }

            if (listItem) {
              const listItemContent = listItem.textContent || '';
              const isEmptyListItem = listItemContent.trim() === '';

              if (isEmptyListItem) {
                // Empty list item - break out of the list
                event.preventDefault();

                const list = listItem.parentElement;
                if (list) {
                  // Create a new paragraph after the list
                  const paragraph = document.createElement('p');
                  paragraph.appendChild(document.createTextNode(''));

                  // Remove the empty list item
                  listItem.remove();

                  // If the list is now empty, remove it entirely
                  if (list.children.length === 0) {
                    list.parentNode?.replaceChild(paragraph, list);
                  } else {
                    list.parentNode?.insertBefore(paragraph, list.nextSibling);
                  }

                  // Move cursor to the new paragraph
                  const newRange = document.createRange();
                  newRange.setStart(paragraph, 0);
                  newRange.collapse(true);
                  selection.removeAllRanges();
                  selection.addRange(newRange);

                  handleInput();
                  return;
                }
              }
            }
            // If not an empty list item, allow default behavior (new list item)
            return;
          }
        }
      }
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [disabled, handleInput, setSelectedText, setSavedRange, setShowLinkDialog]
  ); // editorRef is intentionally omitted (stable ref)

  // Handle paste events
  const handlePaste = useCallback(
    (event: React.ClipboardEvent) => {
      if (disabled) {
        return;
      }

      event.preventDefault();
      const text = event.clipboardData.getData('text/plain');

      if (text) {
        executeEditorCommand('insertText', text, handleInput);
      }
    },
    [disabled, handleInput]
  );

  // Handle link clicks in editor
  const handleLinkClick = useCallback(
    (event: React.MouseEvent) => {
      if (disabled) {
        return;
      }

      const target = event.target as HTMLElement;
      if (target.tagName === 'A') {
        event.preventDefault();
        const link = target as HTMLAnchorElement;
        setEditingLink(link);
        setShowLinkEditDialog(true);
      }
    },
    [disabled, setEditingLink, setShowLinkEditDialog]
  );

  // Handle toolbar button clicks
  const handleToolbarButtonClick = useCallback(
    (command: string) => {
      if (disabled || !editorRef.current) {
        return;
      }

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
        case 'escape':
          // Force create a new paragraph using direct DOM manipulation
          if (editorRef.current) {
            try {
              // Create a new paragraph element
              const newParagraph = document.createElement('p');
              newParagraph.innerHTML = '<br>';

              // Append it to the end of the editor
              editorRef.current.appendChild(newParagraph);

              // Move cursor to the new paragraph
              const range = document.createRange();
              range.setStart(newParagraph, 0);
              range.collapse(true);

              const selection = window.getSelection();
              if (selection) {
                selection.removeAllRanges();
                selection.addRange(range);
              }

              // Focus the editor
              editorRef.current.focus();

              // Scroll to the new paragraph
              newParagraph.scrollIntoView({
                behavior: 'smooth',
                block: 'nearest',
              });

              handleInput();
            } catch (_error) {
              // Ultimate fallback: focus editor and scroll to bottom
              editorRef.current.focus();
              editorRef.current.scrollTop = editorRef.current.scrollHeight;
            }
          }
          break;
        case 'removeFormatting':
          removeFormatting();
          handleInput();
          break;
      }

      setTimeout(() => setIsToolbarInteraction(false), 100);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      disabled,
      handleInput,
      setIsToolbarInteraction,
      setSelectedText,
      setSavedRange,
      setShowLinkDialog,
      setSavedEmojiRange,
      setShowEmojiPicker,
    ]
  ); // editorRef is intentionally omitted (stable ref)

  // Handle link insertion
  const handleLinkInsert = useCallback(
    (url: string) => {
      if (savedRange && editorRef.current) {
        editorRef.current.focus();
        restoreRange(savedRange);

        const linkHtml = `<a href="${url}" target="_blank" rel="noopener noreferrer">${editorState.selectedText}</a>`;
        executeEditorCommand('insertHTML', linkHtml, handleInput);
      }

      setShowLinkDialog(false);
      setSelectedText('');
      setSavedRange(null);
      // eslint-disable-next-line react-hooks/exhaustive-deps
    },
    [
      savedRange,
      editorState.selectedText,
      handleInput,
      setShowLinkDialog,
      setSelectedText,
      setSavedRange,
    ]
  ); // editorRef is intentionally omitted (stable ref)

  // Handle link editing
  const handleLinkEdit = useCallback(
    (url: string) => {
      if (editingLink) {
        editingLink.href = url;
        handleInput();
      }

      setShowLinkEditDialog(false);
      setEditingLink(null);
    },
    [editingLink, handleInput, setShowLinkEditDialog, setEditingLink]
  );

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
