import React, { useState } from 'react';
import { Box, Text, Button, TextInput, IconButton } from '@primer/react';
import { PlusIcon, TrashIcon, CheckCircleIcon, CheckCircleFillIcon } from '@primer/octicons-react';
import type { SubTask } from '../types';

interface SubTaskListProps {
  subTasks: SubTask[];
  onAddSubTask: (title: string) => void;
  onToggleSubTask: (subTaskId: string) => void;
  onDeleteSubTask: (subTaskId: string) => void;
}

const SubTaskList: React.FC<SubTaskListProps> = ({
  subTasks,
  onAddSubTask,
  onToggleSubTask,
  onDeleteSubTask
}) => {
  const [isAdding, setIsAdding] = useState(false);
  const [newSubTaskTitle, setNewSubTaskTitle] = useState('');

  const handleAddSubTask = () => {
    if (newSubTaskTitle.trim()) {
      onAddSubTask(newSubTaskTitle.trim());
      setNewSubTaskTitle('');
      setIsAdding(false);
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleAddSubTask();
    } else if (event.key === 'Escape') {
      setNewSubTaskTitle('');
      setIsAdding(false);
    }
  };

  const completedCount = subTasks.filter(task => task.completed).length;
  const totalCount = subTasks.length;

  return (
    <Box sx={{ mb: 4 }}>
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', mb: 2 }}>
        <Text sx={{ fontSize: 1, fontWeight: 'bold' }}>
          サブタスク {totalCount > 0 && `(${completedCount}/${totalCount})`}
        </Text>
        {!isAdding && (
          <Button
            onClick={() => setIsAdding(true)}
            variant="invisible"
            size="small"
            leadingVisual={PlusIcon}
            aria-label="サブタスクを追加"
          >
            追加
          </Button>
        )}
      </Box>

      {/* 進捗バー */}
      {totalCount > 0 && (
        <Box sx={{ mb: 2 }}>
          <Box
            sx={{
              width: '100%',
              height: '6px',
              bg: 'neutral.muted',
              borderRadius: '3px',
              overflow: 'hidden',
            }}
          >
            <Box
              sx={{
                width: `${totalCount > 0 ? (completedCount / totalCount) * 100 : 0}%`,
                height: '100%',
                bg: 'success.emphasis',
                transition: 'width 0.2s ease'
              }}
            />
          </Box>
        </Box>
      )}

      {/* サブタスクリスト */}
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
        {subTasks.map((subTask) => (
          <Box
            key={subTask.id}
            onClick={() => onToggleSubTask(subTask.id)}
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: 2,
              bg: 'canvas.default',
              cursor: 'pointer',
            }}
          >
            <IconButton
              aria-label={`${subTask.title}を${subTask.completed ? '未完了' : '完了'}にする`}
              icon={subTask.completed ? CheckCircleFillIcon : CheckCircleIcon}
              size="small"
              variant="invisible"
              sx={{
                color: 'success.fg',
                '&:hover': {
                  bg: 'transparent',
                }
              }}
            />
            <Text
              sx={{
                flex: 1,
                textDecoration: subTask.completed ? 'line-through' : 'none',
                opacity: subTask.completed ? 0.6 : 1,
                fontSize: 1
              }}
            >
              {subTask.title}
            </Text>
            <IconButton
              onClick={() => onDeleteSubTask(subTask.id)}
              variant="invisible"
              size="small"
              icon={TrashIcon}
              aria-label={`${subTask.title}を削除`}
              sx={{ 
                color: 'danger.fg',
                '&:hover': {
                  bg: 'transparent',
                  color: 'danger.fg'
                }
              }}
            />
          </Box>
        ))}

        {/* 新しいサブタスク追加フォーム */}
        {isAdding && (
          <Box
            sx={{
              display: 'flex',
              alignItems: 'center',
              gap: 2,
              borderRadius: 2,
              bg: 'canvas.default'
            }}
          >
            <TextInput
              value={newSubTaskTitle}
              onChange={(e) => setNewSubTaskTitle(e.target.value)}
              onKeyDown={handleKeyPress}
              placeholder="サブタスク名を入力..."
              autoFocus
              sx={{ flex: 1 }}
            />
            <Button
              onClick={handleAddSubTask}
              variant="primary"
              size="small"
              disabled={!newSubTaskTitle.trim()}
            >
              追加
            </Button>
            <Button
              onClick={() => {
                setNewSubTaskTitle('');
                setIsAdding(false);
              }}
              size="small"
            >
              キャンセル
            </Button>
          </Box>
        )}
      </Box>
    </Box>
  );
};

export default SubTaskList;