import { useCallback, useMemo } from 'react';
import type { TaskFormState } from '../types';
import type { TaskTemplate } from '../../../types/template';
import type { DialogAction } from '../../../types/unified-dialog';
import type { KanbanBoard } from '../../../types';

// Notification function type
type NotifyFunction = {
  success: (message: string) => void;
  error: (message: string) => void;
};

// CreateTask function type
type CreateTaskFunction = (
  columnId: string,
  title: string,
  description: string,
  dueDate?: Date,
  labels?: import('../../../types').Label[],
  attachments?: import('../../../types').FileAttachment[],
  recurrence?: import('../../../types').RecurrenceConfig,
  priority?: import('../../../types').Priority
) => void;

/**
 * タスク保存・送信処理管理カスタムフック
 *
 * タスク作成時の保存処理、バリデーション、ダイアログアクションを管理します。
 */
export const useTaskSubmission = (
  formState: TaskFormState,
  selectedTemplate: TaskTemplate | undefined,
  isFormValid: boolean,
  createTask: CreateTaskFunction,
  closeTaskForm: () => void,
  notify: NotifyFunction,
  currentBoard: KanbanBoard | null,
  taskFormDefaultStatus?: string,
  availableBoards?: KanbanBoard[],
  setCurrentBoard?: (boardId: string) => void
) => {
  // タスク保存処理
  const handleSave = useCallback(() => {
    if (!formState.title.trim()) {
      return;
    }

    // 選択されたボードまたは現在のボードを取得
    const targetBoard = formState.selectedBoardId
      ? availableBoards?.find(board => board.id === formState.selectedBoardId)
      : currentBoard;

    if (!targetBoard) {
      notify.error('タスクを作成するボードが選択されていません。');
      return;
    }

    let dueDateObj: Date | undefined = undefined;

    if (formState.dueDate) {
      if (formState.hasTime && formState.dueTime) {
        // 日付と時刻を組み合わせ
        const dateTimeString = `${formState.dueDate}T${formState.dueTime}`;
        dueDateObj = new Date(dateTimeString);
      } else {
        // 日付のみの場合は23:59:59に設定
        dueDateObj = new Date(formState.dueDate);
        dueDateObj.setHours(23, 59, 59, 999);
      }
    }

    // taskFormDefaultStatusが指定されている場合はそのカラムを使用、なければ最初のカラムを使用
    const targetColumnId = taskFormDefaultStatus || targetBoard.columns[0]?.id;

    if (targetColumnId) {
      // 選択されたボードが現在のボードと異なる場合は、ボードを切り替え
      if (formState.selectedBoardId && formState.selectedBoardId !== currentBoard?.id && setCurrentBoard) {
        setCurrentBoard(formState.selectedBoardId);
      }

      createTask(
        targetColumnId,
        formState.title.trim(),
        formState.description.trim(),
        dueDateObj,
        formState.labels,
        formState.attachments,
        formState.recurrence,
        formState.priority
      );

      // 通知メッセージ
      let message = `タスク「${formState.title.trim()}」を作成しました`;
      if (selectedTemplate) {
        message = `テンプレート「${selectedTemplate.name}」からタスク「${formState.title.trim()}」を作成しました`;
      }
      if (formState.selectedBoardId && formState.selectedBoardId !== currentBoard?.id) {
        message += `（ボード「${targetBoard.title}」に作成）`;
      }
      notify.success(message);

      closeTaskForm();
    } else {
      // カラムが存在しない場合のエラーハンドリング
      notify.error('タスクを作成するためのカラムが存在しません。最初にカラムを作成してください。');
    }
  }, [
    formState,
    selectedTemplate,
    createTask,
    closeTaskForm,
    currentBoard,
    taskFormDefaultStatus,
    availableBoards,
    setCurrentBoard,
    notify
  ]);

  // キーボードショートカット処理
  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeTaskForm();
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSave();
    }
  }, [closeTaskForm, handleSave]);

  // ダイアログアクション
  const actions: DialogAction[] = useMemo(() => [
    {
      label: 'キャンセル',
      onClick: closeTaskForm,
      variant: 'outline'
    },
    {
      label: '追加',
      onClick: handleSave,
      variant: 'primary',
      disabled: !isFormValid
    }
  ], [closeTaskForm, handleSave, isFormValid]);

  return {
    handleSave,
    handleKeyPress,
    actions
  };
};