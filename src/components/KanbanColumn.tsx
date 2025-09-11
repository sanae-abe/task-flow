import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, TextInput, Textarea, Box, Text, Heading, ActionMenu, ActionList } from '@primer/react';
import { PlusIcon, KebabHorizontalIcon, PencilIcon } from '@primer/octicons-react';
import type { Column, Task } from '../types';
import { useKanban } from '../contexts/KanbanContext';
import TaskCard from './TaskCard';

interface KanbanColumnProps {
  column: Column;
  onTaskClick?: (task: Task) => void;
}

const KanbanColumn: React.FC<KanbanColumnProps> = ({ column, onTaskClick }) => {
  const [isAddingTask, setIsAddingTask] = useState(false);
  const [newTaskTitle, setNewTaskTitle] = useState('');
  const [newTaskDescription, setNewTaskDescription] = useState('');
  const [newTaskDueDate, setNewTaskDueDate] = useState('');
  const [isEditingTitle, setIsEditingTitle] = useState(false);
  const [editingTitle, setEditingTitle] = useState(column.title);
  const { createTask, updateColumn, deleteColumn } = useKanban();
  
  const { setNodeRef } = useDroppable({
    id: column.id,
  });

  useEffect(() => {
    setEditingTitle(column.title);
  }, [column.title]);
  
  const handleAddTask = () => {
    if (newTaskTitle.trim()) {
      const dueDate = newTaskDueDate ? new Date(newTaskDueDate) : undefined;
      createTask(column.id, newTaskTitle.trim(), newTaskDescription.trim(), dueDate);
      setNewTaskTitle('');
      setNewTaskDescription('');
      setNewTaskDueDate('');
      setIsAddingTask(false);
    }
  };
  
  const handleCancel = () => {
    setNewTaskTitle('');
    setNewTaskDescription('');
    setNewTaskDueDate('');
    setIsAddingTask(false);
  };

  const handleTitleDoubleClick = () => {
    setIsEditingTitle(true);
    setEditingTitle(column.title);
  };

  const handleTitleSave = () => {
    if (editingTitle.trim() && editingTitle.trim() !== column.title) {
      updateColumn(column.id, { title: editingTitle.trim() });
    }
    setIsEditingTitle(false);
  };

  const handleTitleCancel = () => {
    setEditingTitle(column.title);
    setIsEditingTitle(false);
  };

  const handleTitleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleTitleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
      handleTitleCancel();
    }
  };

  const handleDeleteColumn = () => {
    if (window.confirm(`「${column.title}」カラムを削除しますか？このカラム内のすべてのタスクも削除されます。`)) {
      deleteColumn(column.id);
    }
  };

  const handleRenameColumn = () => {
    setIsEditingTitle(true);
    setEditingTitle(column.title);
  };
  
  return (
    <Box 
      sx={{ 
        minWidth: '320px', 
        flexShrink: 0, 
        minHeight: '600px',
        backgroundColor: 'transparent',
        p: 0
      }}
    >
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
              onBlur={handleTitleSave}
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
                onDoubleClick={handleTitleDoubleClick}
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
            onClick={() => setIsAddingTask(true)}
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
                    handleRenameColumn();
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
                    handleDeleteColumn();
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
      
      {isAddingTask && (
        <Box 
          bg="canvas.default" 
          borderRadius={2} 
          p={4} 
          border="1px solid" 
          borderColor="border.default"
          mb={4}
          sx={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)',
            display: 'flex',
            flexDirection: 'column',
            gap: 3
          }}
        >
          <Box>
            <TextInput
              value={newTaskTitle}
              onChange={(e) => setNewTaskTitle(e.target.value)}
              placeholder="タスクタイトル"
              autoFocus
              sx={{ 
                fontSize: 2, 
                fontWeight: '500',
                width: '100%'
              }}
            />
          </Box>
          <Box>
            <Textarea
              value={newTaskDescription}
              onChange={(e) => setNewTaskDescription(e.target.value)}
              placeholder="タスクの説明（任意）"
              sx={{ 
                resize: 'none', 
                height: '80px',
                fontSize: 1,
                width: '100%'
              }}
            />
          </Box>
          <Box>
            <Text fontSize={1} fontWeight="600" display="block" mb={2} color="fg.default">
              期限（任意）
            </Text>
            <TextInput
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              id="due-date"
              sx={{ width: '100%' }}
            />
          </Box>
          <Box display="flex" gap={2}>
            <Button onClick={handleAddTask} variant="primary" sx={{ fontWeight: '500' }}>
              追加
            </Button>
            <Button onClick={handleCancel}>
              キャンセル
            </Button>
          </Box>
        </Box>
      )}
      
      <Box 
        ref={setNodeRef} 
        sx={{ 
          minHeight: '320px',
          display: 'flex',
          flexDirection: 'column',
          gap: 3
        }}
      >
        <SortableContext items={column.tasks.map(task => task.id)} strategy={verticalListSortingStrategy}>
          {column.tasks.map((task) => (
            <TaskCard 
              key={task.id} 
              task={task} 
              columnId={column.id}
              onTaskClick={onTaskClick}
            />
          ))}
        </SortableContext>
      </Box>
    </Box>
  );
};

export default KanbanColumn;