/**
 * Task form state management hook
 *
 * This hook manages the form state for task editing including
 * title, description, dates, labels, and other form fields.
 */

import React, { useState } from 'react';
import type { Label, FileAttachment, RecurrenceConfig, Priority } from '../../types';

export interface UseTaskFormStateReturn {
  // Basic form fields
  title: string;
  setTitle: (value: string) => void;
  description: string;
  setDescription: (value: string) => void;

  // Date and time fields
  dueDate: string;
  setDueDate: (value: string) => void;
  dueTime: string;
  setDueTime: (value: string) => void;
  hasTime: boolean;
  setHasTime: (value: boolean) => void;
  completedAt: string;
  setCompletedAt: React.Dispatch<React.SetStateAction<string>>;

  // Complex fields
  labels: Label[];
  setLabels: (labels: Label[]) => void;
  attachments: FileAttachment[];
  setAttachments: (attachments: FileAttachment[]) => void;
  columnId: string;
  setColumnId: (value: string) => void;
  recurrence: RecurrenceConfig | undefined;
  setRecurrence: React.Dispatch<React.SetStateAction<RecurrenceConfig | undefined>>;
  priority: Priority | undefined;
  setPriority: (priority: Priority | undefined) => void;

  // Dialog state
  showDeleteConfirm: boolean;
  setShowDeleteConfirm: (show: boolean) => void;

  // Utility functions
  resetFormState: () => void;
}

export const useTaskFormState = (): UseTaskFormStateReturn => {
  // Basic form state
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");

  // Date and time state
  const [dueDate, setDueDate] = useState("");
  const [dueTime, setDueTime] = useState("");
  const [hasTime, setHasTime] = useState(false);
  const [completedAt, setCompletedAt] = useState("");

  // Complex form state
  const [labels, setLabels] = useState<Label[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [columnId, setColumnIdState] = useState("");
  const [recurrence, setRecurrence] = useState<RecurrenceConfig | undefined>(undefined);
  const [priority, setPriority] = useState<Priority | undefined>(undefined);

  // Wrapper for setColumnId
  const setColumnId = (value: string) => {
    setColumnIdState(value);
  };

  // Dialog state
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);

  // Reset all form state to initial values
  const resetFormState = () => {
    setTitle("");
    setDescription("");
    setDueDate("");
    setDueTime("");
    setHasTime(false);
    setCompletedAt("");
    setLabels([]);
    setAttachments([]);
    setRecurrence(undefined);
    setPriority(undefined);
    setColumnIdState("");
    setShowDeleteConfirm(false);
  };

  return {
    // Basic form fields
    title,
    setTitle,
    description,
    setDescription,

    // Date and time fields
    dueDate,
    setDueDate,
    dueTime,
    setDueTime,
    hasTime,
    setHasTime,
    completedAt,
    setCompletedAt,

    // Complex fields
    labels,
    setLabels,
    attachments,
    setAttachments,
    columnId,
    setColumnId,
    recurrence,
    setRecurrence,
    priority,
    setPriority,

    // Dialog state
    showDeleteConfirm,
    setShowDeleteConfirm,

    // Utility functions
    resetFormState,
  };
};