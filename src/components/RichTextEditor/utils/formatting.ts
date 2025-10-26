/**
 * Text formatting utility functions
 *
 * This file contains utility functions for text formatting operations
 * like creating code blocks, links, and checking format states.
 */

import type { FormatState } from '../types';
import { insertHtmlAtCursor } from './editor';
import { EDITOR_STYLES, createInlineStyleString } from '../constants/styles';

/**
 * Create an inline code element with proper styling
 */
export const createInlineCode = (text: string): string => {
  const styleString = createInlineStyleString(EDITOR_STYLES.code);
  return `<code style="${styleString}">${text}</code>`;
};

/**
 * Create a code block element with proper styling
 */
export const createCodeBlock = (content: string): string => {
  const styleString = createInlineStyleString(EDITOR_STYLES.codeBlock);
  return `<pre style="${styleString}"><code>${content}</code></pre>`;
};

/**
 * Insert code block at cursor position
 */
export const insertCodeBlock = (): void => {
  const selection = window.getSelection();
  if (!selection) {
    return;
  }

  const selectedText = selection.toString();
  const content = selectedText || 'コードをここに入力';
  const codeBlockHtml = createCodeBlock(content);

  insertHtmlAtCursor(codeBlockHtml);
};

/**
 * Apply inline code formatting to selected text
 */
export const applyInlineCode = (): void => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  const selectedText = selection.toString();
  if (selectedText) {
    const codeHtml = createInlineCode(selectedText);
    insertHtmlAtCursor(codeHtml);
  }
};

/**
 * Create a link element
 */
export const createLink = (text: string, url: string): string => {
  const styleString = createInlineStyleString(EDITOR_STYLES.link);
  return `<a href="${url}" style="${styleString}" target="_blank" rel="noopener noreferrer">${text}</a>`;
};

/**
 * Get current format state for toolbar buttons
 */
export const getCurrentFormatState = (): FormatState => ({
  bold: isCommandActive('bold'),
  italic: isCommandActive('italic'),
  underline: isCommandActive('underline'),
  strikethrough: isCommandActive('strikeThrough'),
});

/**
 * Check if a command is currently active
 */
const isCommandActive = (command: string): boolean => {
  try {
    return document.queryCommandState(command);
  } catch {
    return false;
  }
};

/**
 * Toggle list formatting (unordered/ordered)
 */
export const toggleList = (type: 'unordered' | 'ordered'): void => {
  const command = type === 'unordered' ? 'insertUnorderedList' : 'insertOrderedList';
  try {
    document.execCommand(command, false);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to toggle ${type} list:`, error);
  }
};

/**
 * Remove formatting from selected text
 */
export const removeFormatting = (): void => {
  try {
    document.execCommand('removeFormat', false);
  } catch (error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to remove formatting:', error);
  }
};

/**
 * Insert emoji at cursor position
 */
export const insertEmoji = (emoji: string): void => {
  insertHtmlAtCursor(emoji);
};

/**
 * Check if current cursor is inside a link
 */
export const getCurrentLink = (): HTMLAnchorElement | null => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return null;
  }

  let node = selection.getRangeAt(0).commonAncestorContainer;

  // Traverse up the DOM tree to find a link element
  while (node && node !== document.body) {
    if (node.nodeType === Node.ELEMENT_NODE && (node as Element).tagName === 'A') {
      return node as HTMLAnchorElement;
    }
    const parentNode = node.parentNode;
    if (!parentNode) {
      break;
    }
    node = parentNode;
  }

  return null;
};

/**
 * Update existing link URL
 */
export const updateLinkUrl = (link: HTMLAnchorElement, newUrl: string): void => {
  link.href = newUrl;
};