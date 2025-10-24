import React from 'react';
import { Button } from '@/components/ui/button';
import {
  Bold,
  Italic,
  Strikethrough,
  Underline,
  List,
  ListOrdered,
  Link,
  Code,
  FileCode,
  Smile
} from 'lucide-react';

interface ToolbarProps {
  onBold: () => void;
  onItalic: () => void;
  onUnderline: () => void;
  onStrikethrough: () => void;
  onLink: () => void;
  onCode: () => void;
  onCodeBlock: () => void;
  onUnorderedList: () => void;
  onOrderedList: () => void;
  onEmoji: () => void;
  emojiButtonRef?: React.RefObject<HTMLButtonElement>;
}

/**
 * リッチテキストエディタのツールバーコンポーネント
 */
export const Toolbar: React.FC<ToolbarProps> = ({
  onBold,
  onItalic,
  onUnderline,
  onStrikethrough,
  onLink,
  onCode,
  onCodeBlock,
  onUnorderedList,
  onOrderedList,
  onEmoji,
  emojiButtonRef,
}) => (
    <div className="p-2 border-b border-border bg-neutral-100">
      <div className="flex gap-1">
        <Button
          variant="ghost"
          size="sm"
          onClick={onBold}
          aria-label="太字 (Ctrl+B)"
          className="p-1 h-auto min-w-0"
        >
          <Bold size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onItalic}
          aria-label="斜体 (Ctrl+I)"
          className="p-1 h-auto min-w-0"
        >
          <Italic size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onUnderline}
          aria-label="下線 (Ctrl+U)"
          className="p-1 h-auto min-w-0"
        >
          <Underline />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onStrikethrough}
          aria-label="取り消し線 (Ctrl+Shift+X)"
          className="p-1 h-auto min-w-0"
        >
          <Strikethrough />
        </Button>
        <div className="w-px bg-neutral-100 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onLink}
          aria-label="リンク (Ctrl+K)"
          className="p-1 h-auto min-w-0"
        >
          <Link size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCode}
          aria-label="インラインコード (Ctrl+`)"
          className="p-1 h-auto min-w-0"
        >
          <Code size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onCodeBlock}
          aria-label="コードブロック (Ctrl+Shift+`)"
          className="p-1 h-auto min-w-0"
        >
          <FileCode size={16} />
        </Button>
        <div className="w-px bg-neutral-100 mx-1" />
        <Button
          variant="ghost"
          size="sm"
          onClick={onUnorderedList}
          aria-label="箇条書きリスト"
          className="p-1 h-auto min-w-0"
        >
          <List size={16} />
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={onOrderedList}
          aria-label="番号付きリスト"
          className="p-1 h-auto min-w-0"
        >
          <ListOrdered size={16} />
        </Button>
        <div className="w-px bg-neutral-100 mx-1" />
        <Button
          ref={emojiButtonRef}
          variant="ghost"
          size="sm"
          onClick={onEmoji}
          aria-label="絵文字を挿入"
          className="p-1 h-auto min-w-0"
        >
          <Smile size={16} />
        </Button>
      </div>
    </div>
  );