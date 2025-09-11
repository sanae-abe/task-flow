import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { Button, TextInput, Textarea, Box, Text, Heading, ActionMenu, ActionList } from '@primer/react';
import { PlusIcon, KebabHorizontalIcon } from '@primer/octicons-react';
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
      bg="canvas.default" 
      borderRadius={2} 
      p={4} 
      sx={{ 
        minWidth: '320px', 
        flexShrink: 0, 
        minHeight: '600px',
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.08)',
        transition: 'all 0.2s ease',
        '&:hover': {
          boxShadow: '0 4px 16px rgba(0, 0, 0, 0.12)',
          transform: 'translateY(-2px)'
        }
      }}
    >
      <Box
        display="flex"
        alignItems="center"
        justifyContent="space-between"
        mb={4}
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
                  <ActionMenu.Overlay>
                    <ActionList>
                      <ActionList.Item onSelect={handleRenameColumn}>
                        カラム名を変更
                      </ActionList.Item>
                      <ActionList.Item variant="danger" onSelect={handleDeleteColumn}>
                        カラムを削除
                      </ActionList.Item>
                    </ActionList>
                  </ActionMenu.Overlay>
                </ActionMenu>
              </Box>
            </Box>
          )}
        </Box>
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
      
      {isAddingTask && (
        <Box 
          bg="canvas.default" 
          borderRadius={2} 
          p={4} 
          border="1px solid" 
          borderColor="border.default"
          mb={4}
          sx={{
            boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
          }}
        >
          <TextInput
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="タスクタイトル"
            autoFocus
            sx={{ mb: 3, fontSize: 2, fontWeight: '500' }}
          />
          <Textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="タスクの説明（任意）"
            sx={{ 
              mb: 3, 
              resize: 'none', 
              height: '80px',
              fontSize: 1
            }}
          />
          <Box mb={4}>
            <Text fontSize={1} fontWeight="600" display="block" mb={2} color="fg.default">
              期限（任意）
            </Text>
            <TextInput
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              id="due-date"
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
          gap: 2
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