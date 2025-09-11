import React, { useState, useEffect } from 'react';
import { Box, Text, Button, TextInput, Textarea } from '@primer/react';
import { XIcon, TrashIcon } from '@primer/octicons-react';
import type { Task, Label } from '../types';
import LabelSelector from './LabelSelector';
import ConfirmDialog from './ConfirmDialog';

interface TaskEditDialogProps {
  task: Task | null;
  isOpen: boolean;
  onSave: (updatedTask: Task) => void;
  onDelete: (taskId: string) => void;
  onCancel: () => void;
}

const TaskEditDialog: React.FC<TaskEditDialogProps> = ({ 
  task,
  isOpen, 
  onSave, 
  onDelete,
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  useEffect(() => {
    if (isOpen && task) {
      setTitle(task.title);
      setDescription(task.description || '');
      const dateValue = task.dueDate ? task.dueDate.toISOString().split('T')[0] : '';
      setDueDate(dateValue || '');
      setLabels(task.labels || []);
    }
  }, [isOpen, task]);

  const handleSave = () => {
    if (task && title.trim()) {
      const dueDateObj = dueDate ? new Date(dueDate) : undefined;
      const updatedTask: Task = {
        ...task,
        title: title.trim(),
        description: description.trim() || undefined,
        dueDate: dueDateObj,
        labels,
        updatedAt: new Date()
      };
      onSave(updatedTask);
    }
  };

  const handleDelete = () => {
    setShowDeleteConfirm(true);
  };

  const handleConfirmDelete = () => {
    if (task) {
      onDelete(task.id);
    }
    setShowDeleteConfirm(false);
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen || !task) {
    return null;
  }

  return (
    <>
      <Box
        sx={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          bg: 'primer.canvas.backdrop',
          zIndex: 1000,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center'
        }}
        onClick={onCancel}
      >
        <Box
          sx={{
            bg: 'canvas.default',
            border: '1px solid',
            borderColor: 'border.default',
            borderRadius: 2,
            boxShadow: 'shadow.large',
            p: 4,
            minWidth: '500px',
            maxWidth: '600px',
            maxHeight: '80vh',
            overflowY: 'auto'
          }}
          onClick={(e: React.MouseEvent) => e.stopPropagation()}
        >
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              mb: 3
            }}
          >
            <Text sx={{ fontSize: 2, fontWeight: 'bold' }}>
              タスクを編集
            </Text>
            <Button
              variant="invisible"
              onClick={onCancel}
              sx={{ p: 1 }}
            >
              <XIcon size={16} />
            </Button>
          </Box>

          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3 }}>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
                タイトル
              </Text>
              <TextInput
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="タスクタイトルを入力"
                autoFocus
                sx={{ width: '100%' }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
                説明（任意）
              </Text>
              <Textarea
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                onKeyDown={handleKeyPress}
                placeholder="タスクの説明を入力"
                sx={{ 
                  resize: 'none', 
                  height: '80px',
                  width: '100%'
                }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
                期限（任意）
              </Text>
              <TextInput
                type="date"
                value={dueDate}
                onChange={(e) => setDueDate(e.target.value)}
                onKeyDown={handleKeyPress}
                sx={{ width: '100%' }}
              />
            </Box>

            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
              <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
                ラベル（任意）
              </Text>
              <LabelSelector
                selectedLabels={labels}
                onLabelsChange={setLabels}
              />
            </Box>
          </Box>

          <Box
            sx={{
              display: 'flex',
              justifyContent: 'space-between',
              gap: 2,
              mt: 4
            }}
          >
            <Button
              onClick={handleDelete}
              variant="danger"
              leadingVisual={TrashIcon}
            >
              削除
            </Button>
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={onCancel}
              >
                キャンセル
              </Button>
              <Button
                variant="primary"
                onClick={handleSave}
                disabled={!title.trim()}
                sx={{ 
                  color: 'fg.onEmphasis !important'
                }}
              >
                保存
              </Button>
            </Box>
          </Box>
        </Box>
      </Box>

      <ConfirmDialog
        isOpen={showDeleteConfirm}
        title="タスクを削除"
        message={`「${task?.title}」を削除しますか？この操作は元に戻せません。`}
        onConfirm={handleConfirmDelete}
        onCancel={() => setShowDeleteConfirm(false)}
      />
    </>
  );
};

export default TaskEditDialog;