import { TrashIcon, XIcon, PencilIcon } from '@primer/octicons-react';
import { Button, Box, Heading } from '@primer/react';
import { useEffect, useCallback, useMemo, memo, useRef } from 'react';

import { useTaskActions } from '../hooks/useTaskActions';
import { useTaskColumn } from '../hooks/useTaskColumn';
import type { Task } from '../types';

import ConfirmDialog from './ConfirmDialog';
import SubTaskList from './SubTaskList';
import TaskDisplayContent from './TaskDisplayContent';
import TaskEditDialog from './TaskEditDialog';
import TaskMetadata from './TaskMetadata';

interface TaskDetailSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailSidebar = memo<TaskDetailSidebarProps>(({ task, isOpen, onClose }) => {
  const { columnName } = useTaskColumn(task);
  const {
    showDeleteConfirm,
    showEditDialog,
    setShowDeleteConfirm,
    setShowEditDialog,
    handleEdit,
    handleDelete,
    handleConfirmDelete,
    handleSaveEdit,
    handleDeleteFromDialog,
    handleAddSubTask,
    handleToggleSubTask,
    handleEditSubTask,
    handleDeleteSubTask,
    handleReorderSubTasks
  } = useTaskActions(task, onClose);

  // スクロール位置をリセットするためのref
  const sidebarRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  // イベントハンドラーをメモ化
  const handleEscapeKey = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  const handleEditDialogCancel = useCallback(() => {
    setShowEditDialog(false);
  }, [setShowEditDialog]);

  const handleDeleteConfirmCancel = useCallback(() => {
    setShowDeleteConfirm(false);
  }, [setShowDeleteConfirm]);

  // スタイルオブジェクトをメモ化
  const sidebarStyles = useMemo(() => ({
    position: "fixed" as const,
    top: 0,
    right: 0,
    width: '440px',
    height: '100vh',
    bg: "canvas.default",
    boxShadow: '0 16px 32px rgba(0, 0, 0, 0.24)',
    borderLeft: { md: '1px solid' },
    borderColor: 'border.default',
    zIndex: 1020,
    overflowY: 'auto' as const,
    animation: 'sidebar-slide-in-right 250ms cubic-bezier(0.33, 1, 0.68, 1)'
  }), []);

  const headerStyles = useMemo(() => ({
    display: "flex",
    p: '19px',
    alignItems: "flex-start",
    justifyContent: "space-between",
    borderBottom: "1px solid",
    borderColor: "border.default",
    flexShrink: 0
  }), []);

  const contentStyles = useMemo(() => ({
    flex: "1",
    p: 4,
    overflowY: 'auto' as const
  }), []);

  const actionsStyles = useMemo(() => ({
    p: 4,
    borderTop: '1px solid',
    borderColor: 'border.default',
    flexShrink: 0
  }), []);

  const buttonContainerStyles = useMemo(() => ({
    display: 'flex',
    gap: 2
  }), []);

  const buttonStyles = useMemo(() => ({
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 2
  }), []);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscapeKey);
    }

    return () => {
      document.removeEventListener('keydown', handleEscapeKey);
    };
  }, [isOpen, handleEscapeKey]);

  // タスクが変更された時にスクロール位置をトップにリセット
  useEffect(() => {
    if (isOpen && task) {
      // サイドバー全体とコンテンツ部分の両方をリセット
      if (sidebarRef.current) {
        sidebarRef.current.scrollTop = 0;
      }
      if (contentRef.current) {
        contentRef.current.scrollTop = 0;
      }
    }
  }, [task, isOpen]);

  if (!isOpen || !task) {
    return null;
  }

  return (
    <Box
      ref={sidebarRef}
      sx={sidebarStyles}
      role="dialog"
      aria-label="タスク詳細"
      aria-modal="true"
    >
      <Box sx={{ display: "flex", height: "100%", flexDirection: "column" }}>
        {/* Header */}
        <Box sx={headerStyles}>
          <Heading sx={{ fontSize: 2, margin: 0, pr: 3, wordBreak: 'break-word' }}>
            {task.title}
          </Heading>
          <Button
            onClick={onClose}
            variant="invisible"
            size="small"
            leadingVisual={XIcon}
            aria-label="タスク詳細を閉じる"
            sx={{ flexShrink: 0 }}
          />
        </Box>

        {/* Content */}
        <Box ref={contentRef} sx={contentStyles}>
          <TaskDisplayContent task={task} columnName={columnName} />
          <SubTaskList
            subTasks={task.subTasks ?? []}
            onAddSubTask={handleAddSubTask}
            onToggleSubTask={handleToggleSubTask}
            onEditSubTask={handleEditSubTask}
            onDeleteSubTask={handleDeleteSubTask}
            onReorderSubTasks={handleReorderSubTasks}
          />
          <TaskMetadata task={task} />
        </Box>

        {/* Actions */}
        <Box sx={actionsStyles}>
          <Box sx={buttonContainerStyles}>
            <Button
              onClick={handleEdit}
              variant="primary"
              size="medium"
              leadingVisual={PencilIcon}
              sx={buttonStyles}
            >
              編集
            </Button>
            <Button
              onClick={handleDelete}
              variant="danger"
              size="medium"
              leadingVisual={TrashIcon}
              sx={buttonStyles}
            >
              削除
            </Button>
          </Box>
        </Box>
      </Box>

      <TaskEditDialog
        task={task}
        isOpen={showEditDialog}
        onSave={handleSaveEdit}
        onDelete={handleDeleteFromDialog}
        onCancel={handleEditDialogCancel}
      />

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="タスクを削除"
        message={`「${task.title}」を削除しますか？この操作は元に戻せません。`}
        onConfirm={handleConfirmDelete}
        onCancel={handleDeleteConfirmCancel}
      />
    </Box>
  );
});

export default TaskDetailSidebar;