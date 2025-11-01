/**
 * HTML Synchronization Plugin
 *
 * Plugin to synchronize HTML content with Lexical editor state
 */

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { htmlToLexical } from '../utils/htmlConverter';

interface HtmlPluginProps {
  initialHtml?: string;
}

/**
 * Plugin to load initial HTML content into the editor
 */
export function HtmlPlugin({ initialHtml }: HtmlPluginProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (initialHtml && initialHtml.trim() !== '') {
      htmlToLexical(editor, initialHtml);
    }
    // Only run once on mount with initial HTML
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return null;
}
