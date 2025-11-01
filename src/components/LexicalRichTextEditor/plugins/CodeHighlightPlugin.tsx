/**
 * Code Highlight Plugin
 *
 * Plugin to enable syntax highlighting for code blocks using Prism.js
 */

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { registerCodeHighlighting } from '@lexical/code';

/**
 * Code Highlight Plugin Component
 *
 * Registers syntax highlighting for code blocks
 * Uses Prism.js for language-specific highlighting
 */
export function CodeHighlightPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => registerCodeHighlighting(editor), [editor]);

  return null;
}
