import React from "react";

/**
 * 通知コンテナのベーススタイル定義
 */
export const containerStyles: React.CSSProperties = {
  position: "fixed",
  top: "20px",
  left: "50%",
  transform: "translateX(-50%)",
  zIndex: 15000, // ダイアログ（z-index: 9999/10000）より高く設定
  pointerEvents: "none",
  display: "flex",
  flexDirection: "column",
  alignItems: "center",
  gap: "8px",
};

/**
 * 通知ラッパーのベーススタイル定義
 */
export const wrapperStyles: React.CSSProperties = {
  pointerEvents: "auto",
  animation: "slideInFromTop 0.3s ease-out",
  width: "100%",
  maxWidth: "600px",
  minWidth: "320px",
};

/**
 * 通知アイテムのインナースタイル定義
 */
export const notificationItemStyles: React.CSSProperties = {
  display: "flex",
  alignItems: "center",
  gap: "8px",
  padding: "10px 16px",
  position: "relative",
  width: "100%",
  boxSizing: "border-box",
};

/**
 * アイコンコンテナのスタイル定義
 */
export const iconContainerStyles: React.CSSProperties = {
  flexShrink: 0,
  marginTop: "2px",
};

/**
 * メッセージコンテナのスタイル定義
 */
export const messageContainerStyles: React.CSSProperties = {
  flex: 1,
  minWidth: 0,
};

/**
 * メッセージテキストのスタイル定義
 */
export const messageTextStyles: React.CSSProperties = {
  display: "block",
  wordBreak: "break-word",
};

/**
 * 閉じるボタンのスタイル定義
 */
export const closeButtonStyles: React.CSSProperties = {
  flexShrink: 0,
  opacity: 0.7,
};

/**
 * レスポンシブコンテナスタイルを生成する関数
 *
 * @param isMobile - モバイル表示かどうか
 * @returns レスポンシブ対応のコンテナスタイル
 */
export const getResponsiveContainerStyles = (
  isMobile: boolean,
): React.CSSProperties => ({
  ...containerStyles,
  ...(isMobile && {
    top: "10px",
    left: "10px",
    right: "10px",
    transform: "none",
    width: "auto",
  }),
});

/**
 * レスポンシブラッパースタイルを生成する関数
 *
 * @param isMobile - モバイル表示かどうか
 * @returns レスポンシブ対応のラッパースタイル
 */
export const getResponsiveWrapperStyles = (
  isMobile: boolean,
): React.CSSProperties => ({
  ...wrapperStyles,
  ...(!isMobile && {
    minWidth: "50vw",
  }),
});

/**
 * 通知アニメーション用のCSS定義
 */
export const notificationAnimationCSS = `
  @keyframes slideInFromTop {
    from {
      transform: translateY(-100%);
      opacity: 0;
    }
    to {
      transform: translateY(0);
      opacity: 1;
    }
  }
`;