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
  const [newColumnColor, setNewColumnColor] = useState('#6b7280');
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
      <Box display="flex" alignItems="center" justifyContent="center" height="400px">
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
      createColumn(newColumnTitle.trim(), newColumnColor);
      setNewColumnTitle('');
      setNewColumnColor('#6b7280');
      setIsAddingColumn(false);
    }
  };
  
  const handleCancelAddColumn = () => {
    setNewColumnTitle('');
    setNewColumnColor('#6b7280');
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
    <Box width="100%" height="100%">
      <Box mb={4}>
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
              sx={{ fontSize: 3, fontWeight: 'bold', padding: 2 }}
            />
            <Button onClick={handleSaveBoardTitle} size="small">
              保存
            </Button>
            <Button onClick={handleCancelBoardTitleEdit} size="small">
              キャンセル
            </Button>
          </Box>
        ) : (
          <Box display="flex" alignItems="center" gap={3} mb={2}>
            <Heading 
              sx={{ fontSize: 3, margin: 0, cursor: 'pointer', '&:hover': { color: 'accent.fg' } }}
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
            />
          </Box>
        )}
        <Text fontSize={1} color="fg.muted" mt={2}>
          {state.currentBoard.columns.length} カラム • 
          {state.currentBoard.columns.reduce((total, col) => total + col.tasks.length, 0)} タスク
        </Text>
      </Box>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <Box display="flex" sx={{ overflowX: 'auto', gap: 4, pb: 4 }}>
          {state.currentBoard.columns.map((column) => (
            <KanbanColumn 
              key={column.id} 
              column={column} 
              onTaskClick={handleTaskClick}
            />
          ))}
          
          {isAddingColumn ? (
            <Box 
              bg="canvas.default" 
              borderRadius={2} 
              p={3} 
              border="1px solid" 
              borderColor="border.default"
              sx={{ minWidth: '320px', flexShrink: 0 }}
            >
              <TextInput
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="カラム名"
                autoFocus
                sx={{ mb: 3 }}
              />
              <Box mb={3}>
                <Text fontSize={1} fontWeight="bold" display="block" mb={1}>
                  カラーを選択
                </Text>
                <Box display="flex" gap={2}>
                  {['#E96C7F', '#EDC369', '#10B981', '#7FAFD6', '#03B6C3', '#E4DBE4', '#EACF96', '#B9E1DD'].map((color) => (
                    <Button
                      key={color}
                      onClick={() => setNewColumnColor(color)}
                      variant="invisible"
                      sx={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '50%',
                        backgroundColor: color,
                        border: newColumnColor === color ? '2px solid' : '2px solid transparent',
                        borderColor: newColumnColor === color ? 'fg.default' : 'transparent',
                        cursor: 'pointer',
                        '&:hover': {
                          opacity: 0.8
                        }
                      }}
                    />
                  ))}
                </Box>
              </Box>
              <Box display="flex" gap={2}>
                <Button onClick={handleAddColumn} size="small">
                  追加
                </Button>
                <Button onClick={handleCancelAddColumn} size="small">
                  キャンセル
                </Button>
              </Box>
            </Box>
          ) : (
            <Button
              onClick={() => setIsAddingColumn(true)}
              variant="secondary"
              sx={{
                minWidth: '320px',
                height: '100px',
                flexShrink: 0,
                borderStyle: 'dashed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              + カラムを追加
            </Button>
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