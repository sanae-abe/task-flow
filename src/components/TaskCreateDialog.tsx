import React, { useState, useEffect } from 'react';
import { Box, Text, Button, TextInput, Textarea } from '@primer/react';
import { XIcon } from '@primer/octicons-react';
import type { Label } from '../types';
import LabelSelector from './LabelSelector';

interface TaskCreateDialogProps {
  isOpen: boolean;
  onSave: (title: string, description: string, dueDate?: Date, labels?: Label[]) => void;
  onCancel: () => void;
}

const TaskCreateDialog: React.FC<TaskCreateDialogProps> = ({ 
  isOpen, 
  onSave, 
  onCancel 
}) => {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [labels, setLabels] = useState<Label[]>([]);

  useEffect(() => {
    if (isOpen) {
      setTitle('');
      setDescription('');
      setDueDate('');
      setLabels([]);
    }
  }, [isOpen]);

  const handleSave = () => {
    if (title.trim()) {
      const dueDateObj = dueDate ? new Date(dueDate) : undefined;
      onSave(title.trim(), description.trim(), dueDateObj, labels);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
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
            新しいタスクを追加
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
            justifyContent: 'flex-end',
            gap: 2,
            mt: 4
          }}
        >
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
            追加
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default TaskCreateDialog;