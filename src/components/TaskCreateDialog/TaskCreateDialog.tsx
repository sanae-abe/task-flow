import { memo, useMemo, useCallback, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';

import type { TaskTemplate } from '../../types/template';
import { useKanban } from '../../contexts/KanbanContext';
import { useBoard } from '../../contexts/BoardContext';
import { useSonnerNotify } from '../../hooks/useSonnerNotify';
import { useFormChangeDetector } from '../../hooks/useFormChangeDetector';
import UnifiedDialog from '../shared/Dialog/UnifiedDialog';
import ConfirmDialog from '../ConfirmDialog';

// カスタムフック
import { useTaskForm, useTemplateSelection, useTaskSubmission } from './hooks';

// コンポーネント
import { TemplateSelector, TaskCreateForm } from './components';

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
 * - TaskCreateForm：フォームフィールド群
 */
const TaskCreateDialog = memo(() => {
  const { t } = useTranslation();
  const { state, closeTaskForm, createTask } = useKanban();
  const { state: boardState, setCurrentBoard } = useBoard();
  const notify = useSonnerNotify();

  // タブ状態管理
  const [activeTab, setActiveTab] = useState<string>('normal');

  // カスタムフック: フォーム状態管理
  const { formState, formActions, handleTimeChange, isFormValid } = useTaskForm(
    state.isTaskFormOpen,
    state.taskFormDefaultDate
      ? state.taskFormDefaultDate.toISOString().split('T')[0]
      : undefined,
    state.currentBoard?.id
  );

  // カスタムフック: テンプレート選択管理
  const { templateState, templateActions, resetTemplateSelection } =
    useTemplateSelection(state.isTaskFormOpen, formActions);

  // カスタムフック: タスク保存・送信処理
  const { handleKeyPress, actions } = useTaskSubmission(
    formState,
    templateState.selectedTemplate,
    isFormValid,
    createTask,
    closeTaskForm,
    notify,
    state.currentBoard,
    state.taskFormDefaultStatus,
    boardState.boards,
    setCurrentBoard
  );

  // フォーム変更検知のためのデータ
  const formDataForDetection = useMemo(
    () => ({
      title: formState.title,
      description: formState.description,
      dueDate: formState.dueDate,
      dueTime: formState.dueTime,
      hasTime: formState.hasTime,
      labels: formState.labels,
      attachments: formState.attachments,
      recurrence: formState.recurrence,
      priority: formState.priority,
      selectedTemplate: templateState.selectedTemplate,
      selectedBoardId: formState.selectedBoardId,
    }),
    [
      formState.title,
      formState.description,
      formState.dueDate,
      formState.dueTime,
      formState.hasTime,
      formState.labels,
      formState.attachments,
      formState.recurrence,
      formState.priority,
      formState.selectedBoardId,
      templateState.selectedTemplate,
    ]
  );

  // フォーム変更検知
  const {
    showCloseConfirm,
    handleClose,
    handleConfirmClose,
    handleCancelClose,
  } = useFormChangeDetector(formDataForDetection, state.isTaskFormOpen);

  // テンプレート選択時の処理
  const handleTemplateSelect = (template: TaskTemplate) => {
    templateActions.handleTemplateSelect(template);
    // テンプレート選択後、通常作成タブに自動切り替え
    setActiveTab('normal');
  };

  // ダイアログが閉じられた時の処理（確認機能付き）
  const handleDialogClose = useCallback(() => {
    const closeAction = () => {
      resetTemplateSelection();
      setActiveTab('normal'); // タブを通常作成にリセット
      closeTaskForm();
    };
    handleClose(closeAction);
  }, [handleClose, resetTemplateSelection, closeTaskForm]);

  // 利用可能なボード一覧（現在のボード以外）
  const availableBoards = useMemo(
    () =>
      boardState.boards.map(board => ({
        id: board.id,
        title: board.title,
      })),
    [boardState.boards]
  );

  // 早期リターン：ダイアログが開いていない場合
  if (!state.isTaskFormOpen || !state.currentBoard) {
    return null;
  }

  return (
    <>
      <UnifiedDialog
        variant='modal'
        isOpen={state.isTaskFormOpen}
        title={t('task.createTask')}
        onClose={handleDialogClose}
        ariaLabelledBy='task-create-dialog-title'
        size='large'
        actions={actions}
      >
        <div className='flex flex-col min-w-[600px]'>
          <Tabs
            value={activeTab}
            onValueChange={setActiveTab}
            className='w-full'
          >
            {/* タブナビゲーション */}
            <TabsList className='grid w-full grid-cols-2 mb-4'>
              <TabsTrigger value='normal'>{t('template.createNormal')}</TabsTrigger>
              <TabsTrigger value='template'>{t('template.createFromTemplate')}</TabsTrigger>
            </TabsList>

            {/* 通常作成フォーム */}
            <TabsContent value='normal'>
              <TaskCreateForm
                formState={formState}
                formActions={formActions}
                selectedTemplate={templateState.selectedTemplate}
                onTimeChange={handleTimeChange}
                onKeyPress={handleKeyPress}
                availableBoards={availableBoards}
              />
            </TabsContent>

            {/* テンプレート選択モード */}
            <TabsContent value='template'>
              <div className='mb-6 flex-1 min-h-[500px]'>
                <TemplateSelector
                  templates={templateState.templates}
                  onSelect={handleTemplateSelect}
                />
              </div>
            </TabsContent>
          </Tabs>
        </div>
      </UnifiedDialog>

      <ConfirmDialog
        isOpen={showCloseConfirm}
        title={t('common.discardChanges')}
        message={t('common.discardChangesMessage')}
        confirmText={t('common.discard')}
        cancelText={t('common.back')}
        onConfirm={handleConfirmClose}
        onCancel={handleCancelClose}
      />
    </>
  );
});

TaskCreateDialog.displayName = 'TaskCreateDialog';

export default TaskCreateDialog;
