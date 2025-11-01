/**
 * Rich Text Editor Wrapper with Feature Flag
 *
 * This component provides a feature flag to switch between
 * the original ContentEditable-based editor and the new Lexical editor.
 *
 * Usage:
 * - Set environment variable VITE_USE_LEXICAL_EDITOR=true to use Lexical
 * - Default: ContentEditable-based editor
 */

import { lazy, Suspense } from 'react';
import type { RichTextEditorProps } from './RichTextEditor/types';

// Lazy load editors for optimal bundle size
const ContentEditableEditor = lazy(() => import('./RichTextEditor'));
const LexicalEditor = lazy(() => import('./LexicalRichTextEditor'));

/**
 * Feature flag: Use Lexical editor if environment variable is set
 */
const USE_LEXICAL_EDITOR =
  import.meta.env['VITE_USE_LEXICAL_EDITOR'] === 'true';

/**
 * Loading fallback component
 */
function EditorLoadingFallback({
  minHeight = '120px',
}: {
  minHeight?: string;
}) {
  return (
    <div
      className='w-full border border-border rounded-md bg-muted animate-pulse'
      style={{ minHeight }}
      aria-label='エディタを読み込み中...'
    />
  );
}

/**
 * Rich Text Editor Wrapper with Feature Flag
 *
 * Automatically switches between ContentEditable and Lexical editors
 * based on the VITE_USE_LEXICAL_EDITOR environment variable.
 */
export default function RichTextEditorWrapper(
  props: RichTextEditorProps
): React.ReactElement {
  const Editor = USE_LEXICAL_EDITOR ? LexicalEditor : ContentEditableEditor;

  return (
    <Suspense fallback={<EditorLoadingFallback minHeight={props.minHeight} />}>
      <Editor {...props} />
    </Suspense>
  );
}

// Re-export types
export type { RichTextEditorProps };

// Export flag for debugging/testing
export { USE_LEXICAL_EDITOR };
