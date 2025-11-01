/**
 * Code Language Plugin
 *
 * Adds language selection dropdown to code blocks in the toolbar
 */

import { useCallback, useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $isCodeNode, CodeNode } from '@lexical/code';
import {
  $getSelection,
  $isRangeSelection,
  COMMAND_PRIORITY_CRITICAL,
  SELECTION_CHANGE_COMMAND,
} from 'lexical';

const CODE_LANGUAGE_OPTIONS: [string, string][] = [
  ['plain', 'Plain Text'],
  ['js', 'JavaScript'],
  ['typescript', 'TypeScript'],
  ['jsx', 'JSX'],
  ['tsx', 'TSX'],
  ['html', 'HTML'],
  ['css', 'CSS'],
  ['xml', 'XML'],
  ['json', 'JSON'],
  ['markdown', 'Markdown'],
  ['python', 'Python'],
  ['c', 'C'],
  ['clike', 'C-like'],
  ['rust', 'Rust'],
  ['sql', 'SQL'],
  ['swift', 'Swift'],
];

function getSelectedCodeNode(): CodeNode | null {
  const selection = $getSelection();
  if (!$isRangeSelection(selection)) {
    return null;
  }

  const anchorNode = selection.anchor.getNode();
  const element =
    anchorNode.getKey() === 'root'
      ? anchorNode
      : anchorNode.getTopLevelElementOrThrow();

  if ($isCodeNode(element)) {
    return element;
  }

  const parent = anchorNode.getParent();
  if ($isCodeNode(parent)) {
    return parent;
  }

  return null;
}

/**
 * Code Language Plugin Component
 *
 * Monitors selection and provides language state for toolbar
 */
export function CodeLanguagePlugin(): null {
  const [editor] = useLexicalComposerContext();

  useEffect(
    () =>
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () =>
          // Selection state is managed by useCodeLanguage hook
          false,
        COMMAND_PRIORITY_CRITICAL
      ),
    [editor]
  );

  return null;
}

/**
 * Hook to get current code language and update function
 * Use this in Toolbar or other components
 */
export function useCodeLanguage(): {
  isCodeBlock: boolean;
  codeLanguage: string;
  onCodeLanguageSelect: (value: string) => void;
  languageOptions: [string, string][];
} {
  const [editor] = useLexicalComposerContext();
  const [isCodeBlock, setIsCodeBlock] = useState(false);
  const [codeLanguage, setCodeLanguage] = useState('plain');

  const updateCodeLanguageState = useCallback(() => {
    editor.getEditorState().read(() => {
      const codeNode = getSelectedCodeNode();
      if (codeNode) {
        setIsCodeBlock(true);
        setCodeLanguage(codeNode.getLanguage() || 'plain');
      } else {
        setIsCodeBlock(false);
      }
    });
  }, [editor]);

  useEffect(
    () =>
      editor.registerCommand(
        SELECTION_CHANGE_COMMAND,
        () => {
          updateCodeLanguageState();
          return false;
        },
        COMMAND_PRIORITY_CRITICAL
      ),
    [editor, updateCodeLanguageState]
  );

  const onCodeLanguageSelect = useCallback(
    (value: string) => {
      editor.update(() => {
        const codeNode = getSelectedCodeNode();
        if (codeNode) {
          codeNode.setLanguage(value);
        }
      });
    },
    [editor]
  );

  return {
    isCodeBlock,
    codeLanguage,
    onCodeLanguageSelect,
    languageOptions: CODE_LANGUAGE_OPTIONS,
  };
}
