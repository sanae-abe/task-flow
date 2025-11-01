/**
 * Lexical Editor Toolbar Component
 *
 * Toolbar with formatting buttons for the Lexical editor
 */

import { useCallback } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import {
  FORMAT_TEXT_COMMAND,
  UNDO_COMMAND,
  REDO_COMMAND,
  $getSelection,
  $isRangeSelection,
  $createTextNode,
} from 'lexical';
import {
  INSERT_UNORDERED_LIST_COMMAND,
  INSERT_ORDERED_LIST_COMMAND,
} from '@lexical/list';
import { $createCodeNode } from '@lexical/code';
import { $createQuoteNode } from '@lexical/rich-text';
import {
  Bold,
  Italic,
  Underline,
  Strikethrough,
  Code,
  FileCode,
  List,
  ListOrdered,
  Quote,
  Undo,
  Redo,
} from 'lucide-react';
import { EmojiPickerPlugin } from '../plugins/EmojiPickerPlugin';
import { useCodeLanguage } from '../plugins/CodeLanguagePlugin';

interface ToolbarProps {
  disabled?: boolean;
}

export function Toolbar({
  disabled = false,
}: ToolbarProps): React.ReactElement {
  const [editor] = useLexicalComposerContext();
  const { isCodeBlock, codeLanguage, onCodeLanguageSelect, languageOptions } =
    useCodeLanguage();

  const formatBold = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'bold');
  }, [editor]);

  const formatItalic = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'italic');
  }, [editor]);

  const formatUnderline = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'underline');
  }, [editor]);

  const formatStrikethrough = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'strikethrough');
  }, [editor]);

  const formatCode = useCallback(() => {
    editor.dispatchCommand(FORMAT_TEXT_COMMAND, 'code');
  }, [editor]);

  const insertCodeBlock = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const selectedText = selection.getTextContent();
        const codeNode = $createCodeNode();

        // If there's selected text, set it as the code block content
        if (selectedText) {
          const textNode = $createTextNode(selectedText);
          codeNode.append(textNode);
        }

        selection.insertNodes([codeNode]);
      }
    });
  }, [editor]);

  const insertQuote = useCallback(() => {
    editor.update(() => {
      const selection = $getSelection();
      if ($isRangeSelection(selection)) {
        const selectedText = selection.getTextContent();
        const quoteNode = $createQuoteNode();

        // If there's selected text, set it as the quote content
        if (selectedText) {
          const textNode = $createTextNode(selectedText);
          quoteNode.append(textNode);
        }

        selection.insertNodes([quoteNode]);
      }
    });
  }, [editor]);

  const insertUnorderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_UNORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const insertOrderedList = useCallback(() => {
    editor.dispatchCommand(INSERT_ORDERED_LIST_COMMAND, undefined);
  }, [editor]);

  const undo = useCallback(() => {
    editor.dispatchCommand(UNDO_COMMAND, undefined);
  }, [editor]);

  const redo = useCallback(() => {
    editor.dispatchCommand(REDO_COMMAND, undefined);
  }, [editor]);

  const buttonClass =
    'p-1.5 hover:bg-muted rounded transition-colors disabled:opacity-50 disabled:cursor-not-allowed';

  return (
    <div className='flex items-center gap-1 p-2 border-b border-border bg-background'>
      {/* Text formatting */}
      <button
        type='button'
        onClick={formatBold}
        disabled={disabled}
        className={buttonClass}
        title='太字 (Ctrl+B)'
        aria-label='太字'
      >
        <Bold size={18} />
      </button>

      <button
        type='button'
        onClick={formatItalic}
        disabled={disabled}
        className={buttonClass}
        title='斜体 (Ctrl+I)'
        aria-label='斜体'
      >
        <Italic size={18} />
      </button>

      <button
        type='button'
        onClick={formatUnderline}
        disabled={disabled}
        className={buttonClass}
        title='下線 (Ctrl+U)'
        aria-label='下線'
      >
        <Underline size={18} />
      </button>

      <button
        type='button'
        onClick={formatStrikethrough}
        disabled={disabled}
        className={buttonClass}
        title='取り消し線'
        aria-label='取り消し線'
      >
        <Strikethrough size={18} />
      </button>

      <div className='w-px h-6 bg-border mx-1' />

      {/* Code */}
      <button
        type='button'
        onClick={formatCode}
        disabled={disabled}
        className={buttonClass}
        title='インラインコード'
        aria-label='インラインコード'
      >
        <Code size={18} />
      </button>

      <button
        type='button'
        onClick={insertCodeBlock}
        disabled={disabled}
        className={buttonClass}
        title='コードブロック'
        aria-label='コードブロック'
      >
        <FileCode size={18} />
      </button>

      {/* Code Language Selector - only show when cursor is in code block */}
      {isCodeBlock && (
        <select
          value={codeLanguage}
          onChange={e => onCodeLanguageSelect(e.target.value)}
          disabled={disabled}
          className='ml-2 text-xs bg-background border border-border rounded px-2 py-1 cursor-pointer hover:bg-accent hover:text-accent-foreground focus:outline-none focus:ring-2 focus:ring-ring disabled:opacity-50 disabled:cursor-not-allowed'
          title='コードブロック言語'
          aria-label='コードブロック言語選択'
        >
          {languageOptions.map(([value, label]) => (
            <option key={value} value={value}>
              {label}
            </option>
          ))}
        </select>
      )}

      {/* Emoji Picker */}
      <EmojiPickerPlugin disabled={disabled} />

      <div className='w-px h-6 bg-border mx-1' />

      {/* Block Quote */}
      <button
        type='button'
        onClick={insertQuote}
        disabled={disabled}
        className={buttonClass}
        title='引用ブロック'
        aria-label='引用ブロック'
      >
        <Quote size={18} />
      </button>

      <div className='w-px h-6 bg-border mx-1' />

      {/* Lists */}
      <button
        type='button'
        onClick={insertUnorderedList}
        disabled={disabled}
        className={buttonClass}
        title='箇条書きリスト'
        aria-label='箇条書きリスト'
      >
        <List size={18} />
      </button>

      <button
        type='button'
        onClick={insertOrderedList}
        disabled={disabled}
        className={buttonClass}
        title='番号付きリスト'
        aria-label='番号付きリスト'
      >
        <ListOrdered size={18} />
      </button>

      <div className='w-px h-6 bg-border mx-1' />

      {/* History */}
      <button
        type='button'
        onClick={undo}
        disabled={disabled}
        className={buttonClass}
        title='元に戻す (Ctrl+Z)'
        aria-label='元に戻す'
      >
        <Undo size={18} />
      </button>

      <button
        type='button'
        onClick={redo}
        disabled={disabled}
        className={buttonClass}
        title='やり直す (Ctrl+Y)'
        aria-label='やり直す'
      >
        <Redo size={18} />
      </button>
    </div>
  );
}
