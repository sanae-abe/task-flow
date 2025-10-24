import { memo } from 'react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import type { TaskTemplate } from '../../types/template';
import { useKanban } from '../../contexts/KanbanContext';
import { useNotify } from '../../contexts/NotificationContext';
import UnifiedDialog from '../shared/Dialog/UnifiedDialog';

// カスタムフック
import { useTaskForm, useTemplateSelection, useTaskSubmission } from './hooks';

// コンポーネント
import { TemplateSelector, TaskFormFields } from './components';

/**
 * タスク作成ダイアログコンポーネント
 *
 * タスクの新規作成機能を提供します：
 * - 通常作成モード：フォームから手動でタスクを作成
 * - テンプレート作成モード：事前定義されたテンプレートから作成
 *
 * モジュラー化により以下の責任分離を実現：
 * - useTaskForm：フォーム状態管理
 * - useTemplateSelection：テンプレート選択管理
 * - useTaskSubmission：保存・送信処理
 * - TemplateSelector：テンプレート選択UI
 * - TaskFormFields：フォームフィールド群
 */
const TaskCreateDialog = memo(() => {
  const { state, closeTaskForm, createTask } = useKanban();
  const notify = useNotify();

  // カスタムフック: フォーム状態管理
  const { formState, formActions, handleTimeChange, isFormValid } = useTaskForm(
    state.isTaskFormOpen,
    state.taskFormDefaultDate ? state.taskFormDefaultDate.toISOString().split('T')[0] : undefined
  );

  // カスタムフック: テンプレート選択管理
  const { templateState, templateActions, resetTemplateSelection } = useTemplateSelection(
    state.isTaskFormOpen,
    formActions
  );

  // カスタムフック: タスク保存・送信処理
  const { handleKeyPress, actions } = useTaskSubmission(
    formState,
    templateState.selectedTemplate,
    isFormValid,
    createTask,
    closeTaskForm,
    notify,
    state.currentBoard,
    state.taskFormDefaultStatus
  );

  // テンプレート選択時の処理
  const handleTemplateSelect = (template: TaskTemplate) => {
    templateActions.handleTemplateSelect(template);
  };

  // ダイアログが閉じられた時の追加処理
  const handleDialogClose = () => {
    resetTemplateSelection();
    closeTaskForm();
  };

  // 早期リターン：ダイアログが開いていない場合
  if (!state.isTaskFormOpen || !state.currentBoard) {
    return null;
  }

  return (
    <UnifiedDialog
      variant="modal"
      isOpen={state.isTaskFormOpen}
      title="新しいタスクを作成"
      onClose={handleDialogClose}
      ariaLabelledBy="task-create-dialog-title"
      size="large"
      actions={actions}
    >
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
        <Tabs defaultValue="normal" className="w-full">
          {/* タブナビゲーション */}
          <TabsList className="grid w-full grid-cols-2 mb-4">
            <TabsTrigger value="normal">通常作成</TabsTrigger>
            <TabsTrigger value="template">テンプレートから作成</TabsTrigger>
          </TabsList>

          {/* 通常作成フォーム */}
          <TabsContent value="normal">
            <TaskFormFields
              formState={formState}
              formActions={formActions}
              selectedTemplate={templateState.selectedTemplate}
              onTimeChange={handleTimeChange}
              onKeyPress={handleKeyPress}
            />
          </TabsContent>

          {/* テンプレート選択モード */}
          <TabsContent value="template">
            <div style={{ marginBottom: '24px', flex: 1, minHeight: '500px' }}>
              <TemplateSelector
                templates={templateState.templates}
                onSelect={handleTemplateSelect}
              />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </UnifiedDialog>
  );
});

TaskCreateDialog.displayName = 'TaskCreateDialog';

export default TaskCreateDialog;