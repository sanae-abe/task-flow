import React from 'react';
import { Button, Box, ActionMenu, ActionList } from '@primer/react';
import { PlusIcon, KebabHorizontalIcon, PencilIcon } from '@primer/octicons-react';

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
    <Box display="flex" alignItems="center" gap={1}>
      <Button
        onClick={onAddTask}
        variant="invisible"
        size="small"
        leadingVisual={PlusIcon}
        aria-label="Add task"
      />
      <ActionMenu>
        <ActionMenu.Anchor>
          <Button
            variant="invisible"
            size="small"
            leadingVisual={KebabHorizontalIcon}
            aria-label="Column options"
          />
        </ActionMenu.Anchor>
        <ActionMenu.Overlay 
          width="medium" 
        >
          <ActionList>
            <ActionList.Item 
              onSelect={(event) => {
                event.preventDefault();
                onTitleEdit();
              }}
            >
              <ActionList.LeadingVisual>
                <PencilIcon size={16} />
              </ActionList.LeadingVisual>
              Edit column name
            </ActionList.Item>
            <ActionList.Divider />
            <ActionList.Item 
              variant="danger" 
              onSelect={(event) => {
                event.preventDefault();
                onDeleteColumn();
              }}
            >
              Delete column
            </ActionList.Item>
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </Box>
  );
};

export default ColumnActions;