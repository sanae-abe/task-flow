/**
 * Lexical Rich Text Editor Component (PoC)
 *
 * This is a Proof of Concept implementation of Lexical editor
 * with the same interface as the existing ContentEditable-based RichTextEditor.
 */

import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { getEditorConfig } from './config';
import { Toolbar } from './components/Toolbar';
import { HtmlPlugin } from './plugins/HtmlPlugin';
import { OnChangePlugin } from './plugins/OnChangePlugin';
import { CodeHighlightPlugin } from './plugins/CodeHighlightPlugin';

/**
 * Props interface matching the existing RichTextEditor
 */
export interface LexicalRichTextEditorProps {
  value?: string;
  onChange?: (value: string) => void;
  placeholder?: string;
  disabled?: boolean;
  minHeight?: string;
}

/**
 * Lexical Rich Text Editor Component
 *
 * Features:
 * - HTML ↔ Lexical conversion with DOMPurify integration
 * - Same interface as existing RichTextEditor
 * - Toolbar with formatting buttons
 * - Keyboard shortcuts
 * - Undo/Redo support
 */
export default function LexicalRichTextEditor({
  value = '',
  onChange,
  placeholder = '説明を入力してください...',
  disabled = false,
  minHeight = '120px',
}: LexicalRichTextEditorProps): React.ReactElement {
  const initialConfig = {
    ...getEditorConfig(),
    editable: !disabled,
  };

  return (
    <LexicalComposer initialConfig={initialConfig}>
      <div className='w-full border border-border rounded-md'>
        {/* Toolbar */}
        <Toolbar disabled={disabled} />

        {/* Editor Content */}
        <div className='relative'>
          <RichTextPlugin
            contentEditable={
              <ContentEditable
                className={`
                  outline-none p-3 rounded-b-md
                  ${disabled ? 'bg-muted cursor-not-allowed' : 'bg-background'}
                  prose prose-sm max-w-none
                `}
                style={{
                  minHeight,
                  fontSize: '14px',
                  lineHeight: '1.5',
                  fontFamily:
                    '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
                }}
                aria-label='リッチテキストエディタ'
              />
            }
            placeholder={
              <div className='absolute top-3 left-3 pointer-events-none text-muted-foreground text-sm'>
                {placeholder}
              </div>
            }
            ErrorBoundary={() => (
              <div className='p-3 text-destructive text-sm'>
                エディタの読み込みに失敗しました
              </div>
            )}
          />
        </div>

        {/* Plugins */}
        <HistoryPlugin />
        <ListPlugin />
        <LinkPlugin />
        <CodeHighlightPlugin />
        <HtmlPlugin initialHtml={value} />
        <OnChangePlugin onChange={onChange} />
      </div>
    </LexicalComposer>
  );
}

// Re-export props type for convenience
export type { LexicalRichTextEditorProps as RichTextEditorProps };
