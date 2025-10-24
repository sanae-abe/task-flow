import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  KebabHorizontalIcon,
  HistoryIcon,
  TrashIcon,
} from "@primer/octicons-react";
import { LoadingButton } from "../../shared/LoadingButton";
import { MESSAGES } from "../../../constants/recycleBin";
import { TaskActionsContainer } from "../RecycleBinView.styles";

export interface RecycleBinTaskActionsProps {
  /** タスクID */
  taskId: string;
  /** 復元中のタスクID */
  restoringTaskId: string | null;
  /** 削除中のタスクID */
  deletingTaskId: string | null;
  /** 復元ハンドラ */
  onRestore: (taskId: string) => void;
  /** 削除確認ダイアログ表示ハンドラ */
  onDeleteConfirm: (taskId: string) => void;
}

/**
 * ゴミ箱タスクのアクションメニューコンポーネント
 * 復元と完全削除の操作を提供
 */
export const RecycleBinTaskActions: React.FC<RecycleBinTaskActionsProps> = ({
  taskId,
  restoringTaskId,
  deletingTaskId,
  onRestore,
  onDeleteConfirm,
}) => {
  const isLoading = restoringTaskId === taskId || deletingTaskId === taskId;

  if (isLoading) {
    return (
      <TaskActionsContainer>
        <LoadingButton
          disabled
          isLoading
          loadingText={
            restoringTaskId === taskId
              ? MESSAGES.RESTORE.IN_PROGRESS
              : "削除中..."
          }
        >
          処理中
        </LoadingButton>
      </TaskActionsContainer>
    );
  }

  return (
    <TaskActionsContainer>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            size="sm"
            variant="outline"
          >
            <KebabHorizontalIcon size={16} className="mr-2" />
            操作
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
          <DropdownMenuItem onClick={() => onRestore(taskId)}>
            <HistoryIcon size={16} className="mr-2" />
            復元
          </DropdownMenuItem>
          <DropdownMenuSeparator />
          <DropdownMenuItem onClick={() => onDeleteConfirm(taskId)}>
            <TrashIcon size={16} className="mr-2" />
            完全に削除
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </TaskActionsContainer>
  );
};