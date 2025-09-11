import React, { useEffect, useRef } from 'react';
import type { Task } from '../types';
import { useKanban } from '../contexts/KanbanContext';

interface TaskDetailSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailSidebar: React.FC<TaskDetailSidebarProps> = ({ task, isOpen, onClose }) => {
  const sidebarRef = useRef<HTMLDivElement>(null);
  const { deleteTask, state } = useKanban();

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

  const handleDelete = () => {
    if (!task || !state.currentBoard) {
      return;
    }
    
    if (window.confirm('このタスクを削除しますか？')) {
      const column = state.currentBoard.columns.find(col => 
        col.tasks.some(t => t.id === task.id)
      );
      
      if (column) {
        deleteTask(task.id, column.id);
        onClose();
      }
    }
  };

  const isOverdue = () => {
    if (!task?.dueDate) {
      return false;
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    const dueDate = new Date(task.dueDate);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate < today;
  };

  const isDueSoon = () => {
    if (!task?.dueDate) {
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
      year: 'numeric',
      month: 'long',
      day: 'numeric',
      weekday: 'long'
    });
  };

  const formatDateTime = (date: Date) => {
    return date.toLocaleDateString('ja-JP', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  // 常にレンダリングし、CSSでアニメーション制御
  return (
    <div 
      ref={sidebarRef}
      className={`task-detail-sidebar ${isOpen && task ? 'open' : ''}`}
    >
      {task && (
        <>
          <div className="task-detail-header">
            <h2 className="pulse-h4 task-detail-title">{task.title}</h2>
            <button 
              onClick={onClose}
              className="pulse-button pulse-button-close"
              aria-label="詳細を閉じる"
            >
              ×
            </button>
          </div>

          <div className="task-detail-content">
            <div className="task-detail-section">
              <h3 className="pulse-h6 task-detail-section-title">説明</h3>
              <div className="task-detail-description">
                {task.description ? (
                  <p className="pulse-body">{task.description}</p>
                ) : (
                  <p className="pulse-body-sm task-detail-no-description">
                    説明が設定されていません
                  </p>
                )}
              </div>
            </div>

            {task.dueDate && (
              <div className="task-detail-section">
                <h3 className="pulse-h6 task-detail-section-title">期限</h3>
                <div className={`task-detail-due-date ${
                  isOverdue() 
                    ? 'overdue' 
                    : isDueSoon() 
                    ? 'due-soon' 
                    : 'normal'
                }`}>
                  <span className="pulse-body">
                    📅 {formatDueDate(task.dueDate)}
                  </span>
                  {isOverdue() && (
                    <span className="task-detail-status-badge overdue">
                      期限切れ
                    </span>
                  )}
                  {isDueSoon() && !isOverdue() && (
                    <span className="task-detail-status-badge due-soon">
                      明日まで
                    </span>
                  )}
                </div>
              </div>
            )}

            <div className="task-detail-section">
              <h3 className="pulse-h6 task-detail-section-title">作成・更新情報</h3>
              <div className="task-detail-timestamps">
                <div className="task-detail-timestamp">
                  <span className="pulse-caption">作成日時:</span>
                  <span className="pulse-body-sm">{formatDateTime(task.createdAt)}</span>
                </div>
                <div className="task-detail-timestamp">
                  <span className="pulse-caption">更新日時:</span>
                  <span className="pulse-body-sm">{formatDateTime(task.updatedAt)}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="task-detail-actions">
            <button
              onClick={handleDelete}
              className="pulse-button pulse-button-delete task-detail-delete"
            >
              🗑️ タスクを削除
            </button>
          </div>
        </>
      )}
    </div>
  );
};

export default TaskDetailSidebar;