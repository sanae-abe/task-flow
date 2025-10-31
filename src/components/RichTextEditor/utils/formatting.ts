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
  const preStyleString = createInlineStyleString(EDITOR_STYLES.codeBlock);
  const codeStyleString = createInlineStyleString(EDITOR_STYLES.codeBlockInner);
  return `<pre style="${preStyleString}"><code style="${codeStyleString}">${content}</code></pre>`;
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
  const command =
    type === 'unordered' ? 'insertUnorderedList' : 'insertOrderedList';
  try {
    document.execCommand(command, false);
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.warn(`Failed to toggle ${type} list:`, _error);
  }
};

/**
 * Remove formatting from selected text (including code blocks and inline code)
 */
export const removeFormatting = (): void => {
  const selection = window.getSelection();
  if (!selection || selection.rangeCount === 0) {
    return;
  }

  // If no text is selected, select all content in the editor
  if (selection.toString().trim() === '') {
    const editorElement = selection.focusNode?.parentElement?.closest(
      '[contenteditable="true"]'
    );
    if (editorElement) {
      const range = document.createRange();
      range.selectNodeContents(editorElement);
      selection.removeAllRanges();
      selection.addRange(range);
    }
  }

  try {
    // First try the standard removeFormat command
    document.execCommand('removeFormat', false);

    // Additional cleanup for code elements that might not be removed by removeFormat
    const range = selection.getRangeAt(0);
    const container = range.commonAncestorContainer;

    // Find the editor container
    let editorContainer: HTMLElement | null = null;
    let currentNode: Node | null = container;

    if (currentNode.nodeType === Node.TEXT_NODE) {
      currentNode = currentNode.parentElement;
    }

    while (currentNode && currentNode.nodeType === Node.ELEMENT_NODE) {
      const element = currentNode as HTMLElement;
      if (element.matches && element.matches('[contenteditable="true"]')) {
        editorContainer = element;
        break;
      }
      currentNode = currentNode.parentElement;
    }

    if (editorContainer) {
      // Remove code blocks and inline code within the selection
      const codeElements = editorContainer.querySelectorAll('pre, code');
      codeElements.forEach((codeElement: Element) => {
        if (selection.containsNode(codeElement, true)) {
          // Replace code element with its text content
          const textContent = codeElement.textContent || '';
          const textNode = document.createTextNode(textContent);
          codeElement.parentNode?.replaceChild(textNode, codeElement);
        }
      });

      // Remove lists (UL/OL) and convert list items to paragraphs
      const listElements = editorContainer.querySelectorAll('ul, ol');
      listElements.forEach((listElement: Element) => {
        if (selection.containsNode(listElement, true)) {
          // Get all list items
          const listItems = listElement.querySelectorAll('li');
          const fragment = document.createDocumentFragment();

          listItems.forEach((li: Element) => {
            // Create a paragraph for each list item
            const paragraph = document.createElement('p');
            paragraph.textContent = li.textContent || '';
            fragment.appendChild(paragraph);
          });

          // Replace the entire list with paragraphs
          listElement.parentNode?.replaceChild(fragment, listElement);
        }
      });

      // Also handle individual list items that might be selected
      const listItemElements = editorContainer.querySelectorAll('li');
      listItemElements.forEach((listItem: Element) => {
        if (selection.containsNode(listItem, true)) {
          // Convert list item to paragraph
          const paragraph = document.createElement('p');
          paragraph.textContent = listItem.textContent || '';
          listItem.parentNode?.replaceChild(paragraph, listItem);
        }
      });

      // Remove any remaining style attributes
      const styledElements = editorContainer.querySelectorAll('[style]');
      styledElements.forEach((element: Element) => {
        if (selection.containsNode(element, true)) {
          element.removeAttribute('style');
        }
      });
    }
  } catch (_error) {
    // eslint-disable-next-line no-console
    console.warn('Failed to remove formatting:', _error);
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
    if (
      node.nodeType === Node.ELEMENT_NODE &&
      (node as Element).tagName === 'A'
    ) {
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
export const updateLinkUrl = (
  link: HTMLAnchorElement,
  newUrl: string
): void => {
  link.href = newUrl;
};
