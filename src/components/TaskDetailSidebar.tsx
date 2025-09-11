import React, { useEffect, useState, useCallback } from 'react';
import { Button, Box, Text, Heading, TextInput, Textarea } from '@primer/react';
import { CalendarIcon, TrashIcon, XIcon, PencilIcon } from '@primer/octicons-react';
import type { Task, Label } from '../types';
import { useKanban } from '../contexts/KanbanContext';
import LabelSelector from './LabelSelector';

interface TaskDetailSidebarProps {
  task: Task | null;
  isOpen: boolean;
  onClose: () => void;
}

const TaskDetailSidebar: React.FC<TaskDetailSidebarProps> = ({ task, isOpen, onClose }) => {
  const { deleteTask, updateTask, state } = useKanban();
  const [isEditing, setIsEditing] = useState(false);
  const [editTitle, setEditTitle] = useState('');
  const [editDescription, setEditDescription] = useState('');
  const [editDueDate, setEditDueDate] = useState('');
  const [editLabels, setEditLabels] = useState<Label[]>([]);

  useEffect(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditDueDate(task.dueDate?.toISOString().split('T')[0] || '');
      setEditLabels(task.labels || []);
      setIsEditing(false);
    }
  }, [task]);

  const handleCancelEdit = useCallback(() => {
    if (task) {
      setEditTitle(task.title);
      setEditDescription(task.description || '');
      setEditDueDate(task.dueDate?.toISOString().split('T')[0] || '');
      setEditLabels(task.labels || []);
    }
    setIsEditing(false);
  }, [task]);

  useEffect(() => {
    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        if (isEditing) {
          handleCancelEdit();
        } else {
          onClose();
        }
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose, isEditing, handleCancelEdit]);

  const handleEdit = () => {
    setIsEditing(true);
  };

  const handleSaveEdit = () => {
    if (!task || !state.currentBoard || !editTitle.trim()) {
      return;
    }

    const column = state.currentBoard.columns.find(col => 
      col.tasks.some(t => t.id === task.id)
    );

    if (column) {
      const updatedTask = {
        ...task,
        title: editTitle.trim(),
        description: editDescription.trim() || undefined,
        dueDate: editDueDate ? new Date(editDueDate) : undefined,
        labels: editLabels,
        updatedAt: new Date()
      };

      updateTask(task.id, updatedTask);
      setIsEditing(false);
    }
  };


  const handleDelete = () => {
    if (!task || !state.currentBoard) {
      return;
    }
    
    if (window.confirm('Are you sure you want to delete this task?')) {
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

  const isDueToday = () => {
    if (!task?.dueDate) {
      return false;
    }
    const today = new Date();
    const dueDate = new Date(task.dueDate);
    today.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === today.getTime();
  };

  const isDueTomorrow = () => {
    if (!task?.dueDate) {
      return false;
    }
    const tomorrow = new Date();
    tomorrow.setDate(tomorrow.getDate() + 1);
    const dueDate = new Date(task.dueDate);
    tomorrow.setHours(0, 0, 0, 0);
    dueDate.setHours(0, 0, 0, 0);
    return dueDate.getTime() === tomorrow.getTime();
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

  if (!isOpen || !task) {
    return null;
  }

  return (
    <Box
      sx={{ 
        position: "fixed",
        top: 0,
        right: 0,
        width: "450px",
        height: "100vh",
        bg: "canvas.default",
        boxShadow: '0 16px 32px rgba(0, 0, 0, 0.24)',
        borderLeft: '1px solid',
        borderColor: 'border.default',
        zIndex: 1000,
        overflowY: 'auto'
      }}
    >
      <Box sx={{ display: "flex", height: "100%", flexDirection: "column" }}>
        {/* Header */}
        <Box
          sx={{ 
            display: "flex",
            p: 4,
            alignItems: "center",
            justifyContent: "space-between",
            borderBottom: "1px solid",
            borderColor: "border.default",
            flexShrink: 0 
          }}
        >
          <Heading sx={{ fontSize: 3, margin: 0, pr: 3, wordBreak: 'break-word' }}>
            {task.title}
          </Heading>
          <Button
            onClick={onClose}
            variant="invisible"
            size="small"
            leadingVisual={XIcon}
            aria-label="Close details"
            sx={{ flexShrink: 0 }}
          />
        </Box>

        {/* Content */}
        <Box sx={{ flex: "1", p: 4, overflowY: 'auto' }}>
          {isEditing ? (
            <>
              {/* Edit Form */}
              <Box sx={{ mb: 4 }}>
                <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Title</Heading>
                <TextInput
                  value={editTitle}
                  onChange={(e) => setEditTitle(e.target.value)}
                  placeholder="Task title"
                  sx={{ width: '100%' }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Description</Heading>
                <Textarea
                  value={editDescription}
                  onChange={(e) => setEditDescription(e.target.value)}
                  placeholder="Task description"
                  rows={4}
                  sx={{ width: '100%', resize: 'vertical' }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Due Date</Heading>
                <TextInput
                  type="date"
                  value={editDueDate}
                  onChange={(e) => setEditDueDate(e.target.value)}
                  sx={{ width: '100%' }}
                />
              </Box>

              <Box sx={{ mb: 4 }}>
                <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Labels</Heading>
                <LabelSelector
                  selectedLabels={editLabels}
                  onLabelsChange={setEditLabels}
                />
              </Box>
            </>
          ) : (
            <>
              {/* Display Mode */}
              <Box sx={{ mb: 4 }}>
                <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Description</Heading>
                <Box
                  sx={{
                    p: 3,
                    bg: "canvas.subtle",
                    border: "1px solid",
                    borderRadius: 2,
                    borderColor: "border.default"
                  }}
                >
                  {task.description ? (
                    <Text sx={{ fontSize: 1 }}>{task.description}</Text>
                  ) : (
                    <Text sx={{ fontSize: 1, color: "fg.muted", fontStyle: "italic" }}>
                      No description set
                    </Text>
                  )}
                </Box>
              </Box>

              {task.dueDate && (
                <Box sx={{ mb: 4 }}>
                  <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Due Date</Heading>
                  <Box
                    sx={{
                      p: 3,
                      display: 'flex',
                      alignItems: 'center',
                      gap: 2,
                      bg: isOverdue() 
                        ? 'danger.subtle' 
                        : isDueToday() 
                        ? 'success.subtle'
                        : isDueTomorrow() 
                        ? 'attention.subtle' 
                        : 'canvas.subtle',
                      borderRadius: 2,
                      border: '1px solid',
                      borderColor: isOverdue() 
                        ? 'danger.emphasis' 
                        : isDueToday() 
                        ? 'success.emphasis'
                        : isDueTomorrow() 
                        ? 'attention.emphasis' 
                        : 'border.default'
                    }}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, flex: 1 }}>
                      <CalendarIcon size={16} />
                      <Text sx={{ fontSize: 1 }}>{formatDueDate(task.dueDate)}</Text>
                    </Box>
                    {isOverdue() && (
                      <Text
                        sx={{
                          fontSize: 0,
                          fontWeight: "bold",
                          color: "#ffffff",
                          bg: "danger.emphasis",
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em'
                        }}
                      >
                        Overdue
                      </Text>
                    )}
                    {isDueToday() && !isOverdue() && (
                      <Text
                        sx={{
                          fontSize: 0,
                          fontWeight: "bold",
                          color: "#ffffff",
                          bg: "success.emphasis",
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em'
                        }}
                      >
                        Due Today
                      </Text>
                    )}
                    {isDueTomorrow() && !isOverdue() && !isDueToday() && (
                      <Text
                        sx={{
                          fontSize: 0,
                          fontWeight: "bold",
                          color: "#ffffff",
                          bg: "attention.emphasis",
                          px: 2,
                          py: 1,
                          borderRadius: 2,
                          textTransform: 'uppercase',
                          letterSpacing: '0.025em'
                        }}
                      >
                        Due Tomorrow
                      </Text>
                    )}
                  </Box>
                </Box>
              )}

              {task.labels && task.labels.length > 0 && (
                <Box sx={{ mb: 4 }}>
                  <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Labels</Heading>
                  <Box sx={{ display: 'flex', flexWrap: 'wrap', gap: 2 }}>
                    {task.labels.map((label) => {
                      const getVariantColors = (variant: string) => {
                        switch (variant) {
                          case 'primary':
                            return { bg: 'accent.emphasis', color: 'fg.onEmphasis' };
                          case 'secondary':
                            return { bg: 'neutral.emphasis', color: 'fg.onEmphasis' };
                          case 'accent':
                            return { bg: 'accent.emphasis', color: 'fg.onEmphasis' };
                          case 'success':
                            return { bg: 'success.emphasis', color: 'fg.onEmphasis' };
                          case 'attention':
                            return { bg: 'attention.emphasis', color: 'fg.onEmphasis' };
                          case 'severe':
                            return { bg: 'severe.emphasis', color: 'fg.onEmphasis' };
                          case 'danger':
                            return { bg: 'danger.emphasis', color: 'fg.onEmphasis' };
                          case 'done':
                            return { bg: 'done.emphasis', color: 'fg.onEmphasis' };
                          case 'sponsors':
                            return { bg: 'sponsors.emphasis', color: 'fg.onEmphasis' };
                          default:
                            return { bg: 'neutral.emphasis', color: 'fg.onEmphasis' };
                        }
                      };
                      
                      const colors = getVariantColors(label.color);
                      
                      return (
                        <Box
                          key={label.id}
                          sx={{
                            display: 'inline-flex',
                            alignItems: 'center',
                            bg: colors.bg,
                            color: colors.color,
                            px: 2,
                            py: 1,
                            borderRadius: 2,
                            fontSize: 0,
                            fontWeight: '500'
                          }}
                        >
                          {label.name}
                        </Box>
                      );
                    })}
                  </Box>
                </Box>
              )}

              <Box sx={{ mb: 4 }}>
                <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: 'bold' }}>Created/Updated Info</Heading>
                <Box
                  sx={{
                    p: 3,
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 2,
                    bg: 'canvas.subtle',
                    borderRadius: 2,
                    border: '1px solid',
                    borderColor: 'border.default'
                  }}
                >
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text sx={{ fontSize: 0, color: "fg.muted" }}>Created At:</Text>
                    <Text sx={{ fontSize: 1 }}>{formatDateTime(task.createdAt)}</Text>
                  </Box>
                  <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <Text sx={{ fontSize: 0, color: "fg.muted" }}>Updated At:</Text>
                    <Text sx={{ fontSize: 1 }}>{formatDateTime(task.updatedAt)}</Text>
                  </Box>
                </Box>
              </Box>
            </>
          )}
        </Box>

        {/* Actions */}
        <Box
          sx={{
            p: 4,
            borderTop: '1px solid',
            borderColor: 'border.default',
            flexShrink: 0
          }}
        >
          {isEditing ? (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={handleSaveEdit}
                variant="primary"
                size="medium"
                sx={{ flex: 1 }}
                disabled={!editTitle.trim()}
              >
                Save
              </Button>
              <Button
                onClick={handleCancelEdit}
                size="medium"
                sx={{ flex: 1 }}
              >
                Cancel
              </Button>
            </Box>
          ) : (
            <Box sx={{ display: 'flex', gap: 2 }}>
              <Button
                onClick={handleEdit}
                size="medium"
                leadingVisual={PencilIcon}
                sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}
              >
                Edit Task
              </Button>
              <Button
                onClick={handleDelete}
                variant="danger"
                size="medium"
                leadingVisual={TrashIcon}
                sx={{ width: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 2 }}
              >
                Delete Task
              </Button>
            </Box>
          )}
        </Box>
      </Box>
    </Box>
  );
};

export default TaskDetailSidebar;