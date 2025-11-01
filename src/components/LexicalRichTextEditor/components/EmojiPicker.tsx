/**
 * Emoji Picker Component
 *
 * Wrapper component for emoji-picker-react with Lexical integration
 */

import { Button } from '@/components/ui/button';
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from '@/components/ui/popover';
import EmojiPicker, {
  EmojiClickData,
  EmojiStyle,
  Theme,
} from 'emoji-picker-react';
import { Smile } from 'lucide-react';
import { useCallback, useState } from 'react';

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
          emojiStyle={EmojiStyle.NATIVE}
          previewConfig={{
            showPreview: false,
          }}
          width={320}
          height={320}
          emojiVersion='15.0'
          searchDisabled
        />
      </PopoverContent>
    </Popover>
  );
}
