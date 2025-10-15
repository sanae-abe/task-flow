import React from "react";
import { TrashIcon } from "@primer/octicons-react";
import { UI_TEXT, MESSAGES } from "../../../constants/recycleBin";
import { type RecycleBinSettings } from "../../../types/settings";
import { LoadingButton } from "../../shared/LoadingButton";
import { InlineMessage } from "../../shared";
import {
  HeaderContainer,
  HeaderTop,
  HeaderTitle,
  EmptyButtonContent,
  TaskCount,
  WarningContainer,
} from "../RecycleBinView.styles";

export interface RecycleBinHeaderProps {
  /** 削除されたタスクの数 */
  taskCount: number;
  /** ゴミ箱設定 */
  settings: RecycleBinSettings;
  /** ゴミ箱を空にしている最中かどうか */
  isEmptying: boolean;
  /** ゴミ箱を空にするボタンのクリックハンドラ */
  onEmptyClick: () => void;
}

/**
 * ゴミ箱ビューのヘッダーコンポーネント
 * タイトル、タスク数、空にするボタン、警告メッセージを表示
 */
export const RecycleBinHeader: React.FC<RecycleBinHeaderProps> = ({
  taskCount,
  settings,
  isEmptying,
  onEmptyClick,
}) => (
    <HeaderContainer>
      <HeaderTop>
        <HeaderTitle>
          <TrashIcon size={16} />
          {UI_TEXT.VIEW.TITLE}
        </HeaderTitle>
        <LoadingButton
          variant="danger"
          size="small"
          isLoading={isEmptying}
          loadingText={MESSAGES.EMPTY_BIN.IN_PROGRESS}
          onClick={onEmptyClick}
        >
          <EmptyButtonContent>
            <TrashIcon size={14} />
            {UI_TEXT.VIEW.EMPTY_BIN_BUTTON}
          </EmptyButtonContent>
        </LoadingButton>
      </HeaderTop>

      <TaskCount>
        {UI_TEXT.VIEW.TASK_COUNT(taskCount)}
      </TaskCount>

      <WarningContainer>
        <InlineMessage
          variant="warning"
          message={
            settings.retentionDays === null
              ? UI_TEXT.VIEW.WARNING_UNLIMITED
              : UI_TEXT.VIEW.WARNING_LIMITED(settings.retentionDays)
          }
        />
      </WarningContainer>
    </HeaderContainer>
  );