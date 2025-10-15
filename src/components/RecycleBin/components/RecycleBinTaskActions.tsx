import React from "react";
import {
  Button,
  ActionMenu,
  ActionList,
} from "@primer/react";
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
      <ActionMenu>
        <ActionMenu.Anchor>
          <Button
            size="small"
            leadingVisual={KebabHorizontalIcon}
          >
            操作
          </Button>
        </ActionMenu.Anchor>
        <ActionMenu.Overlay>
          <ActionList>
            <ActionList.Item onSelect={() => onRestore(taskId)}>
              <ActionList.LeadingVisual>
                <HistoryIcon size={16} />
              </ActionList.LeadingVisual>
              復元
            </ActionList.Item>
            <ActionList.Divider />
            <ActionList.Item
              variant="danger"
              onSelect={() => onDeleteConfirm(taskId)}
            >
              <ActionList.LeadingVisual>
                <TrashIcon size={16} />
              </ActionList.LeadingVisual>
              完全に削除
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </TaskActionsContainer>
  );
};