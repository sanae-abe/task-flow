import React from "react";
import { Text, Button } from "@primer/react";
import type { EmptyStateProps } from "../types";

/**
 * 空状態コンポーネント
 *
 * テーブルにタスクが存在しない時の表示を担当します。
 * フィルタが適用されている場合はクリアボタンも表示します。
 */
export const EmptyState: React.FC<EmptyStateProps> = ({
  taskFilter,
  onClearFilter,
}) => {
  const isFiltered = taskFilter.type !== "all";
  const message = isFiltered
    ? "フィルタ条件に一致するタスクがありません"
    : "タスクがありません";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        paddingBlock: "32px",
        color: "var(--fgColor-default)",
      }}
    >
      <Text sx={{ fontSize: 1, mb: 2 }}>{message}</Text>
      {isFiltered && (
        <Button variant="invisible" size="small" onClick={onClearFilter}>
          フィルタをクリア
        </Button>
      )}
    </div>
  );
};
