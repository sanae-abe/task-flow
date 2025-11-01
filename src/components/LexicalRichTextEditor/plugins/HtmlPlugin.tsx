/**
 * HTML Synchronization Plugin
 *
 * Plugin to synchronize HTML content with Lexical editor state
 */

import { useEffect, useRef } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { htmlToLexical } from '../utils/htmlConverter';

interface HtmlPluginProps {
  initialHtml?: string;
}

/**
 * Plugin to load initial HTML content into the editor
 * Updates when initialHtml prop changes
 */
export function HtmlPlugin({ initialHtml }: HtmlPluginProps): null {
  const [editor] = useLexicalComposerContext();
  const previousInitialHtml = useRef<string>('');
  const hasInitialized = useRef(false);

  useEffect(() => {
    // Skip if already initialized and content hasn't changed meaningfully
    if (hasInitialized.current && previousInitialHtml.current === initialHtml) {
      return;
    }

    // Check if editor currently has content
    const editorState = editor.getEditorState();
    const isEmpty = editorState.read(() => {
      const root = editorState._nodeMap.get('root');
      if (!root) return true;
      const textContent = root.getTextContent?.() || '';
      return textContent.trim() === '';
    });

    // Allow initialization when going from empty to non-empty (handles async state updates)
    const wasEmpty = previousInitialHtml.current.trim() === '';
    const isNowNonEmpty = initialHtml && initialHtml.trim() !== '';

    // Don't re-initialize if:
    // 1. Already initialized
    // 2. Previously had content (not empty)
    // 3. Editor currently has content (user may have edited)
    if (hasInitialized.current && !wasEmpty && !isEmpty) {
      // Protect user edits - don't overwrite content
      return;
    }

    // Update the editor content when initialHtml changes
    if (isNowNonEmpty) {
      htmlToLexical(editor, initialHtml);
      hasInitialized.current = true;
    } else if (initialHtml === '' && !hasInitialized.current) {
      // Clear editor if initialHtml is empty on first mount
      editor.update(() => {
        const root = editor.getEditorState()._nodeMap.get('root');
        if (root && 'clear' in root && typeof root.clear === 'function') {
          root.clear();
        }
      });
      hasInitialized.current = true;
    }

    previousInitialHtml.current = initialHtml || '';
  }, [editor, initialHtml]);

  return null;
}
