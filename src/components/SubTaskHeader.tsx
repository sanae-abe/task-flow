import { PlusIcon } from "@primer/octicons-react";
import { Text, Button } from "@primer/react";
import React from "react";

interface SubTaskHeaderProps {
  completedCount: number;
  totalCount: number;
  isAdding: boolean;
  onStartAdding: () => void;
}

const SubTaskHeader: React.FC<SubTaskHeaderProps> = ({
  completedCount,
  totalCount,
  isAdding,
  onStartAdding,
}) => (
  <div
    style={{
      display: "flex",
      alignItems: "center",
      justifyContent: "space-between",
      marginBottom: "8px",
    }}
  >
    <Text sx={{ fontSize: 1, fontWeight: "700" }}>
      サブタスク {totalCount > 0 && `(${completedCount}/${totalCount})`}
    </Text>
    {!isAdding && (
      <Button
        onClick={onStartAdding}
        variant="invisible"
        size="small"
        leadingVisual={PlusIcon}
        aria-label="サブタスクを作成"
      >
        追加
      </Button>
    )}
  </div>
);

export default SubTaskHeader;
