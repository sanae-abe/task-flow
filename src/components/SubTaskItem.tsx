import { TrashIcon, CheckCircleIcon, CheckCircleFillIcon, PencilIcon, CheckIcon, XIcon } from '@primer/octicons-react';
import { Box, Text, TextInput } from '@primer/react';
import React, { useState, useRef, useEffect } from 'react';

import type { SubTask } from '../types';
import IconButton from './shared/IconButton';

interface SubTaskItemProps {
  subTask: SubTask;
  onToggle: (subTaskId: string) => void;
  onEdit: (subTaskId: string, newTitle: string) => void;
  onDelete: (subTaskId: string) => void;
}

const SubTaskItem: React.FC<SubTaskItemProps> = ({
  subTask,
  onToggle,
  onEdit,
  onDelete
}) => {
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState(subTask.title);
  const inputRef = useRef<HTMLInputElement>(null);
  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    onToggle(subTask.id);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(subTask.id);
  };

  const handleEdit = (event: React.MouseEvent) => {
    event.stopPropagation();
    setIsEditing(true);
    setEditTitle(subTask.title);
  };

  const handleSaveEdit = () => {
    const trimmedTitle = editTitle.trim();
    if (trimmedTitle && trimmedTitle !== subTask.title) {
      onEdit(subTask.id, trimmedTitle);
    }
    setIsEditing(false);
  };

  const handleCancelEdit = () => {
    setIsEditing(false);
    setEditTitle(subTask.title);
  };

  const handleKeyDown = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSaveEdit();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      handleCancelEdit();
    }
  };

  // 編集モードに入ったときにフォーカスを当てる
  useEffect(() => {
    if (isEditing && inputRef.current) {
      inputRef.current.focus();
      inputRef.current.select();
    }
  }, [isEditing]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        bg: 'canvas.default',
        cursor: 'pointer',
        position: 'relative',
        '&:hover': {
          bg: 'canvas.subtle'
        },
        '&:hover .action-buttons': {
          opacity: '1 !important'
        }
      }}
    >
      <IconButton
        icon={subTask.completed ? CheckCircleFillIcon : CheckCircleIcon}
        onClick={handleToggle}
        ariaLabel={`${subTask.title}を${subTask.completed ? '未完了' : '完了'}にする`}
        variant="success"
        size="small"
        stopPropagation
        sx={{
          '&:hover': {
            bg: 'transparent',
          }
        }}
      />

      {isEditing ? (
        <>
          <TextInput
            ref={inputRef}
            value={editTitle}
            onChange={(e) => setEditTitle(e.target.value)}
            onKeyDown={handleKeyDown}
            sx={{
              flex: 1,
              fontSize: 1,
              px: 2,
              py: 1
            }}
            size="small"
          />
          <Box
            sx={{
              display: 'flex',
              gap: 1,
              opacity: 1
            }}
          >
            <IconButton
              icon={CheckIcon}
              onClick={handleSaveEdit}
              ariaLabel="編集を保存"
              size="small"
              stopPropagation
              sx={{
                color: 'success.fg',
                '&:hover': {
                  bg: 'transparent',
                  color: 'success.emphasis'
                }
              }}
            />
            <IconButton
              icon={XIcon}
              onClick={handleCancelEdit}
              ariaLabel="編集をキャンセル"
              size="small"
              stopPropagation
              sx={{
                color: 'fg.muted',
                '&:hover': {
                  bg: 'transparent',
                  color: 'danger.fg'
                }
              }}
            />
          </Box>
        </>
      ) : (
        <>
          <Text
            sx={{
              flex: 1,
              textDecoration: 'none',
              opacity: subTask.completed ? 0.6 : 1,
              fontSize: 1
            }}
          >
            {subTask.title}
          </Text>
          <Box
            className="action-buttons"
            sx={{
              display: 'flex',
              gap: 1,
              opacity: 0,
              transition: 'opacity 0.2s ease'
            }}
          >
            <IconButton
              icon={PencilIcon}
              onClick={handleEdit}
              ariaLabel={`${subTask.title}を編集`}
              size="small"
              stopPropagation
              sx={{
                color: 'fg.muted',
                '&:hover': {
                  bg: 'transparent',
                  color: 'accent.fg'
                }
              }}
            />
            <IconButton
              icon={TrashIcon}
              onClick={handleDelete}
              ariaLabel={`${subTask.title}を削除`}
              size="small"
              stopPropagation
              sx={{
                color: 'fg.muted',
                '&:hover': {
                  bg: 'transparent',
                  color: 'danger.fg'
                }
              }}
            />
          </Box>
        </>
      )}
    </Box>
  );
};

export default SubTaskItem;