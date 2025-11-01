/**
 * Emoji Picker Plugin
 *
 * Plugin to integrate emoji picker functionality with Lexical editor
 */

import { useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { $getSelection, $isRangeSelection, $createTextNode } from 'lexical';
import { EmojiPickerComponent } from '../components/EmojiPicker';

interface EmojiPickerPluginProps {
  disabled?: boolean;
}

/**
 * Emoji Picker Plugin Component
 *
 * Provides emoji insertion functionality to the Lexical editor
 * Integrates with emoji-picker-react for emoji selection
 */
export function EmojiPickerPlugin({
  disabled = false,
}: EmojiPickerPluginProps): React.ReactElement {
  const [editor] = useLexicalComposerContext();

  const handleEmojiSelect = useCallback(
    (emoji: string) => {
      editor.update(() => {
        const selection = $getSelection();
        if ($isRangeSelection(selection)) {
          // Create a text node with the selected emoji
          const emojiNode = $createTextNode(emoji);
          selection.insertNodes([emojiNode]);
        }
      });
    },
    [editor]
  );

  return (
    <EmojiPickerComponent
      onEmojiSelect={handleEmojiSelect}
      disabled={disabled}
    />
  );
}