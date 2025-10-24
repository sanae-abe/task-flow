import { cn } from "@/lib/utils";

/**
 * 通知コンテナのベーススタイル定義（Tailwind CSS版）
 */
export const containerClasses = "fixed top-5 left-1/2 -translate-x-1/2 z-[15000] pointer-events-none flex flex-col items-center gap-2";

/**
 * 通知ラッパーのベーススタイル定義（Tailwind CSS版）
 */
export const wrapperClasses = "pointer-events-auto transition-all duration-300 ease-out w-full max-w-[600px] min-w-[320px]";

/**
 * アイコンコンテナのスタイル定義（Tailwind CSS版）
 */
export const iconContainerClasses = "flex-shrink-0 mt-0.5";

/**
 * メッセージコンテナのスタイル定義（Tailwind CSS版）
 */
export const messageContainerClasses = "flex-1 min-w-0";

/**
 * メッセージテキストのスタイル定義（Tailwind CSS版）
 */
export const messageTextClasses = "block break-words";

/**
 * 閉じるボタンのスタイル定義（Tailwind CSS版）
 */
export const closeButtonClasses = "flex-shrink-0 opacity-70";

/**
 * レスポンシブコンテナクラスを生成する関数
 *
 * @param isMobile - モバイル表示かどうか
 * @returns レスポンシブ対応のコンテナクラス
 */
export const getResponsiveContainerClasses = (isMobile: boolean): string => cn(
  containerClasses,
  isMobile && "top-2.5 left-2.5 right-2.5 transform-none w-auto -translate-x-0"
);

/**
 * レスポンシブラッパークラスを生成する関数
 *
 * @param isMobile - モバイル表示かどうか
 * @returns レスポンシブ対応のラッパークラス
 */
export const getResponsiveWrapperClasses = (isMobile: boolean): string => cn(
  wrapperClasses,
  !isMobile && "min-w-[50vw]"
);

/**
 * 通知アニメーション（Tailwind CSSカスタムアニメーション）
 *
 * 注意: このアニメーションはtailwind.config.jsまたはglobals.cssで定義する必要があります。
 * 一時的にTailwindの既存アニメーションを使用: animate-fade-in-down または animate-bounce
 */