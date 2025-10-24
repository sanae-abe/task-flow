import { PlusIcon } from "@primer/octicons-react";
import { Button } from "@/components/ui/button";
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
  <div className="flex items-center justify-between mb-2">
    <h3 className="text-sm font-bold">
      サブタスク {totalCount > 0 && `(${completedCount}/${totalCount})`}
    </h3>
    {!isAdding && (
      <Button
        onClick={onStartAdding}
        variant="ghost"
        size="sm"
        aria-label="サブタスクを作成"
        className="flex items-center gap-1"
      >
        <PlusIcon size={16} />
        追加
      </Button>
    )}
  </div>
);

export default SubTaskHeader;
