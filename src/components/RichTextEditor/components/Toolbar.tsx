/**
 * RichTextEditor Toolbar Component
 *
 * This component renders the formatting toolbar for the RichTextEditor.
 */

import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Link,
  Code,
  FileCode,
  Smile,
} from 'lucide-react';

import { UnderlineIcon, StrikethroughIcon } from './icons';
import { getCurrentFormatState } from '../utils/formatting';
import type { ToolbarButton } from '../types';

interface ToolbarProps {
  onButtonClick: (command: string) => void;
  disabled?: boolean;
  className?: string;
  emojiButtonRef?: React.RefObject<HTMLButtonElement | null>;
}

const Toolbar: React.FC<ToolbarProps> = ({
  onButtonClick,
  disabled = false,
  className = "",
  emojiButtonRef,
}) => {
  const formatState = getCurrentFormatState();

  const toolbarButtons: ToolbarButton[] = [
    {
      id: 'bold',
      icon: Bold,
      title: '太字 (Ctrl+B)',
      action: () => onButtonClick('bold'),
      isActive: formatState.bold,
    },
    {
      id: 'italic',
      icon: Italic,
      title: '斜体 (Ctrl+I)',
      action: () => onButtonClick('italic'),
      isActive: formatState.italic,
    },
    {
      id: 'underline',
      icon: UnderlineIcon,
      title: '下線 (Ctrl+U)',
      action: () => onButtonClick('underline'),
      isActive: formatState.underline,
    },
    {
      id: 'strikethrough',
      icon: StrikethroughIcon,
      title: '取り消し線',
      action: () => onButtonClick('strikethrough'),
      isActive: formatState.strikethrough,
    },
    {
      id: 'code',
      icon: Code,
      title: 'インラインコード (Ctrl+`)',
      action: () => onButtonClick('code'),
    },
    {
      id: 'codeBlock',
      icon: FileCode,
      title: 'コードブロック',
      action: () => onButtonClick('codeBlock'),
    },
    {
      id: 'unorderedList',
      icon: List,
      title: '箇条書きリスト',
      action: () => onButtonClick('unorderedList'),
    },
    {
      id: 'orderedList',
      icon: ListOrdered,
      title: '番号付きリスト',
      action: () => onButtonClick('orderedList'),
    },
    {
      id: 'link',
      icon: Link,
      title: 'リンク (Ctrl+K)',
      action: () => onButtonClick('link'),
    },
    {
      id: 'emoji',
      icon: Smile,
      title: '絵文字',
      action: () => onButtonClick('emoji'),
    },
  ];

  return (
    <div className={`flex gap-1 p-1 border-b border-border bg-muted/50 rounded-t-md ${className}`}>
      {toolbarButtons.map((button) => {
        const IconComponent = button.icon;
        const isEmojiButton = button.id === 'emoji';

        return (
          <Button
            key={button.id}
            ref={isEmojiButton ? emojiButtonRef : undefined}
            variant={button.isActive ? "default" : "ghost"}
            size="icon"
            onClick={button.action}
            disabled={disabled}
            title={button.title}
            className="h-8 w-8 p-0"
          >
            <IconComponent size={14} />
          </Button>
        );
      })}
    </div>
  );
};

export default Toolbar;