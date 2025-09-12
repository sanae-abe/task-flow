import { PencilIcon, TrashIcon, KebabHorizontalIcon, CheckCircleIcon } from '@primer/octicons-react';
import { ActionMenu, ActionList } from '@primer/react';
import React from 'react';

import SubHeaderButton from './SubHeaderButton';

interface BoardActionMenuProps {
  hasCompletedTasks: boolean;
  canDeleteBoard: boolean;
  onEditBoard: () => void;
  onDeleteBoard: () => void;
  onClearCompletedTasks: () => void;
}

const BoardActionMenu: React.FC<BoardActionMenuProps> = ({
  hasCompletedTasks,
  canDeleteBoard,
  onEditBoard,
  onDeleteBoard,
  onClearCompletedTasks,
}) => (
    <ActionMenu>
      <ActionMenu.Anchor>
        <SubHeaderButton icon={KebabHorizontalIcon}>
          ボード設定
        </SubHeaderButton>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay>
        <ActionList>
          {hasCompletedTasks && (
            <ActionList.Item onSelect={onClearCompletedTasks}>
              <ActionList.LeadingVisual>
                <CheckCircleIcon size={16} />
              </ActionList.LeadingVisual>
              完了したタスクをクリア
            </ActionList.Item>
          )}
          <ActionList.Item onSelect={onEditBoard}>
            <ActionList.LeadingVisual>
              <PencilIcon size={16} />
            </ActionList.LeadingVisual>
            ボード名を編集
          </ActionList.Item>
          {canDeleteBoard && (
            <ActionList.Item
              variant="danger"
              onSelect={onDeleteBoard}
            >
              <ActionList.LeadingVisual>
                <TrashIcon size={16} />
              </ActionList.LeadingVisual>
              ボードを削除
            </ActionList.Item>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );

export default BoardActionMenu;