import React, { useState } from 'react';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Task } from '../types';
import { useKanban } from '../contexts/KanbanContext';

interface TaskCardProps {
  task: Task;
  columnId: string;
  onTaskClick?: (task: Task) => void;
}

const TaskCard: React.FC<TaskCardProps> = ({ task, columnId, onTaskClick }) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(task.title);
  const [editDescription, setEditDescription] = useState(task.description);
  const [editDueDate, setEditDueDate] = useState(
    task.dueDate ? task.dueDate.toISOString().split('T')[0] : ''
  );
  const { updateTask, deleteTask } = useKanban();
  
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({ id: task.id });
  
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };
  
  const handleSave = () => {
    const dueDate = editDueDate ? new Date(editDueDate) : undefined;
    updateTask(task.id, {
      title: editTitle,
      description: editDescription,
      dueDate,
      updatedAt: new Date(),
    });
    setIsEditing(false);
  };
  
  const handleCancel = () => {
    setEditTitle(task.title);
    setEditDescription(task.description);
    setEditDueDate(task.dueDate ? task.dueDate.toISOString().split('T')[0] : '');
    setIsEditing(false);
  };
  
  const handleDelete = () => {
    if (window.confirm('このタスクを削除しますか？')) {
      deleteTask(task.id, columnId);
    }
  };

  const isOverdue = () => {
    if (!task.dueDate) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const isDueSoon = () => {
    if (!task.dueDate) {
      return false;
    }
    const today = new Date();
    const tomorrow = new Date(today);
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = new Date(task.dueDate);
    today.setHours(0, 0, 0, 0);
    tomorrow.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate >= today && dueDate <= tomorrow;
  };

  const formatDueDate = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      month: 'short',
      day: 'numeric'
    });
  };

  const handleTaskClick = () => {
    if (!isEditing && onTaskClick) {
      onTaskClick(task);
    }
  };
  
  if (isEditing) {
    return (
      <div className="pulse-card">
        <input
          type="text"
          value={editTitle}
          onChange={(e) => setEditTitle(e.target.value)}
          className="pulse-input pulse-input-small"
          placeholder="タスクタイトル"
        />
        <textarea
          value={editDescription}
          onChange={(e) => setEditDescription(e.target.value)}
          className="pulse-input pulse-textarea-small"
          placeholder="タスクの説明"
        />
        <div className="pulse-form-group">
          <label className="pulse-label pulse-form-label">
            期限（任意）
          </label>
          <input
            type="date"
            value={editDueDate}
            onChange={(e) => setEditDueDate(e.target.value)}
            className="pulse-input"
          />
        </div>
        <div className="flex pulse-form-actions">
          <button
            onClick={handleSave}
            className="pulse-button pulse-button-primary pulse-button-small"
          >
            保存
          </button>
          <button
            onClick={handleCancel}
            className="pulse-button pulse-button-secondary pulse-button-small"
          >
            キャンセル
          </button>
        </div>
      </div>
    );
  }
  
  return (
    <div
      ref={setNodeRef}
      style={{
        ...style,
        borderBottomColor: isOverdue() 
          ? 'var(--pulse-error)' 
          : isDueSoon() 
          ? 'var(--pulse-warning)' 
          : undefined
      }}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...attributes}
      // eslint-disable-next-line react/jsx-props-no-spreading
      {...listeners}
      onClick={handleTaskClick}
      className={`pulse-card pulse-task-card cursor-grab active:cursor-grabbing ${
        isDragging ? 'dragging' : ''
      } ${
        isOverdue() ? 'overdue' : isDueSoon() ? 'due-soon' : ''
      }`}
    >
      <div>
        <h3 className="pulse-h5 pulse-task-title">
          {task.title}
        </h3>
        {task.description && (
          <p className="pulse-body-sm pulse-task-description">
            {task.description}
          </p>
        )}
        {task.dueDate && (
          <div className={`pulse-caption pulse-due-date-badge ${
            isOverdue() 
              ? 'overdue' 
              : isDueSoon() 
              ? 'due-soon' 
              : 'normal'
          }`}>
            📅 期限: {formatDueDate(task.dueDate)}
            {isOverdue() && ' (期限切れ)'}
            {isDueSoon() && !isOverdue() && ' (明日まで)'}
          </div>
        )}
        <div className="pulse-micro pulse-task-created">
          作成: {task.createdAt.toLocaleDateString('ja-JP')}
        </div>
      </div>
      <div className="flex pulse-task-actions">
        <button
          onClick={(e) => {
            e.stopPropagation();
            setIsEditing(true);
          }}
          className="pulse-button pulse-button-edit"
        >
          編集
        </button>
        <button
          onClick={(e) => {
            e.stopPropagation();
            handleDelete();
          }}
          className="pulse-button pulse-button-delete"
        >
          削除
        </button>
      </div>
    </div>
  );
};

export default TaskCard;