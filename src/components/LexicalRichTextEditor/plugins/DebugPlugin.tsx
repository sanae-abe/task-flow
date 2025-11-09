/**
 * Debug Plugin
 *
 * Plugin to debug Enter key behavior in CodeNode
 */

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_LOW,
  KEY_ENTER_COMMAND,
  INSERT_LINE_BREAK_COMMAND,
  INSERT_PARAGRAPH_COMMAND,
} from 'lexical';
import { $isCodeNode } from '@lexical/code';
import { logger } from '@/utils/logger';

/**
 * Debug Plugin Component
 *
 * Logs all Enter-related commands for debugging
 */
export function DebugPlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    logger.debug('[DebugPlugin] Plugin mounted');

    const unregister1 = editor.registerCommand(
      KEY_ENTER_COMMAND,
      (event: KeyboardEvent | null) => {
        logger.debug('[DebugPlugin] KEY_ENTER_COMMAND triggered', {
          shift: event?.shiftKey,
          ctrl: event?.ctrlKey,
          alt: event?.altKey,
        });

        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            logger.debug('[DebugPlugin] Not a range selection');
            return;
          }

          const anchorNode = selection.anchor.getNode();
          const parent = anchorNode.getParent();

          logger.debug('[DebugPlugin] Selection info:', {
            anchorNodeType: anchorNode.getType(),
            parentType: parent?.getType(),
            isInCodeBlock: $isCodeNode(parent),
            anchorOffset: selection.anchor.offset,
            isCollapsed: selection.isCollapsed(),
          });
        });

        // Don't handle - let other plugins handle it
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    const unregister2 = editor.registerCommand(
      INSERT_LINE_BREAK_COMMAND,
      selectStart => {
        logger.debug('[DebugPlugin] INSERT_LINE_BREAK_COMMAND triggered', {
          selectStart,
        });

        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            logger.debug('[DebugPlugin] Not a range selection');
            return;
          }

          const anchorNode = selection.anchor.getNode();
          const parent = anchorNode.getParent();

          logger.debug('[DebugPlugin] Before insertLineBreak:', {
            anchorNodeType: anchorNode.getType(),
            parentType: parent?.getType(),
            isInCodeBlock: $isCodeNode(parent),
          });

          if ($isCodeNode(parent)) {
            const children = parent.getChildren();
            logger.debug('[DebugPlugin] CodeNode children before:', {
              count: children.length,
              types: children.map(c => c.getType()),
              keys: children.map(c => c.getKey()),
            });
          }
        });

        // Check state after command execution
        setTimeout(() => {
          editor.getEditorState().read(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            const anchorNode = selection.anchor.getNode();
            const parent = anchorNode.getParent();

            if ($isCodeNode(parent)) {
              const children = parent.getChildren();
              logger.debug(
                '[DebugPlugin] CodeNode children after insertLineBreak:',
                {
                  count: children.length,
                  types: children.map(c => c.getType()),
                  keys: children.map(c => c.getKey()),
                }
              );
            }
          });
        }, 10);

        // Don't handle - let other plugins handle it
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    const unregister3 = editor.registerCommand(
      INSERT_PARAGRAPH_COMMAND,
      () => {
        logger.debug('[DebugPlugin] INSERT_PARAGRAPH_COMMAND triggered');

        editor.getEditorState().read(() => {
          const selection = $getSelection();
          if (!$isRangeSelection(selection)) {
            logger.debug('[DebugPlugin] Not a range selection');
            return;
          }

          const anchorNode = selection.anchor.getNode();
          const parent = anchorNode.getParent();

          logger.debug('[DebugPlugin] Before insertParagraph:', {
            anchorNodeType: anchorNode.getType(),
            parentType: parent?.getType(),
            isInCodeBlock: $isCodeNode(parent),
          });

          if ($isCodeNode(parent)) {
            const children = parent.getChildren();
            logger.debug('[DebugPlugin] CodeNode children before:', {
              count: children.length,
              types: children.map(c => c.getType()),
              keys: children.map(c => c.getKey()),
            });
          }
        });

        // Check state after command execution
        setTimeout(() => {
          editor.getEditorState().read(() => {
            const selection = $getSelection();
            if (!$isRangeSelection(selection)) return;

            const anchorNode = selection.anchor.getNode();
            const parent = anchorNode.getParent();

            if ($isCodeNode(parent)) {
              const children = parent.getChildren();
              logger.debug(
                '[DebugPlugin] CodeNode children after insertParagraph:',
                {
                  count: children.length,
                  types: children.map(c => c.getType()),
                  keys: children.map(c => c.getKey()),
                }
              );
            } else {
              logger.debug(
                '[DebugPlugin] After insertParagraph - not in CodeNode anymore:',
                {
                  anchorNodeType: anchorNode.getType(),
                  parentType: parent?.getType(),
                }
              );
            }
          });
        }, 10);

        // Don't handle - let other plugins handle it
        return false;
      },
      COMMAND_PRIORITY_LOW
    );

    logger.debug('[DebugPlugin] All commands registered');

    return () => {
      logger.debug('[DebugPlugin] Plugin unmounting');
      unregister1();
      unregister2();
      unregister3();
    };
  }, [editor]);

  return null;
}
