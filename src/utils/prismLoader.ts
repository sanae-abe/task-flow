/**
 * Prism.js Dynamic Loader
 * Lexical CodeHighlightPluginが必要とするPrismを動的にロード
 * 初期バンドルサイズを削減
 */

let prismLoaded = false;
let prismLoadPromise: Promise<typeof import('prismjs')> | null = null;

/**
 * 言語が正しくロードされているか確認（ポーリング）
 */
async function ensureLanguageLoaded(languageName: string): Promise<void> {
  return new Promise(resolve => {
    let attempts = 0;
    const maxAttempts = 30; // 最大3秒待機（100ms * 30）

    const checkLanguage = () => {
      attempts++;

      if (window.Prism?.languages?.[languageName]) {
        resolve();
      } else if (attempts >= maxAttempts) {
        console.warn(
          `[PrismLoader] Language '${languageName}' not loaded after ${maxAttempts} attempts`
        );
        resolve(); // エラーにせず、警告のみで続行
      } else {
        setTimeout(checkLanguage, 100);
      }
    };

    checkLanguage();
  });
}

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
      const waitForPrism = (): Promise<void> =>
        new Promise((resolve, reject) => {
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

      await waitForPrism();

      // 4. 言語サポートを依存関係順にロード（Prism完全初期化後）
      // 重要: 言語には依存関係があるため、順序が重要
      // 各言語ロード後にPrism.languagesに正しく登録されているか確認
      try {
        // markup (HTML) は多くの言語の依存関係
        await import('prismjs/components/prism-markup.js');
        await ensureLanguageLoaded('markup');

        // clike は JavaScript/TypeScriptの依存関係
        // @ts-ignore - prismjs components don't have type declarations
        await import('prismjs/components/prism-clike.js');
        await ensureLanguageLoaded('clike');

        // JavaScript は TypeScript/JSX/TSXの依存関係
        await import('prismjs/components/prism-javascript.js');
        await ensureLanguageLoaded('javascript');

        // TypeScript は TSXの依存関係
        await import('prismjs/components/prism-typescript.js');
        await ensureLanguageLoaded('typescript');

        // JSX（JavaScriptに依存）
        await import('prismjs/components/prism-jsx.js');
        await ensureLanguageLoaded('jsx');

        // TSX（TypeScriptとJSXに依存）
        await import('prismjs/components/prism-tsx.js');
        await ensureLanguageLoaded('tsx');

        // その他の独立した言語
        await import('prismjs/components/prism-css.js');
        await import('prismjs/components/prism-json.js');
        await import('prismjs/components/prism-markdown.js');

        console.log(
          '[PrismLoader] All language components loaded successfully'
        );
      } catch (langError) {
        console.error(
          '[PrismLoader] Failed to load language components:',
          langError
        );
        // 言語ロードに失敗してもPrism自体は使用可能なので続行
      }

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
