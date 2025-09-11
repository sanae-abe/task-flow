import React, { useState } from 'react';
import { Button, TextInput, Heading, Text, Box } from '@primer/react';
import { PencilIcon } from '@primer/octicons-react';
import {
  DndContext,
  DragOverlay,
  PointerSensor,
  useSensor,
  useSensors,
} from '@dnd-kit/core';
import type { DragEndEvent, DragStartEvent } from '@dnd-kit/core';
import { useKanban } from '../contexts/KanbanContext';
import KanbanColumn from './KanbanColumn';
import TaskCard from './TaskCard';
import TaskDetailSidebar from './TaskDetailSidebar';
import type { Task } from '../types';

const KanbanBoard: React.FC = () => {
  const { state, moveTask, createColumn, updateBoard } = useKanban();
  const [activeTask, setActiveTask] = useState<Task | null>(null);
  const [isAddingColumn, setIsAddingColumn] = useState(false);
  const [newColumnTitle, setNewColumnTitle] = useState('');
  const [isEditingBoardTitle, setIsEditingBoardTitle] = useState(false);
  const [editingBoardTitle, setEditingBoardTitle] = useState('');
  const [selectedTask, setSelectedTask] = useState<Task | null>(null);
  const [isTaskDetailOpen, setIsTaskDetailOpen] = useState(false);
  
  const sensors = useSensors(
    useSensor(PointerSensor, {
      activationConstraint: {
        distance: 8,
      },
    })
  );
  
  if (!state.currentBoard) {
    return (
      <Box sx={{ display: "flex", alignItems: "center", justifyContent: "center", height: "400px" }}>
        <Text fontSize={2} color="fg.muted">ボードを選択してください</Text>
      </Box>
    );
  }
  
  const handleDragStart = (event: DragStartEvent) => {
    const { active } = event;
    
    if (!state.currentBoard) {
      return;
    }
    for (const column of state.currentBoard.columns) {
      const task = column.tasks.find(task => task.id === active.id);
      if (task) {
        setActiveTask(task);
        break;
      }
    }
  };
  
  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;
    setActiveTask(null);
    
    if (!over || !state.currentBoard) {
      return;
    }
    
    const activeTaskId = active.id as string;
    const overColumnId = over.id as string;
    
    let sourceColumnId = '';
    
    for (const column of state.currentBoard.columns) {
      const taskIndex = column.tasks.findIndex(task => task.id === activeTaskId);
      if (taskIndex !== -1) {
        sourceColumnId = column.id;
        break;
      }
    }
    
    if (!sourceColumnId) {
      return;
    }
    
    const targetColumn = state.currentBoard.columns.find(col => col.id === overColumnId);
    if (!targetColumn) {
      return;
    }
    
    let targetIndex = targetColumn.tasks.length;
    
    if (sourceColumnId === overColumnId) {
      const sourceColumn = state.currentBoard.columns.find(col => col.id === sourceColumnId);
      if (!sourceColumn) {
        return;
      }
      const oldIndex = sourceColumn.tasks.findIndex(task => task.id === activeTaskId);
      const newIndex = targetColumn.tasks.findIndex(task => task.id === over.id);
      
      if (newIndex !== -1) {
        targetIndex = newIndex;
      }
      
      if (oldIndex !== newIndex) {
        moveTask(activeTaskId, sourceColumnId, overColumnId, targetIndex);
      }
    } else {
      moveTask(activeTaskId, sourceColumnId, overColumnId, targetIndex);
    }
  };
  
  const handleAddColumn = () => {
    if (newColumnTitle.trim()) {
      createColumn(newColumnTitle.trim());
      setNewColumnTitle('');
      setIsAddingColumn(false);
    }
  };
  
  const handleCancelAddColumn = () => {
    setNewColumnTitle('');
    setIsAddingColumn(false);
  };

  const handleEditBoardTitle = () => {
    if (!state.currentBoard) {
      return;
    }
    setEditingBoardTitle(state.currentBoard.title);
    setIsEditingBoardTitle(true);
  };

  const handleSaveBoardTitle = () => {
    if (!state.currentBoard || !editingBoardTitle.trim()) {
      return;
    }
    updateBoard(state.currentBoard.id, { title: editingBoardTitle.trim() });
    setIsEditingBoardTitle(false);
    setEditingBoardTitle('');
  };

  const handleCancelBoardTitleEdit = () => {
    setIsEditingBoardTitle(false);
    setEditingBoardTitle('');
  };

  const handleTaskClick = (task: Task) => {
    setSelectedTask(task);
    setIsTaskDetailOpen(true);
  };

  const handleCloseTaskDetail = () => {
    setIsTaskDetailOpen(false);
    setSelectedTask(null);
  };
  
  return (
    <Box 
      width="100%" 
      height="100vh" 
      bg="canvas.subtle"
      sx={{ overflow: 'hidden' }}
    >
      <Box 
        bg="canvas.default" 
        borderBottom="1px solid" 
        borderColor="border.muted"
        px={6}
        py={4}
        sx={{ 
          boxShadow: '0 1px 0 rgba(0, 0, 0, 0.06)'
        }}
      >
        {isEditingBoardTitle ? (
          <Box display="flex" alignItems="center" gap={3} mb={2}>
            <TextInput
              value={editingBoardTitle}
              onChange={(e) => setEditingBoardTitle(e.target.value)}
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveBoardTitle();
                }
                if (e.key === 'Escape') {
                  handleCancelBoardTitleEdit();
                }
              }}
              sx={{ 
                fontSize: 4, 
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
            <Button onClick={handleSaveBoardTitle} size="small" variant="primary">
              保存
            </Button>
            <Button onClick={handleCancelBoardTitleEdit} size="small">
              キャンセル
            </Button>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" justifyContent="space-between">
            <Box>
              <Box display="flex" alignItems="center" gap={2} mb={2}>
                <Heading 
                  sx={{ 
                    fontSize: 4, 
                    margin: 0, 
                    cursor: 'pointer', 
                    fontWeight: '600',
                    color: 'fg.default',
                    '&:hover': { color: 'accent.fg' } 
                  }}
                  onClick={handleEditBoardTitle}
                  title="クリックして編集"
                >
                  {state.currentBoard.title}
                </Heading>
                <Button
                  onClick={handleEditBoardTitle}
                  variant="invisible"
                  size="small"
                  leadingVisual={PencilIcon}
                  aria-label="ボード名を編集"
                  sx={{ 
                    color: 'fg.muted',
                    '&:hover': { color: 'accent.fg' }
                  }}
                />
              </Box>
              <Text fontSize={2} color="fg.muted">
                {state.currentBoard.columns.length} カラム • 
                {state.currentBoard.columns.reduce((total, col) => total + col.tasks.length, 0)} タスク
              </Text>
            </Box>
          </Box>
        )}
      </Box>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box 
          display="flex" 
          sx={{ 
            overflowX: 'auto', 
            gap: 6, 
            px: 6,
            py: 5,
            height: 'calc(100vh - 160px)',
            '&::-webkit-scrollbar': {
              height: '8px'
            },
            '&::-webkit-scrollbar-track': {
              background: 'canvas.subtle'
            },
            '&::-webkit-scrollbar-thumb': {
              background: 'border.muted',
              borderRadius: '4px'
            },
            '&::-webkit-scrollbar-thumb:hover': {
              background: 'border.default'
            }
          }}
        >
          {state.currentBoard.columns.map((column) => (
            <KanbanColumn 
              key={column.id} 
              column={column} 
              onTaskClick={handleTaskClick}
            />
          ))}
          
          {isAddingColumn ? (
            <Box 
              sx={{ 
                bg: 'canvas.default',
                borderRadius: 2,
                p: 4,
                border: '1px solid',
                borderColor: 'border.default',
                minWidth: '320px', 
                flexShrink: 0,
                boxShadow: '0 2px 8px rgba(0, 0, 0, 0.12)'
              }}
            >
              <TextInput
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="カラム名"
                autoFocus
                sx={{ mb: 4, fontSize: 2, fontWeight: '500' }}
              />
              <Box mb={4}>
                <Text fontSize={2} fontWeight="600" display="block" mb={3} color="fg.default">
                  カラーを選択
                </Text>
                <Box display="flex" gap={2} flexWrap="wrap">
                    <Button
                      variant="invisible"
                      sx={{
                        width: '32px',
                        height: '32px',
                        borderRadius: 2,
                        cursor: 'pointer',
                        '&:hover': {
                          transform: 'scale(1.1)',
                          transition: 'transform 0.2s ease'
                        }
                      }}
                    />
                </Box>
              </Box>
              <Box display="flex" gap={2}>
                <Button onClick={handleAddColumn} variant="primary" sx={{ fontWeight: '500' }}>
                  追加
                </Button>
                <Button onClick={handleCancelAddColumn}>
                  キャンセル
                </Button>
              </Box>
            </Box>
          ) : (
            <Box
              onClick={() => setIsAddingColumn(true)}
              sx={{
                minWidth: '320px',
                height: '160px',
                flexShrink: 0,
                border: '2px dashed',
                borderColor: 'border.muted',
                borderRadius: 2,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                cursor: 'pointer',
                backgroundColor: 'canvas.default',
                transition: 'all 0.2s ease',
                '&:hover': {
                  borderColor: 'accent.emphasis',
                  backgroundColor: 'canvas.subtle',
                  transform: 'translateY(-2px)',
                  boxShadow: '0 4px 12px rgba(0, 0, 0, 0.1)'
                }
              }}
            >
              <Box display="flex" flexDirection="column" alignItems="center" gap={2}>
                <Text fontSize={3} fontWeight="600" color="fg.muted">
                  + カラムを追加
                </Text>
                <Text fontSize={1} color="fg.muted" sx={{ textAlign: 'center' }}>
                  新しいワークフローステップを作成
                </Text>
              </Box>
            </Box>
          )}
        </Box>
        
        <DragOverlay>
          {activeTask ? (
            <TaskCard task={activeTask} columnId="" />
          ) : null}
        </DragOverlay>
      </DndContext>
      
      <TaskDetailSidebar
        task={selectedTask}
        isOpen={isTaskDetailOpen}
        onClose={handleCloseTaskDetail}
      />
    </Box>
  );
};

export default KanbanBoard;