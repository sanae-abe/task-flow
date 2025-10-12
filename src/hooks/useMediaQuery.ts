import { useState, useEffect } from "react";

/**
 * メディアクエリの状態を監視するReactフック
 *
 * @param query - CSS メディアクエリ文字列（例: "(max-width: 768px)"）
 * @returns クエリがマッチしている場合はtrue、そうでなければfalse
 *
 * @example
 * ```typescript
 * const isMobile = useMediaQuery("(max-width: 768px)");
 * const isTablet = useMediaQuery("(min-width: 769px) and (max-width: 1024px)");
 * const prefersReducedMotion = useMediaQuery("(prefers-reduced-motion: reduce)");
 * ```
 */
export const useMediaQuery = (query: string): boolean => {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);

    // 初期状態を設定
    if (media.matches !== matches) {
      setMatches(media.matches);
    }

    // 変更リスナーを設定
    const listener = () => setMatches(media.matches);
    media.addEventListener("change", listener);

    // クリーンアップ
    return () => media.removeEventListener("change", listener);
  }, [matches, query]);

  return matches;
};
