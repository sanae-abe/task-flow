import React, { useState } from 'react';
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
      <div className="flex items-center justify-center pulse-empty-state">
        <p className="pulse-body-lg pulse-task-created">ボードを選択してください</p>
      </div>
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
    <div className="w-full h-full">
      <div className="pulse-board-header">
        {isEditingBoardTitle ? (
          <div className="flex items-center pulse-board-title-edit">
            <input
              type="text"
              value={editingBoardTitle}
              onChange={(e) => setEditingBoardTitle(e.target.value)}
              className="pulse-h2 pulse-input pulse-board-title-input"
              autoFocus
              onKeyDown={(e) => {
                if (e.key === 'Enter') {
                  handleSaveBoardTitle();
                }
                if (e.key === 'Escape') {
                  handleCancelBoardTitleEdit();
                }
              }}
            />
            <button
              onClick={handleSaveBoardTitle}
              className="pulse-button pulse-button-primary pulse-button-small"
            >
              保存
            </button>
            <button
              onClick={handleCancelBoardTitleEdit}
              className="pulse-button pulse-button-secondary pulse-button-small"
            >
              キャンセル
            </button>
          </div>
        ) : (
          <div className="flex items-center pulse-board-title-edit">
            <h1 
              className="pulse-h2 pulse-board-title"
              onClick={handleEditBoardTitle}
              title="クリックして編集"
            >
              {state.currentBoard.title}
            </h1>
            <button
              onClick={handleEditBoardTitle}
              className="pulse-button pulse-button-secondary pulse-icon-button"
              title="ボード名を編集"
            >
              ✏️
            </button>
          </div>
        )}
        <p className="pulse-body-sm pulse-board-stats">
          {state.currentBoard.columns.length} カラム • 
          {state.currentBoard.columns.reduce((total, col) => total + col.tasks.length, 0)} タスク
        </p>
      </div>
      
      <DndContext
        sensors={sensors}
        onDragStart={handleDragStart}
        onDragEnd={handleDragEnd}
      >
        <div className="flex overflow-x-auto pulse-columns-container">
          {state.currentBoard.columns.map((column) => (
            <KanbanColumn 
              key={column.id} 
              column={column} 
              onTaskClick={handleTaskClick}
            />
          ))}
          
          {isAddingColumn ? (
            <div className="pulse-card pulse-add-column">
              <input
                type="text"
                value={newColumnTitle}
                onChange={(e) => setNewColumnTitle(e.target.value)}
                placeholder="カラム名"
                className="pulse-input pulse-input-small"
                autoFocus
              />
              <div className="pulse-form-group">
                <label className="pulse-label pulse-form-label">
                  カラーを選択
                </label>
                <div className="flex pulse-color-picker">
                  {['#E96C7F', '#EDC369', '#10B981', '#7FAFD6', '#03B6C3', '#E4DBE4', '#EACF96', '#B9E1DD'].map((color) => (
                    <button
                      key={color}
                      onClick={() => setNewColumnColor(color)}
                      className={`pulse-color-option ${newColumnColor === color ? 'selected' : ''}`}
                      style={{ backgroundColor: color }}
                    />
                  ))}
                </div>
              </div>
              <div className="flex pulse-form-actions">
                <button
                  onClick={handleAddColumn}
                  className="pulse-button pulse-button-primary pulse-button-small"
                >
                  追加
                </button>
                <button
                  onClick={handleCancelAddColumn}
                  className="pulse-button pulse-button-secondary pulse-button-small"
                >
                  キャンセル
                </button>
              </div>
            </div>
          ) : (
            <button
              onClick={() => setIsAddingColumn(true)}
              className="pulse-button pulse-button-secondary flex items-center justify-center pulse-add-column-button"
            >
              + カラムを追加
            </button>
          )}
        </div>
        
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
    </div>
  );
};

export default KanbanBoard;