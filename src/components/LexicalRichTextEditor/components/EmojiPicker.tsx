/**
 * Emoji Picker Component
 *
 * Wrapper component for emoji-picker-react with Lexical integration
 */

import { useState, useCallback } from 'react';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import { Button } from '@/components/ui/button';
import { Smile } from 'lucide-react';
import EmojiPicker, { EmojiClickData, Theme } from 'emoji-picker-react';

interface EmojiPickerComponentProps {
  onEmojiSelect: (emoji: string) => void;
  disabled?: boolean;
}

/**
 * Emoji Picker Component with Popover
 *
 * Features:
 * - Popover-based emoji picker
 * - Keyboard navigation support
 * - Click outside to close
 * - Accessibility features
 */
export function EmojiPickerComponent({
  onEmojiSelect,
  disabled = false,
}: EmojiPickerComponentProps): React.ReactElement {
  const [isOpen, setIsOpen] = useState(false);

  const handleEmojiClick = useCallback(
    (emojiData: EmojiClickData) => {
      onEmojiSelect(emojiData.emoji);
      setIsOpen(false); // Close picker after selection
    },
    [onEmojiSelect]
  );

  const handleOpenChange = useCallback((open: boolean) => {
    setIsOpen(open);
  }, []);

  return (
    <Popover open={isOpen} onOpenChange={handleOpenChange}>
      <PopoverTrigger asChild>
        <Button
          type='button'
          variant='ghost'
          size='sm'
          disabled={disabled}
          className='p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed'
          title='絵文字を挿入'
          aria-label='絵文字を挿入'
        >
          <Smile size={18} />
        </Button>
      </PopoverTrigger>
      <PopoverContent
        className='w-auto p-0 border shadow-md'
        align='start'
        side='bottom'
        sideOffset={5}
      >
        <EmojiPicker
          onEmojiClick={handleEmojiClick}
          autoFocusSearch={false}
          theme={Theme.LIGHT}
          lazyLoadEmojis
          previewConfig={{
            showPreview: false,
          }}
          width={350}
          height={400}
          searchPlaceholder='絵文字を検索...'
        />
      </PopoverContent>
    </Popover>
  );
}
