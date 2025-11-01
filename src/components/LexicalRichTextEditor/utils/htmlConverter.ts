/**
 * HTML ↔ Lexical Conversion Utilities
 *
 * Utilities for converting between HTML strings and Lexical editor state
 * with DOMPurify integration for security
 */

import DOMPurify from 'dompurify';
import { $generateHtmlFromNodes, $generateNodesFromDOM } from '@lexical/html';
import { $getRoot, $insertNodes, type LexicalEditor } from 'lexical';

/**
 * Convert HTML string to Lexical nodes
 * @param editor - Lexical editor instance
 * @param html - HTML string to convert
 */
export function htmlToLexical(editor: LexicalEditor, html: string): void {
  if (!html || html.trim() === '') {
    return;
  }

  editor.update(() => {
    // Sanitize HTML with DOMPurify
    const cleanHtml = DOMPurify.sanitize(html, {
      ALLOWED_TAGS: [
        'p',
        'br',
        'strong',
        'b',
        'em',
        'i',
        'u',
        's',
        'strike',
        'a',
        'code',
        'pre',
        'ul',
        'ol',
        'li',
        'h1',
        'h2',
        'h3',
        'blockquote',
      ],
      ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
    });

    // Parse HTML to DOM
    const parser = new DOMParser();
    const dom = parser.parseFromString(cleanHtml, 'text/html');

    // Generate Lexical nodes from DOM
    const nodes = $generateNodesFromDOM(editor, dom);

    // Clear existing content and insert new nodes
    const root = $getRoot();
    root.clear();
    $insertNodes(nodes);
  });
}

/**
 * Convert Lexical editor state to HTML string
 * @param editor - Lexical editor instance
 * @returns HTML string
 */
export function lexicalToHtml(editor: LexicalEditor): string {
  let htmlString = '';

  editor.getEditorState().read(() => {
    htmlString = $generateHtmlFromNodes(editor, null);
  });

  // Sanitize output HTML with same configuration as input
  return DOMPurify.sanitize(htmlString, {
    ALLOWED_TAGS: [
      'p',
      'br',
      'strong',
      'b',
      'em',
      'i',
      'u',
      's',
      'strike',
      'a',
      'code',
      'pre',
      'ul',
      'ol',
      'li',
      'h1',
      'h2',
      'h3',
      'blockquote',
      'span', // Allow span tags (Lexical may use them for formatting)
    ],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'style', 'class'],
  });
}

/**
 * Check if HTML content is empty or contains only whitespace
 * @param html - HTML string to check
 * @returns true if empty, false otherwise
 */
export function isHtmlEmpty(html: string): boolean {
  if (!html || html.trim() === '') {
    return true;
  }

  const tempDiv = document.createElement('div');
  tempDiv.innerHTML = DOMPurify.sanitize(html);
  const textContent = tempDiv.textContent || tempDiv.innerText || '';

  return textContent.trim() === '';
}
