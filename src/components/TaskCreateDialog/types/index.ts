import type {
  Label as LabelType,
  FileAttachment,
  RecurrenceConfig,
  Priority,
} from '../../../types';
import type { TaskTemplate } from '../../../types/template';

/**
 * タスク作成モード
 */
export type CreateMode = 'normal' | 'template';

/**
 * タスクフォームの状態
 */
export interface TaskFormState {
  title: string;
  description: string;
  dueDate: string;
  dueTime: string;
  hasTime: boolean;
  labels: LabelType[];
  attachments: FileAttachment[];
  recurrence: RecurrenceConfig | undefined;
  priority: Priority | undefined;
  selectedBoardId: string | undefined;
}

/**
 * テンプレート選択関連の状態
 */
export interface TemplateState {
  templates: TaskTemplate[];
  selectedTemplate: TaskTemplate | undefined;
}

/**
 * タスクフォームのアクション
 */
export interface TaskFormActions {
  setTitle: (title: string) => void;
  setDescription: (description: string) => void;
  setDueDate: (date: string | null) => void;
  setDueTime: (time: string) => void;
  setHasTime: (hasTime: boolean) => void;
  setLabels: (labels: LabelType[]) => void;
  setAttachments: (attachments: FileAttachment[]) => void;
  setRecurrence: (recurrence: RecurrenceConfig | undefined) => void;
  setPriority: (priority: Priority | undefined) => void;
  setSelectedBoardId: (boardId: string | undefined) => void;
  resetForm: () => void;
}

/**
 * テンプレート選択関連のアクション
 */
export interface TemplateActions {
  setTemplates: (templates: TaskTemplate[]) => void;
  setSelectedTemplate: (template: TaskTemplate | undefined) => void;
  handleTemplateSelect: (template: TaskTemplate) => void;
  loadTemplates: () => void;
}

/**
 * TemplateSelectorコンポーネントのProps
 */
export interface TemplateSelectorProps {
  templates: TaskTemplate[];
  onSelect: (template: TaskTemplate) => void;
}

/**
 * TaskCreateFormコンポーネントのProps
 */
export interface TaskCreateFormProps {
  formState: TaskFormState;
  formActions: TaskFormActions;
  selectedTemplate?: TaskTemplate;
  onTimeChange: (hasTime: boolean, time: string) => void;
  onKeyPress: (event: React.KeyboardEvent) => void;
  availableBoards?: Array<{ id: string; title: string }>;
}
