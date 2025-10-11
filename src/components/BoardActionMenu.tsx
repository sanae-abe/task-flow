import {
  PencilIcon,
  TrashIcon,
  KebabHorizontalIcon,
  CheckCircleIcon,
} from "@primer/octicons-react";
import { ActionMenu, ActionList } from "@primer/react";
import { memo } from "react";

import SubHeaderButton from "./SubHeaderButton";

/**
 * ボード設定用のアクションメニューコンポーネント
 * ボード管理とタスク管理の機能を提供
 */
interface BoardActionMenuProps {
  /** 完了したタスクが存在するかどうか */
  hasCompletedTasks: boolean;
  /** ボードを削除可能かどうか（複数ボードがある場合のみ可能） */
  canDeleteBoard: boolean;
  /** ボード作成時のコールバック */
  onCreateBoard: () => void;
  /** ボード名編集時のコールバック */
  onEditBoard: () => void;
  /** ボード削除時のコールバック */
  onDeleteBoard: () => void;
  /** 完了タスククリア時のコールバック */
  onClearCompletedTasks: () => void;
}

const BoardActionMenu = memo<BoardActionMenuProps>(
  ({
    hasCompletedTasks,
    canDeleteBoard,
    onCreateBoard,
    onEditBoard,
    onDeleteBoard,
    onClearCompletedTasks,
  }) => (
    <ActionMenu>
      <ActionMenu.Anchor>
        <SubHeaderButton
          icon={KebabHorizontalIcon}
          aria-label="ボード設定メニューを開く"
        >
          ボード設定
        </SubHeaderButton>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <ActionList>
          {/* ボード作成アクション */}
          <ActionList.Item onSelect={onCreateBoard}>
            <ActionList.LeadingVisual>
              <PencilIcon />
            </ActionList.LeadingVisual>
            ボード作成
          </ActionList.Item>

          {/* ボード管理アクション */}
          <ActionList.Item onSelect={onEditBoard}>
            <ActionList.LeadingVisual>
              <PencilIcon />
            </ActionList.LeadingVisual>
            ボード名を編集
          </ActionList.Item>

          {/* タスク管理アクション */}
          {hasCompletedTasks && (
            <>
              <ActionList.Divider />
              <ActionList.Item onSelect={onClearCompletedTasks}>
                <ActionList.LeadingVisual>
                  <CheckCircleIcon />
                </ActionList.LeadingVisual>
                完了したタスクをクリア
              </ActionList.Item>
            </>
          )}

          {/* 危険なアクション */}
          {canDeleteBoard && (
            <>
              <ActionList.Divider />
              <ActionList.Item variant="danger" onSelect={onDeleteBoard}>
                <ActionList.LeadingVisual>
                  <TrashIcon />
                </ActionList.LeadingVisual>
                ボードを削除
              </ActionList.Item>
            </>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  ),
);

BoardActionMenu.displayName = "BoardActionMenu";

export default BoardActionMenu;
