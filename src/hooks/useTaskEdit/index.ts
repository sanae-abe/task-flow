/**
 * Modular useTaskEdit hook
 *
 * This is the main export that combines all split hooks into a unified interface.
 * This provides the same API as the original monolithic hook while using
 * modular components internally for better maintainability.
 */

import type { Task } from '../../types';
import { useTaskFormState } from './useTaskFormState';
import { useTaskInitialization } from './useTaskInitialization';
import { useTaskValidation } from './useTaskValidation';
import { useTaskHandlers } from './useTaskHandlers';
import { useTaskColumnSync } from './useTaskColumnSync';

export interface UseTaskEditProps {
  task: Task | null;
  isOpen: boolean;
  onSave: (task: Task) => void;
  onDelete: (taskId: string) => void;
  onCancel: () => void;
}

export interface UseTaskEditReturn {
  // Form fields
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;
  dueDate: string;
  setDueDate: (date: string | null) => void;
  dueTime: string;
  setDueTime: (value: string) => void;
  hasTime: boolean;
  setHasTime: (value: boolean) => void;
  completedAt: string;
  setCompletedAt: (value: string) => void;

  // Complex fields
  labels: import('../../types').Label[];
  setLabels: (labels: import('../../types').Label[]) => void;
  attachments: import('../../types').FileAttachment[];
  setAttachments: (attachments: import('../../types').FileAttachment[]) => void;
  columnId: string;
  setColumnId: (value: string) => void;
  recurrence: import('../../types').RecurrenceConfig | undefined;
  setRecurrence: (recurrence: import('../../types').RecurrenceConfig | undefined) => void;
  priority: import('../../types').Priority | undefined;
  setPriority: (priority: import('../../types').Priority | undefined) => void;

  // Dialog state
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;

  // Computed values
  isCompleted: boolean;
  statusOptions: Array<{ value: string; label: string }>;

  // Validation
  isValid: boolean;

  // Event handlers
  handleSave: () => void;
  handleDelete: () => void;
  handleConfirmDelete: () => void;
  handleKeyPress: (event: React.KeyboardEvent) => void;
}

export const useTaskEdit = ({
  task,
  isOpen,
  onSave,
  onDelete,
  onCancel,
}: UseTaskEditProps): UseTaskEditReturn => {
  // Form state management
  const formState = useTaskFormState();

  // Task initialization logic
  useTaskInitialization({
    task,
    isOpen,
    formState,
  });

  // Validation logic
  const { isValid } = useTaskValidation({
    formState,
  });

  // Event handlers
  const {
    handleSave,
    handleDelete,
    handleConfirmDelete,
    handleKeyPress,
    handleSetDueDate,
  } = useTaskHandlers({
    task,
    formState,
    onSave,
    onDelete,
    onCancel,
  });

  // Column synchronization and status management
  const { isCompleted, statusOptions } = useTaskColumnSync({
    task,
    isOpen,
    formState,
  });

  return {
    // Form fields
    title: formState.title,
    setTitle: formState.setTitle,
    description: formState.description,
    setDescription: formState.setDescription,
    dueDate: formState.dueDate,
    setDueDate: handleSetDueDate,
    dueTime: formState.dueTime,
    setDueTime: formState.setDueTime,
    hasTime: formState.hasTime,
    setHasTime: formState.setHasTime,
    completedAt: formState.completedAt,
    setCompletedAt: formState.setCompletedAt,

    // Complex fields
    labels: formState.labels,
    setLabels: formState.setLabels,
    attachments: formState.attachments,
    setAttachments: formState.setAttachments,
    columnId: formState.columnId,
    setColumnId: formState.setColumnId,
    recurrence: formState.recurrence,
    setRecurrence: formState.setRecurrence,
    priority: formState.priority,
    setPriority: formState.setPriority,

    // Dialog state
    showDeleteConfirm: formState.showDeleteConfirm,
    setShowDeleteConfirm: formState.setShowDeleteConfirm,

    // Computed values
    isCompleted,
    statusOptions,

    // Validation
    isValid,

    // Event handlers
    handleSave,
    handleDelete,
    handleConfirmDelete,
    handleKeyPress,
  };
};

// Note: Types are already exported above in the interface definitions