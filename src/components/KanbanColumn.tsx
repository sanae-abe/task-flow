import React, { useState, useEffect } from 'react';
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
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
  const { createTask, updateColumn } = useKanban();
  
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
  
  return (
    <div className="pulse-card pulse-column">
      <div
        className="flex items-center justify-between pulse-column-header"
        style={{ borderBottom: `2px solid ${column.color}` }}
      >
        {isEditingTitle ? (
          <input
            type="text"
            value={editingTitle}
            onChange={(e) => setEditingTitle(e.target.value)}
            onBlur={handleTitleSave}
            onKeyDown={handleTitleKeyDown}
            className="pulse-input pulse-input-small pulse-h4 pulse-board-title"
            autoFocus
            style={{ minWidth: '120px', maxWidth: '200px' }}
          />
        ) : (
          <h2 
            className="pulse-h4 pulse-board-title"
            onDoubleClick={handleTitleDoubleClick}
            style={{ cursor: 'pointer' }}
            title="ダブルクリックで編集"
          >
            {column.title}
          </h2>
        )}
        <div className="flex items-center pulse-column-header-info">
          <div
            className="pulse-column-color-dot"
            style={{ backgroundColor: column.color }}
          />
          <span className="pulse-caption pulse-column-badge">
            {column.tasks.length}
          </span>
        </div>
      </div>
      
      <div ref={setNodeRef} className="pulse-column-content">
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
      </div>
      
      {isAddingTask ? (
        <div className="pulse-card pulse-add-task-form">
          <input
            type="text"
            value={newTaskTitle}
            onChange={(e) => setNewTaskTitle(e.target.value)}
            placeholder="タスクタイトル"
            className="pulse-input pulse-input-small"
            autoFocus
          />
          <textarea
            value={newTaskDescription}
            onChange={(e) => setNewTaskDescription(e.target.value)}
            placeholder="タスクの説明（任意）"
            className="pulse-input pulse-textarea-small"
          />
          <div className="pulse-form-group">
            <label className="pulse-label pulse-form-label">
              期限（任意）
            </label>
            <input
              type="date"
              value={newTaskDueDate}
              onChange={(e) => setNewTaskDueDate(e.target.value)}
              className="pulse-input"
            />
          </div>
          <div className="flex pulse-form-actions">
            <button
              onClick={handleAddTask}
              className="pulse-button pulse-button-primary pulse-button-small"
            >
              追加
            </button>
            <button
              onClick={handleCancel}
              className="pulse-button pulse-button-secondary pulse-button-small"
            >
              キャンセル
            </button>
          </div>
        </div>
      ) : (
        <button
          onClick={() => setIsAddingTask(true)}
          className="pulse-button pulse-button-secondary pulse-add-task-button"
        >
          + タスクを追加
        </button>
      )}
    </div>
  );
};

export default KanbanColumn;