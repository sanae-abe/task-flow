/**
 * Lexical Editor Configuration
 *
 * Initial configuration for Lexical editor instance
 */

import { HeadingNode, QuoteNode } from '@lexical/rich-text';
import { ListNode, ListItemNode } from '@lexical/list';
import { LinkNode, AutoLinkNode } from '@lexical/link';
import { CodeNode, CodeHighlightNode } from '@lexical/code';
import type { InitialConfigType } from '@lexical/react/LexicalComposer';
import { lexicalTheme } from './theme';

/**
 * Error handler for Lexical editor
 */
function onError(error: Error): void {
  // eslint-disable-next-line no-console
  console.error('[Lexical Error]:', error);
}

/**
 * Get initial Lexical configuration
 */
export function getEditorConfig(
  namespace: string = 'TaskFlowLexicalEditor'
): InitialConfigType {
  return {
    namespace,
    theme: lexicalTheme,
    onError,
    nodes: [
      HeadingNode,
      QuoteNode,
      ListNode,
      ListItemNode,
      LinkNode,
      AutoLinkNode,
      CodeNode,
      CodeHighlightNode,
    ],
  };
}
