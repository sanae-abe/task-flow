/**
 * Code Block Line Break Plugin
 *
 * Plugin to fix line break insertion in code blocks
 */

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_HIGH,
  INSERT_LINE_BREAK_COMMAND,
  $createLineBreakNode,
  $createTextNode,
} from 'lexical';
import { $isCodeNode } from '@lexical/code';

/**
 * Code Block Line Break Plugin Component
 *
 * Handles line break insertion in code blocks by intercepting
 * INSERT_LINE_BREAK_COMMAND and manually inserting LineBreakNode
 */
export function CodeBlockLineBreakPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    // Handle INSERT_LINE_BREAK_COMMAND (Shift+Enter)
    const unregister = editor.registerCommand(
      INSERT_LINE_BREAK_COMMAND,
      () => {
        // Check if we're in a CodeNode
        let shouldHandle = false;

        editor.getEditorState().read(() => {
          const selection = $getSelection();

          if (!$isRangeSelection(selection) || !selection.isCollapsed()) {
            return;
          }

          const anchorNode = selection.anchor.getNode();
          const parent = anchorNode.getParent();

          // Only handle if we're in a CodeNode
          if ($isCodeNode(parent)) {
            shouldHandle = true;
          }
        });

        if (!shouldHandle) {
          return false;
        }

        // Manually insert LineBreak node
        editor.update(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            return;
          }

          // Insert LineBreak and TextNode
          const lineBreak = $createLineBreakNode();
          const textNode = $createTextNode('');

          selection.insertNodes([lineBreak, textNode]);

          // Move cursor to the new text node
          textNode.select(0, 0);
        });

        return true; // Prevent default behavior
      },
      COMMAND_PRIORITY_HIGH
    );

    return () => {
      unregister();
    };
  }, [editor]);

  return null;
}
