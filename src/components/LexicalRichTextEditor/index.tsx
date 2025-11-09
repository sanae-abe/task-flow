/**
 * Lexical Rich Text Editor Component (PoC)
 *
 * This is a Proof of Concept implementation of Lexical editor
 * with the same interface as the existing ContentEditable-based RichTextEditor.
 */

import { useEffect, useState } from 'react';
import { LexicalComposer } from '@lexical/react/LexicalComposer';
import { RichTextPlugin } from '@lexical/react/LexicalRichTextPlugin';
import { ContentEditable } from '@lexical/react/LexicalContentEditable';
import { HistoryPlugin } from '@lexical/react/LexicalHistoryPlugin';
import { ListPlugin } from '@lexical/react/LexicalListPlugin';
import { LinkPlugin } from '@lexical/react/LexicalLinkPlugin';
import { TabIndentationPlugin } from '@lexical/react/LexicalTabIndentationPlugin';
import { getEditorConfig } from './config';
import { Toolbar } from './components/Toolbar';
import { HtmlPlugin } from './plugins/HtmlPlugin';
import { OnChangePlugin } from './plugins/OnChangePlugin';
import { CodeHighlightPlugin } from './plugins/CodeHighlightPlugin';
import { CodeBlockLineBreakPlugin } from './plugins/CodeBlockLineBreakPlugin';
import { CodeLanguagePlugin } from './plugins/CodeLanguagePlugin';
import { loadPrism, isPrismLoaded } from '@/utils/prismLoader';
import { logger } from '@/utils/logger';

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
  const [prismReady, setPrismReady] = useState(isPrismLoaded());

  // Prismを事前にロード
  useEffect(() => {
    if (prismReady) return;

    let mounted = true;
    loadPrism()
      .then(() => {
        if (mounted) {
          // 追加の確認: window.Prismが確実に設定されるまで待機
          const checkInterval = setInterval(() => {
            if (window.Prism && isPrismLoaded()) {
              clearInterval(checkInterval);
              if (mounted) {
                setPrismReady(true);
              }
            }
          }, 50);

          // タイムアウト: 5秒経っても読み込めない場合は諦める
          setTimeout(() => {
            clearInterval(checkInterval);
            if (mounted && !prismReady) {
              logger.warn('[LexicalRichTextEditor] Prism load timeout');
              setPrismReady(true); // エディタは表示（ハイライトなし）
            }
          }, 5000);
        }
      })
      .catch(error => {
        logger._error('[LexicalRichTextEditor] Failed to load Prism:', error);
        if (mounted) {
          setPrismReady(true); // エディタは表示（ハイライトなし）
        }
      });

    return () => {
      mounted = false;
    };
  }, [prismReady]);

  const initialConfig = {
    ...getEditorConfig(),
    editable: !disabled,
  };

  // Prismロード中はローディング表示
  if (!prismReady) {
    return (
      <div
        className='w-full border border-border rounded-md p-3 flex items-center justify-center bg-muted'
        style={{ minHeight }}
      >
        <span className='text-muted-foreground text-sm'>
          エディタを読み込んでいます...
        </span>
      </div>
    );
  }

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
        <CodeBlockLineBreakPlugin />
        {/* CodeHighlightPluginはPrismロード完了後のみ有効化 */}
        {prismReady && <CodeHighlightPlugin />}
        <CodeLanguagePlugin />
        <TabIndentationPlugin maxIndent={4} />
        <HtmlPlugin initialHtml={value} />
        <OnChangePlugin onChange={onChange} />
      </div>
    </LexicalComposer>
  );
}

// Re-export props type for convenience
export type { LexicalRichTextEditorProps as RichTextEditorProps };
