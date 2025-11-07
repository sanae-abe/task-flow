/**
 * Code Highlight Plugin
 *
 * Plugin to enable syntax highlighting for code blocks using Prism.js
 * Prism.jsは動的にロードされ、初期バンドルサイズを削減
 */

import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { registerCodeHighlighting } from '@lexical/code';
import { loadPrism, isPrismLoaded } from '@/utils/prismLoader';

/**
 * Code Highlight Plugin Component
 *
 * Registers syntax highlighting for code blocks
 * Uses Prism.js for language-specific highlighting (loaded dynamically)
 */
export function CodeHighlightPlugin(): null {
  const [editor] = useLexicalComposerContext();
  const [prismReady, setPrismReady] = useState(isPrismLoaded());

  useEffect(() => {
    // Prismが既にロード済みの場合は即座に登録
    if (prismReady) {
      return registerCodeHighlighting(editor);
    }

    // Prismを動的にロード
    let mounted = true;
    loadPrism()
      .then(() => {
        if (mounted) {
          setPrismReady(true);
        }
      })
      .catch(error => {
        console.error('[CodeHighlightPlugin] Failed to load Prism:', error);
      });

    return () => {
      mounted = false;
    };
  }, [editor, prismReady]);

  // Prismロード後にハイライト登録
  useEffect(() => {
    if (prismReady) {
      return registerCodeHighlighting(editor);
    }
    return undefined;
  }, [editor, prismReady]);

  return null;
}
