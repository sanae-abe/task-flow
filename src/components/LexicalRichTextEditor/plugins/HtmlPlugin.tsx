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
  const prevHtmlRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    // Skip if initialHtml hasn't changed
    if (prevHtmlRef.current === initialHtml) {
      return;
    }

    // Update the editor content when initialHtml changes
    if (initialHtml && initialHtml.trim() !== '') {
      htmlToLexical(editor, initialHtml);
    } else if (initialHtml === '') {
      // Clear editor if initialHtml is empty
      editor.update(() => {
        const root = editor.getEditorState()._nodeMap.get('root');
        if (root && 'clear' in root && typeof root.clear === 'function') {
          root.clear();
        }
      });
    }

    // Update the ref to track the current value
    prevHtmlRef.current = initialHtml;
  }, [editor, initialHtml]);

  return null;
}
