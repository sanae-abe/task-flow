/**
 * Prism.js Dynamic Loader
 * Lexical CodeHighlightPluginが必要とするPrismを動的にロード
 * 初期バンドルサイズを削減
 */

let prismLoaded = false;
let prismLoadPromise: Promise<typeof import('prismjs')> | null = null;

export async function loadPrism(): Promise<typeof import('prismjs')> {
  // 既にロード済みの場合は即座に返す
  if (prismLoaded && window.Prism) {
    return Promise.resolve(window.Prism as any);
  }

  // ロード中の場合は既存のPromiseを返す
  if (prismLoadPromise) {
    return prismLoadPromise;
  }

  // Prismとその依存関係を動的にロード
  prismLoadPromise = (async () => {
    try {
      // 1. Prismコアをロード
      const PrismModule = await import('prismjs');
      const Prism = PrismModule.default || PrismModule;

      // 2. グローバルに設定（@lexical/code と言語コンポーネントが期待）
      if (typeof window !== 'undefined') {
        (window as any).Prism = Prism;
      }

      // 3. Prismが完全に初期化されるまで待機（ポーリング）
      const waitForPrism = (): Promise<void> => {
        return new Promise((resolve, reject) => {
          let attempts = 0;
          const maxAttempts = 50; // 最大5秒待機（100ms * 50）

          const checkPrism = () => {
            attempts++;

            // window.Prismが存在し、必須プロパティが揃っているか確認
            if (
              window.Prism &&
              typeof window.Prism === 'object' &&
              window.Prism.languages &&
              typeof window.Prism.languages === 'object'
            ) {
              console.log('[PrismLoader] Prism initialized successfully');
              resolve();
            } else if (attempts >= maxAttempts) {
              reject(new Error('Prism initialization timeout'));
            } else {
              setTimeout(checkPrism, 100);
            }
          };

          checkPrism();
        });
      };

      await waitForPrism();

      // 4. 言語サポートを非同期でロード（Prism完全初期化後）
      // markup (HTML) は他の多くの言語の依存関係なので最初にロード
      await import('prismjs/components/prism-markup.js');

      // 残りの言語を並列ロード
      await Promise.all([
        import('prismjs/components/prism-css.js'),
        import('prismjs/components/prism-javascript.js'),
        import('prismjs/components/prism-typescript.js'),
        import('prismjs/components/prism-jsx.js'),
        import('prismjs/components/prism-tsx.js'),
        import('prismjs/components/prism-json.js'),
        import('prismjs/components/prism-markdown.js'),
      ]);

      prismLoaded = true;
      return Prism;
    } catch (error) {
      console.error('[PrismLoader] Failed to load Prism:', error);
      prismLoadPromise = null;
      throw error;
    }
  })();

  return prismLoadPromise;
}

/**
 * Prismがロード済みかチェック
 */
export function isPrismLoaded(): boolean {
  return prismLoaded && !!window.Prism;
}
