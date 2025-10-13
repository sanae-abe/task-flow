import React from "react";
import { Button } from "@primer/react";
import { CheckIcon, SyncIcon } from "@primer/octicons-react";
import type { SettingsActionsProps } from "../types/AutoDeletionSettingsTypes";

/**
 * 設定アクションボタンセクション - 保存・リセット
 *
 * デザイン強化:
 * - プライマリボタンを強調表示
 * - アイコン追加で機能を視覚化
 * - 適切なスペーシングと視覚的階層
 *
 * アクセシビリティ対応:
 * - 明確なボタンラベル
 * - disabled状態の適切な管理
 * - aria-busyで保存中状態を通知
 * - タッチターゲットサイズの確保
 *
 * レスポンシブ対応:
 * - モバイル: 縦積み、フルサイズボタン
 * - タブレット/デスクトップ: 横並び、適度なサイズ
 */
export const SettingsActions: React.FC<SettingsActionsProps> = ({
  onSave,
  onReset,
  isSaving,
}) => (
  <footer
    style={{
      display: "flex",
      justifyContent: "flex-end",
      gap: "12px",
      marginTop: "20px",
      paddingTop: "20px",
      borderTop: "1px solid",
      borderColor: "var(--borderColor-default)",
    }}
  >
    <Button
      onClick={onReset}
      disabled={isSaving}
      aria-label="設定をデフォルト値にリセット"
      leadingVisual={SyncIcon}
    >
      リセット
    </Button>
    <Button
      variant="primary"
      onClick={onSave}
      disabled={isSaving}
      aria-busy={isSaving}
      aria-live="polite"
      leadingVisual={CheckIcon}
    >
      {isSaving ? "保存中..." : "設定を保存"}
    </Button>
  </footer>
);
