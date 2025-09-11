import React from 'react';
import { Button, Box, ActionMenu, ActionList } from '@primer/react';
import { PlusIcon, PencilIcon, TrashIcon, KebabHorizontalIcon } from '@primer/octicons-react';

interface ColumnActionsProps {
  onAddTask: () => void;
  onTitleEdit: () => void;
  onDeleteColumn: () => void;
}

const ColumnActions: React.FC<ColumnActionsProps> = ({
  onAddTask,
  onTitleEdit,
  onDeleteColumn
}) => {
  return (
    <Box sx={{ display: "flex", alignItems: "center" }}>
      <Button
        onClick={onAddTask}
        variant="invisible"
        size="small"
        leadingVisual={PlusIcon}
        aria-label="タスクを追加"
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
};

export default ColumnActions;