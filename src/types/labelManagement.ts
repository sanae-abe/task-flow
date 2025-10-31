import type { Label } from './index';

export type SortField = 'name' | 'boardName' | 'usageCount';
export type SortDirection = 'asc' | 'desc';

export interface LabelWithInfo extends Label {
  boardName: string;
  boardId: string;
  usageCount: number;
}

export interface EditDialogState {
  isOpen: boolean;
  label: (Label & { boardName: string; boardId: string }) | null;
  mode: 'create' | 'edit';
}

export interface DeleteDialogState {
  isOpen: boolean;
  label: (Label & { boardName: string; boardId: string }) | null;
}

export interface LabelFormData {
  name: string;
  color: string;
  boardId?: string;
}
