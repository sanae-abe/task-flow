import { PlusIcon, PencilIcon, TrashIcon, KebabHorizontalIcon, ChevronLeftIcon, ChevronRightIcon } from '@primer/octicons-react';
import { Button, Box, ActionMenu, ActionList } from '@primer/react';
import React from 'react';

interface ColumnActionsProps {
  onAddTask: () => void;
  onTitleEdit: () => void;
  onDeleteColumn: () => void;
  onMoveLeft?: () => void;
  onMoveRight?: () => void;
  canMoveLeft?: boolean;
  canMoveRight?: boolean;
}

const ColumnActions: React.FC<ColumnActionsProps> = ({
  onAddTask,
  onTitleEdit,
  onDeleteColumn,
  onMoveLeft,
  onMoveRight,
  canMoveLeft = true,
  canMoveRight = true
}) => (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Button
        onClick={onAddTask}
        variant="invisible"
        size="small"
        leadingVisual={PlusIcon}
        aria-label="タスクを作成"
      />
      <ActionMenu>
        <ActionMenu.Anchor>
          <Button
            variant="invisible"
            size="small"
            leadingVisual={KebabHorizontalIcon}
            aria-label="カラム設定"
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay sx={{ zIndex: 150 }}>
          <ActionList>
            {/* カラム移動オプション */}
            {onMoveLeft && (
              <ActionList.Item
                onSelect={onMoveLeft}
                disabled={!canMoveLeft}
              >
                <ActionList.LeadingVisual>
                  <ChevronLeftIcon size={16} />
                </ActionList.LeadingVisual>
                左に移動
              </ActionList.Item>
            )}
            {onMoveRight && (
              <ActionList.Item
                onSelect={onMoveRight}
                disabled={!canMoveRight}
              >
                <ActionList.LeadingVisual>
                  <ChevronRightIcon size={16} />
                </ActionList.LeadingVisual>
                右に移動
              </ActionList.Item>
            )}

            {/* カラム移動と編集・削除の間に区切り線 */}
            {(onMoveLeft || onMoveRight) && <ActionList.Divider />}

            <ActionList.Item
              onSelect={onTitleEdit}
            >
              <ActionList.LeadingVisual>
                <PencilIcon size={16} />
              </ActionList.LeadingVisual>
              カラム名を編集
            </ActionList.Item>
            <ActionList.Item
              variant="danger"
              onSelect={onDeleteColumn}
            >
              <ActionList.LeadingVisual>
                <TrashIcon size={16} />
              </ActionList.LeadingVisual>
              カラムを削除
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Box>
  );

export default ColumnActions;