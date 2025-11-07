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
    const Prism = await import('prismjs');

    // 言語サポートを非同期でロード
    await Promise.all([
      import('prismjs/components/prism-markup.js'), // HTML, XML, SVG
      import('prismjs/components/prism-javascript.js'),
      import('prismjs/components/prism-typescript.js'),
      import('prismjs/components/prism-jsx.js'),
      import('prismjs/components/prism-tsx.js'),
      import('prismjs/components/prism-css.js'),
      import('prismjs/components/prism-json.js'),
      import('prismjs/components/prism-markdown.js'),
    ]);

    // Prismをグローバルに設定（@lexical/code が期待）
    if (typeof window !== 'undefined') {
      (window as any).Prism = Prism.default || Prism;
    }

    prismLoaded = true;
    return Prism.default || Prism;
  })();

  return prismLoadPromise;
}

/**
 * Prismがロード済みかチェック
 */
export function isPrismLoaded(): boolean {
  return prismLoaded && !!window.Prism;
}
