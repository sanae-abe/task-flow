import React from 'react';
import { IconButton } from '@primer/react';
import {
  BoldIcon,
  ItalicIcon,
  ListUnorderedIcon,
  ListOrderedIcon,
  LinkIcon,
  CodeIcon,
  FileCodeIcon,
  SmileyIcon
} from '@primer/octicons-react';
import { UnderlineIcon, StrikethroughIcon } from './icons/CustomIcons';

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
    <div
      style={{
        padding: "8px",
        borderBottom: '1px solid',
        borderColor: 'border.default',
        background: 'var(--bgColor-muted)',
      }}
    >
      <div style={{ display: 'flex', gap: "4px" }}>
        <IconButton
          size="small"
          variant="invisible"
          icon={BoldIcon}
          onClick={onBold}
          aria-label="太字 (Ctrl+B)"
        />
        <IconButton
          size="small"
          variant="invisible"
          icon={ItalicIcon}
          onClick={onItalic}
          aria-label="斜体 (Ctrl+I)"
        />
        <IconButton
          size="small"
          variant="invisible"
          icon={UnderlineIcon}
          onClick={onUnderline}
          aria-label="下線 (Ctrl+U)"
        />
        <IconButton
          size="small"
          variant="invisible"
          icon={StrikethroughIcon}
          onClick={onStrikethrough}
          aria-label="取り消し線 (Ctrl+Shift+X)"
        />
        <div style={{ width: '1px', background: 'var(--bgColor-muted)', marginInline: "4px" }} />
        <IconButton
          size="small"
          variant="invisible"
          icon={LinkIcon}
          onClick={onLink}
          aria-label="リンク (Ctrl+K)"
        />
        <IconButton
          size="small"
          variant="invisible"
          icon={CodeIcon}
          onClick={onCode}
          aria-label="インラインコード (Ctrl+`)"
        />
        <IconButton
          size="small"
          variant="invisible"
          icon={FileCodeIcon}
          onClick={onCodeBlock}
          aria-label="コードブロック (Ctrl+Shift+`)"
        />
        <div style={{ width: '1px', background: 'var(--bgColor-muted)', marginInline: "4px" }} />
        <IconButton
          size="small"
          variant="invisible"
          icon={ListUnorderedIcon}
          onClick={onUnorderedList}
          aria-label="箇条書きリスト"
        />
        <IconButton
          size="small"
          variant="invisible"
          icon={ListOrderedIcon}
          onClick={onOrderedList}
          aria-label="番号付きリスト"
        />
        <div style={{ width: '1px', background: 'var(--bgColor-muted)', marginInline: "4px" }} />
        <IconButton
          ref={emojiButtonRef}
          size="small"
          variant="invisible"
          icon={SmileyIcon}
          onClick={onEmoji}
          aria-label="絵文字を挿入"
        />
      </div>
    </div>
  );