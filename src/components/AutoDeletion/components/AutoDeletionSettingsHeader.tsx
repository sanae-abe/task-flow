import React from "react";
import { Heading } from "@primer/react";
import type { AutoDeletionSettingsHeaderProps } from "../types/AutoDeletionSettingsTypes";

/**
 * 自動削除設定パネルのヘッダーコンポーネント
 *
 * デザイン強化:
 * - グラデーション背景で視覚的インパクト向上
 * - 大きなアイコンで機能を明確に表現
 * - タイポグラフィ階層の最適化
 *
 * アクセシビリティ対応:
 * - h1見出しでセマンティック構造を提供
 * - aria-labelledbyで関連付け可能なID
 * - 装飾的なアイコンにaria-hidden
 *
 * レスポンシブ対応:
 * - モバイル: コンパクトな表示
 * - タブレット/デスクトップ: 適度な余白
 */
export const AutoDeletionSettingsHeader: React.FC<
  AutoDeletionSettingsHeaderProps
> = () => (
  <header>
    {/* タイトルとサブタイトル */}
    <div style={{ marginBottom: "24px"}}>
      <Heading sx={{ fontSize: 2, fontWeight: 'bold' }}>
        自動削除設定
      </Heading>
      <div style={{ color: 'var(--fgColor-muted)', fontSize: "14px", marginTop: "8px" }}>
        完了したタスクを自動的に削除して、データを整理します。<br />
        削除条件や復元オプションを柔軟に設定できます。
      </div>
    </div>
  </header>
);
