/**
 * RichTextEditor utility functions
 *
 * This file contains utility functions for editor operations like
 * HTML insertion, command execution, and selection management.
 */

import type { EditorCommand } from '../types';

/**
 * Modern HTML insertion function using Selection API
 * Falls back to execCommand if modern approach fails
 */
export const insertHtmlAtCursor = (html: string): void => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  try {
    const range = selection.getRangeAt(0);
    range.deleteContents();

    // Parse HTML and insert as DOM elements
    const div = document.createElement("div");
    div.innerHTML = html;
    const fragment = document.createDocumentFragment();

    while (div.firstChild) {
      fragment.appendChild(div.firstChild);
    }

    range.insertNode(fragment);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  } catch (_error) {
    // Fallback to execCommand if modern approach fails
    try {
      document.execCommand("insertHTML", false, html);
    } catch (_fallbackError) {
      // Silently fail in production - both approaches failed
      // eslint-disable-next-line no-console
      console.warn('Failed to insert HTML:', _fallbackError);
    }
  }
};

/**
 * Execute editor commands with fallback support
 */
export const executeEditorCommand = (
  command: EditorCommand | string,
  value?: string,
  onInput?: () => void
): void => {
  try {
    switch (command) {
      case "bold":
        document.execCommand("bold", false);
        break;
      case "italic":
        document.execCommand("italic", false);
        break;
      case "underline":
        document.execCommand("underline", false);
        break;
      case "strikethrough":
        document.execCommand("strikeThrough", false);
        break;
      case "unorderedList":
        document.execCommand("insertUnorderedList", false);
        break;
      case "orderedList":
        document.execCommand("insertOrderedList", false);
        break;
      default:
        // Fallback for other commands
        if (value) {
          document.execCommand(command, false, value);
        } else {
          document.execCommand(command);
        }
    }
    onInput?.();
  } catch (_error) {
    // Command execution failed, try fallback
    try {
      if (value) {
        document.execCommand(command, false, value);
      } else {
        document.execCommand(command);
      }
      onInput?.();
    } catch (_fallbackError) {
      // eslint-disable-next-line no-console
      console.warn('Failed to execute editor command:', _fallbackError);
    }
  }
};

/**
 * Get current selection range
 */
export const getCurrentRange = (): Range | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }
  return selection.getRangeAt(0);
};

/**
 * Restore selection range
 */
export const restoreRange = (range: Range): void => {
  const selection = window.getSelection();
  if (selection) {
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

/**
 * Save current selection
 */
export const saveSelection = (): Range | null => {
  const selection = window.getSelection();
  if (selection && selection.rangeCount > 0) {
    return selection.getRangeAt(0).cloneRange();
  }
  return null;
};

/**
 * Focus editor and place cursor at the end
 */
export const focusEditor = (element: HTMLElement): void => {
  element.focus();

  // Place cursor at the end
  const selection = window.getSelection();
  if (selection) {
    const range = document.createRange();
    range.selectNodeContents(element);
    range.collapse(false);
    selection.removeAllRanges();
    selection.addRange(range);
  }
};

/**
 * Check if current selection has specific formatting
 */
export const isFormatActive = (command: string): boolean => {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
};

/**
 * Get selected text content
 */
export const getSelectedText = (): string => {
  const selection = window.getSelection();
  return selection ? selection.toString() : '';
};

/**
 * Wrap selection with HTML tags
 */
export const wrapSelection = (startTag: string, endTag: string): void => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const range = selection.getRangeAt(0);
  const selectedText = range.toString();

  if (selectedText) {
    const html = `${startTag}${selectedText}${endTag}`;
    insertHtmlAtCursor(html);
  }
};