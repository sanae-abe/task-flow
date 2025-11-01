/**
 * OnChange Plugin
 *
 * Plugin to handle editor content changes and notify parent component
 */

import { useEffect } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { lexicalToHtml } from '../utils/htmlConverter';

interface OnChangePluginProps {
  onChange?: (html: string) => void;
}

/**
 * Plugin to emit onChange events when editor content changes
 */
export function OnChangePlugin({ onChange }: OnChangePluginProps): null {
  const [editor] = useLexicalComposerContext();

  useEffect(() => {
    if (!onChange) {
      return;
    }

    return editor.registerUpdateListener(
      ({ editorState, dirtyElements, dirtyLeaves }) => {
        // Only trigger onChange if there are actual content changes
        if (dirtyElements.size === 0 && dirtyLeaves.size === 0) {
          return;
        }

        editorState.read(() => {
          const html = lexicalToHtml(editor);
          onChange(html);
        });
      }
    );
  }, [editor, onChange]);

  return null;
}
