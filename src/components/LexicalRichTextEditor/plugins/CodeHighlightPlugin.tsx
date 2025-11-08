/**
 * Code Highlight Plugin
 *
 * Plugin to enable syntax highlighting for code blocks using Prism.js
 * Prism.jsは動的にロードされ、初期バンドルサイズを削減
 */

import { useEffect, useState } from 'react';
import { useLexicalComposerContext } from '@lexical/react/LexicalComposerContext';
import { loadPrism, isPrismLoaded } from '@/utils/prismLoader';

/**
 * Code Highlight Plugin Component
 *
 * Registers syntax highlighting for code blocks
 * Uses Prism.js for language-specific highlighting (loaded dynamically)
 */
export function CodeHighlightPlugin(): null {
  const [editor] = useLexicalComposerContext();
  const [prismReady, setPrismReady] = useState(false);

  // Prismを動的にロード
  useEffect(() => {
    let mounted = true;
    let timeoutId: NodeJS.Timeout;

    const loadPrismWithRetry = async () => {
      try {
        await loadPrism();

        // Prismがグローバルに設定されるまで待機
        const checkPrismReady = () => {
          if (!mounted) return;

          if (window.Prism && isPrismLoaded()) {
            setPrismReady(true);
          } else {
            timeoutId = setTimeout(checkPrismReady, 50);
          }
        };

        checkPrismReady();
      } catch (error) {
        console.error('[CodeHighlightPlugin] Failed to load Prism:', error);
      }
    };

    loadPrismWithRetry();

    return () => {
      mounted = false;
      if (timeoutId) {
        clearTimeout(timeoutId);
      }
    };
  }, []);

  // Prismロード完了後にハイライト登録（@lexical/codeを動的インポート）
  useEffect(() => {
    if (!prismReady) {
      return undefined;
    }

    let mounted = true;

    // @lexical/codeを動的にインポートしてregisterCodeHighlightingを取得
    const registerHighlighting = async () => {
      try {
        const { registerCodeHighlighting } = await import('@lexical/code');

        if (!mounted) return;

        return registerCodeHighlighting(editor);
      } catch (error) {
        console.error('[CodeHighlightPlugin] Failed to register highlighting:', error);
        return undefined;
      }
    };

    let cleanup: (() => void) | undefined;
    registerHighlighting().then(unregister => {
      if (mounted && unregister) {
        cleanup = unregister;
      }
    });

    return () => {
      mounted = false;
      if (cleanup) {
        cleanup();
      }
    };
  }, [editor, prismReady]);

  return null;
}
