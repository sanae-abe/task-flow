import React from 'react';
import { Button, TextInput, Box, Heading, ActionMenu, ActionList } from '@primer/react';
import { PlusIcon, KebabHorizontalIcon, PencilIcon } from '@primer/octicons-react';
import type { Column } from '../types';

interface ColumnHeaderProps {
  column: Column;
  isEditingTitle: boolean;
  editingTitle: string;
  setEditingTitle: (title: string) => void;
  onTitleSave: () => void;
  onTitleCancel: () => void;
  onTitleEdit: () => void;
  onDeleteColumn: () => void;
  onAddTask: () => void;
}

const ColumnHeader: React.FC<ColumnHeaderProps> = ({
  column,
  isEditingTitle,
  editingTitle,
  setEditingTitle,
  onTitleSave,
  onTitleCancel,
  onTitleEdit,
  onDeleteColumn,
  onAddTask
}) => {
  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      onTitleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      onTitleCancel();
    }
  };

  return (
    <Box
      display="flex"
      alignItems="center"
      justifyContent="space-between"
      pb={3}
    >
      <Box display="flex" alignItems="center" flex="1">
        {isEditingTitle ? (
          <TextInput
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={onTitleSave}
            onKeyDown={handleTitleKeyDown}
            autoFocus
            sx={{ 
              minWidth: '120px', 
              maxWidth: '200px', 
              fontSize: 2, 
              fontWeight: '600',
              border: 'none',
              backgroundColor: 'transparent',
              '&:focus': {
                backgroundColor: 'canvas.subtle',
                border: '1px solid',
                borderColor: 'accent.emphasis'
              }
            }}
          />
        ) : (
          <Box display="flex" alignItems="center" gap={2} flex="1">
            <Heading 
              sx={{ 
                fontSize: 2, 
                margin: 0, 
                cursor: 'pointer',
                fontWeight: '600',
                color: 'fg.default',
                '&:hover': { color: 'accent.fg' }
              }}
              onDoubleClick={onTitleEdit}
              title="ダブルクリックで編集"
            >
              {column.title}
            </Heading>
            <Box
              sx={{
                px: 3,
                py: 1,
                borderRadius: 2,
                fontSize: 1,
                fontWeight: '600'
              }}
            >
              {column.tasks.length}
            </Box>
          </Box>
        )}
      </Box>
      <Box display="flex" alignItems="center" gap={1}>
        <Button
          onClick={onAddTask}
          variant="invisible"
          size="small"
          leadingVisual={PlusIcon}
          aria-label="タスクを追加"
          sx={{
            color: 'fg.muted',
            '&:hover': { 
              color: 'accent.fg',
              backgroundColor: 'canvas.subtle'
            }
          }}
        />
        <ActionMenu>
          <ActionMenu.Anchor>
            <Button
              variant="invisible"
              size="small"
              leadingVisual={KebabHorizontalIcon}
              aria-label="カラムオプション"
              sx={{
                color: 'fg.muted',
                '&:hover': { 
                  color: 'accent.fg',
                  backgroundColor: 'canvas.subtle'
                }
              }}
            />
          </ActionMenu.Anchor>
          <ActionMenu.Overlay 
            width="medium" 
            sx={{ 
              minWidth: '180px',
              backgroundColor: 'canvas.overlay',
              border: '1px solid',
              borderColor: 'border.default',
              borderRadius: 2,
              boxShadow: '0 8px 24px rgba(0, 0, 0, 0.12)'
            }}
          >
            <ActionList
              sx={{
                backgroundColor: 'canvas.overlay'
              }}
            >
              <ActionList.Item 
                onSelect={(event) => {
                  event.preventDefault();
                  onTitleEdit();
                }}
                sx={{
                  backgroundColor: 'canvas.overlay',
                  '&:hover': {
                    backgroundColor: 'actionListItem.default.hoverBg'
                  }
                }}
              >
                <ActionList.LeadingVisual>
                  <PencilIcon size={16} />
                </ActionList.LeadingVisual>
                カラム名を変更
              </ActionList.Item>
              <ActionList.Divider />
              <ActionList.Item 
                variant="danger" 
                onSelect={(event) => {
                  event.preventDefault();
                  onDeleteColumn();
                }}
                sx={{
                  backgroundColor: 'canvas.overlay',
                  color: 'danger.fg',
                  '&:hover': {
                    backgroundColor: 'danger.subtle',
                    color: 'danger.fg'
                  }
                }}
              >
                カラムを削除
              </ActionList.Item>
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
      </Box>
    </Box>
  );
};

export default ColumnHeader;