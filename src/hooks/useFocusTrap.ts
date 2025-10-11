import { useEffect, useRef, useCallback } from "react";

/**
 * フォーカストラップのカスタムフック
 * ダイアログやモーダル内でキーボードフォーカスを制御し、
 * アクセシビリティを向上させます
 */
export const useFocusTrap = (isActive: boolean = false) => {
  const containerRef = useRef<HTMLElement>(null);
  const previousActiveElementRef = useRef<HTMLElement | null>(null);

  // フォーカス可能な要素のセレクタ
  const focusableElementsSelector = [
    "button:not([disabled])",
    "[href]",
    "input:not([disabled])",
    "select:not([disabled])",
    "textarea:not([disabled])",
    '[tabindex]:not([tabindex="-1"]):not([disabled])',
    '[contenteditable="true"]',
  ].join(", ");

  // フォーカス可能な要素を取得
  const getFocusableElements = useCallback(() => {
    if (!containerRef.current) {
      return [];
    }

    const elements = containerRef.current.querySelectorAll(
      focusableElementsSelector,
    );
    return Array.from(elements) as HTMLElement[];
  }, [focusableElementsSelector]);

  // 最初のフォーカス可能な要素にフォーカス
  const focusFirstElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    const firstElement = focusableElements[0];
    if (firstElement) {
      firstElement.focus();
    }
  }, [getFocusableElements]);

  // 最後のフォーカス可能な要素にフォーカス
  const focusLastElement = useCallback(() => {
    const focusableElements = getFocusableElements();
    const lastElement = focusableElements[focusableElements.length - 1];
    if (lastElement) {
      lastElement.focus();
    }
  }, [getFocusableElements]);

  // Tabキーのハンドリング
  const handleTabKey = useCallback(
    (event: KeyboardEvent) => {
      if (event.key !== "Tab") {
        return;
      }

      const focusableElements = getFocusableElements();
      if (focusableElements.length === 0) {
        return;
      }

      const firstElement = focusableElements[0];
      const lastElement = focusableElements[focusableElements.length - 1];
      const activeElement = document.activeElement as HTMLElement;

      if (event.shiftKey) {
        // Shift + Tab: 逆方向
        if (activeElement === firstElement && lastElement) {
          event.preventDefault();
          lastElement.focus();
        }
      } else {
        // Tab: 順方向
        if (activeElement === lastElement && firstElement) {
          event.preventDefault();
          firstElement.focus();
        }
      }
    },
    [getFocusableElements],
  );

  // Escapeキーのハンドリング（オプション）
  const handleEscapeKey = useCallback(
    (event: KeyboardEvent, onEscape?: () => void) => {
      if (event.key === "Escape" && onEscape) {
        onEscape();
      }
    },
    [],
  );

  // フォーカストラップの有効化/無効化
  useEffect(() => {
    if (!isActive || !containerRef.current) {
      return;
    }

    // 現在のアクティブ要素を保存
    previousActiveElementRef.current = document.activeElement as HTMLElement;

    // 初期フォーカスを設定
    setTimeout(() => {
      focusFirstElement();
    }, 0);

    // キーボードイベントリスナーを追加
    const handleKeyDown = (event: KeyboardEvent) => {
      handleTabKey(event);
    };

    document.addEventListener("keydown", handleKeyDown);

    // クリーンアップ
    return () => {
      document.removeEventListener("keydown", handleKeyDown);

      // 前のアクティブ要素にフォーカスを戻す
      if (previousActiveElementRef.current) {
        previousActiveElementRef.current.focus();
      }
    };
  }, [isActive, focusFirstElement, handleTabKey]);

  // aria-hidden属性の管理（ダイアログ外の要素を非表示にする）
  useEffect(() => {
    if (!isActive) {
      return;
    }

    const elementsToHide: {
      element: Element;
      originalAriaHidden: string | null;
    }[] = [];

    // body直下の要素（ダイアログ以外）にaria-hidden="true"を設定
    const bodyChildren = Array.from(document.body.children);
    bodyChildren.forEach((element) => {
      if (element !== containerRef.current?.closest('[role="dialog"]')) {
        const originalAriaHidden = element.getAttribute("aria-hidden");
        elementsToHide.push({ element, originalAriaHidden });
        element.setAttribute("aria-hidden", "true");
      }
    });

    // クリーンアップ
    return () => {
      elementsToHide.forEach(({ element, originalAriaHidden }) => {
        if (originalAriaHidden !== null) {
          element.setAttribute("aria-hidden", originalAriaHidden);
        } else {
          element.removeAttribute("aria-hidden");
        }
      });
    };
  }, [isActive]);

  return {
    containerRef,
    focusFirstElement,
    focusLastElement,
    handleEscapeKey,
  };
};

export default useFocusTrap;
