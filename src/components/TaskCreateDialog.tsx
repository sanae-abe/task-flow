import { TextInput, FormControl, UnderlineNav, Flash } from '@primer/react';
import { InfoIcon } from '@primer/octicons-react';
import React, { useState, useEffect, useCallback, memo, useMemo } from 'react';

import type { Label as LabelType, FileAttachment, RecurrenceConfig, Priority } from '../types';
import type { TaskTemplate } from '../types/template';
import type { DialogAction } from '../types/unified-dialog';
import { useKanban } from '../contexts/KanbanContext';
import { useNotify } from '../contexts/NotificationContext';
import { TemplateStorage } from '../utils/templateStorage';

import UnifiedDialog from './shared/Dialog/UnifiedDialog';
import FileUploader from './FileUploader';
import FormField from './FormField';
import LabelSelector from './LabelSelector';
import PrioritySelector from './PrioritySelector';
import RecurrenceSelector from './RecurrenceSelector';
import RichTextEditor from './RichTextEditor';
import TimeSelector from './TimeSelector';

type CreateMode = 'normal' | 'template';

// テンプレート選択コンポーネント
const TemplateSelector: React.FC<{
  templates: TaskTemplate[];
  onSelect: (template: TaskTemplate) => void;
}> = ({ templates, onSelect }) => {
  // お気に入りテンプレートを優先して、その後使用回数順でソート
  const sortedTemplates = useMemo(() => [...templates].sort((a, b) => {
      // お気に入りを最初に表示
      if (a.isFavorite && !b.isFavorite) {return -1;}
      if (!a.isFavorite && b.isFavorite) {return 1;}
      // その後は使用回数順（多い順）
      return b.usageCount - a.usageCount;
    }), [templates]);

  // お気に入りとその他を分離
  const favoriteTemplates = sortedTemplates.filter(template => template.isFavorite);
  const otherTemplates = sortedTemplates.filter(template => !template.isFavorite);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
      <div style={{ fontSize: '14px', fontWeight: '600', marginBottom: '8px' }}>
        テンプレートを選択してください
      </div>
      {templates.length === 0 ? (
        <div style={{
          padding: '32px',
          textAlign: 'center',
          color: 'var(--fgColor-muted)',
          fontSize: '14px'
        }}>
          テンプレートが登録されていません。<br />
          設定画面からテンプレートを作成してください。
        </div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: '24px' }}>
          {/* お気に入りテンプレート */}
          {favoriteTemplates.length > 0 && (
            <div>
              <div style={{ 
                fontSize: '14px', 
                fontWeight: '600', 
                marginBottom: '12px',
                color: 'var(--color-attention-fg)',
                display: 'flex',
                alignItems: 'center',
                gap: '6px'
              }}>
                ⭐ お気に入りテンプレート
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                {favoriteTemplates.map((template) => (
                  <div
                    key={template.id}
                    style={{
                      border: '2px solid var(--color-attention-emphasis)',
                      borderRadius: '6px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'var(--color-attention-subtle)',
                    }}
                    onClick={() => onSelect(template)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-attention-muted)';
                      e.currentTarget.style.transform = 'translateY(-2px)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.backgroundColor = 'var(--color-attention-subtle)';
                      e.currentTarget.style.transform = 'translateY(0px)';
                    }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px', display: 'flex', alignItems: 'center', gap: '6px' }}>
                      ⭐ {template.name}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--fgColor-muted)', marginBottom: '8px' }}>
                      {template.description || template.taskDescription.slice(0, 100)}...
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--fgColor-muted)' }}>
                      カテゴリー: {template.category} | 使用回数: {template.usageCount}回
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* その他のテンプレート */}
          {otherTemplates.length > 0 && (
            <div>
              {favoriteTemplates.length > 0 && (
                <div style={{ 
                  fontSize: '14px', 
                  fontWeight: '600', 
                  marginBottom: '12px',
                  color: 'var(--fgColor-default)'
                }}>
                  その他のテンプレート
                </div>
              )}
              <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(250px, 1fr))', gap: '12px' }}>
                {otherTemplates.map((template) => (
                  <div
                    key={template.id}
                    style={{
                      border: '1px solid var(--borderColor-default)',
                      borderRadius: '6px',
                      padding: '16px',
                      cursor: 'pointer',
                      transition: 'all 0.2s ease',
                      backgroundColor: 'var(--bgColor-default)',
                    }}
                    onClick={() => onSelect(template)}
                    onMouseEnter={(e) => {
                      e.currentTarget.style.borderColor = 'var(--color-accent-emphasis)';
                      e.currentTarget.style.backgroundColor = 'var(--color-accent-subtle)';
                    }}
                    onMouseLeave={(e) => {
                      e.currentTarget.style.borderColor = 'var(--borderColor-default)';
                      e.currentTarget.style.backgroundColor = 'var(--bgColor-default)';
                    }}
                  >
                    <div style={{ fontSize: '16px', fontWeight: '600', marginBottom: '8px' }}>
                      {template.name}
                    </div>
                    <div style={{ fontSize: '14px', color: 'var(--fgColor-muted)', marginBottom: '8px' }}>
                      {template.description || template.taskDescription.slice(0, 100)}...
                    </div>
                    <div style={{ fontSize: '12px', color: 'var(--fgColor-muted)' }}>
                      カテゴリー: {template.category} | 使用回数: {template.usageCount}回
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
};

const TaskCreateDialog = memo(() => {
  const {
    state,
    closeTaskForm,
    createTask,
  } = useKanban();
  const notify = useNotify();

  // 作成モード
  const [createMode, setCreateMode] = useState<CreateMode>('normal');

  // フォーム状態
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [dueDate, setDueDate] = useState('');
  const [dueTime, setDueTime] = useState('');
  const [hasTime, setHasTime] = useState(false);
  const [labels, setLabels] = useState<LabelType[]>([]);
  const [attachments, setAttachments] = useState<FileAttachment[]>([]);
  const [recurrence, setRecurrence] = useState<RecurrenceConfig | undefined>();
  const [priority, setPriority] = useState<Priority | undefined>();

  // テンプレート関連
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | undefined>();

  // テンプレートをLocalStorageから読み込み（ダイアログが開くたびに）
  useEffect(() => {
    if (state.isTaskFormOpen) {
      try {
        const loadedTemplates = TemplateStorage.load();

        if (loadedTemplates.length > 0) {
          setTemplates(loadedTemplates);
        }
      } catch (error) {
        console.warn('Failed to load templates:', error);
      }
    }
  }, [state.isTaskFormOpen]);

  // デフォルト日付が設定されている場合は期限日に設定
  useEffect(() => {
    if (state.taskFormDefaultDate) {
      const defaultDate = new Date(state.taskFormDefaultDate);
      const dateString = defaultDate.toISOString().split('T')[0]; // YYYY-MM-DD形式
      setDueDate(dateString || '');
    }
  }, [state.taskFormDefaultDate]);

  // ダイアログが開かれた時の初期化処理
  const [isDialogFirstOpen, setIsDialogFirstOpen] = useState(false);

  useEffect(() => {
    if (state.isTaskFormOpen && !isDialogFirstOpen) {
      // ダイアログが新しく開かれた時のみフォームリセット
      setTitle('');
      setDescription('');
      if (!state.taskFormDefaultDate) {
        setDueDate('');
      }
      setDueTime('');
      setHasTime(false);
      setLabels([]);
      setAttachments([]);
      setRecurrence(undefined);
      setPriority(undefined);
      setCreateMode('normal');
      setSelectedTemplate(undefined);
      setIsDialogFirstOpen(true);
    } else if (!state.isTaskFormOpen) {
      // ダイアログが閉じられた時
      setIsDialogFirstOpen(false);
    }
  }, [state.isTaskFormOpen, state.taskFormDefaultDate, isDialogFirstOpen]);

  // テンプレート選択時の処理
  const handleTemplateSelect = useCallback((template: TaskTemplate) => {
    setSelectedTemplate(template);
    setTitle(template.taskTitle);
    setDescription(template.taskDescription);

    // ラベルと優先度も設定
    if (template.labels && template.labels.length > 0) {
      setLabels(template.labels);
    }
    // 優先度は常に設定（undefinedを含む）
    setPriority(template.priority);

    // テンプレート使用回数をインクリメント
    try {
      TemplateStorage.incrementUsage(template.id);
    } catch (error) {
      console.warn('Failed to increment template usage:', error);
    }

    // テンプレート選択後は通常作成モードに切り替え
    setCreateMode('normal');
  }, []);

  const handleTimeChange = useCallback((newHasTime: boolean, newTime: string) => {
    setHasTime(newHasTime);
    setDueTime(newTime);
  }, []);

  const handleSave = useCallback(() => {
    if (!title.trim() || !state.currentBoard) {
      return;
    }

    let dueDateObj: Date | undefined = undefined;

    if (dueDate) {
      if (hasTime && dueTime) {
        // 日付と時刻を組み合わせ
        const dateTimeString = `${dueDate}T${dueTime}`;
        dueDateObj = new Date(dateTimeString);
      } else {
        // 日付のみの場合は23:59:59に設定
        dueDateObj = new Date(dueDate);
        dueDateObj.setHours(23, 59, 59, 999);
      }
    }

    // taskFormDefaultStatusが指定されている場合はそのカラムを使用、なければ最初のカラムを使用
    const targetColumnId = state.taskFormDefaultStatus || state.currentBoard.columns[0]?.id;

    if (targetColumnId) {
      createTask(
        targetColumnId,
        title.trim(),
        description.trim(),
        dueDateObj,
        labels,
        attachments,
        recurrence,
        priority
      );

      // テンプレートから作成した場合の通知
      if (selectedTemplate) {
        notify.success(`テンプレート「${selectedTemplate.name}」からタスクを作成しました`);
      }

      closeTaskForm();
    } else {
      // カラムが存在しない場合のエラーハンドリング
      notify.error('タスクを作成するためのカラムが存在しません。最初にカラムを作成してください。');
    }
  }, [title, description, dueDate, dueTime, hasTime, labels, attachments, recurrence, priority, createTask, closeTaskForm, state.currentBoard, state.taskFormDefaultStatus, notify, selectedTemplate]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent) => {
    if (event.key === 'Escape') {
      closeTaskForm();
    }
    if (event.key === 'Enter' && (event.ctrlKey || event.metaKey)) {
      event.preventDefault();
      handleSave();
    }
  }, [closeTaskForm, handleSave]);

  const isFormValid = title.trim().length > 0;

  const actions: DialogAction[] = useMemo(() => [
    {
      label: 'キャンセル',
      onClick: closeTaskForm,
      variant: 'default'
    },
    {
      label: '追加',
      onClick: handleSave,
      variant: 'primary',
      disabled: !isFormValid
    }
  ], [closeTaskForm, handleSave, isFormValid]);

  if (!state.isTaskFormOpen || !state.currentBoard) {
    return null;
  }

  return (
    <UnifiedDialog
      variant="modal"
      isOpen={state.isTaskFormOpen}
      title="新しいタスクを作成"
      onClose={closeTaskForm}
      ariaLabelledBy="task-create-dialog-title"
      size="large"
      actions={actions}
    >
      <div style={{ display: 'flex', flexDirection: 'column', minHeight: '600px' }}>
        {/* タブナビゲーション */}
        <div style={{ marginBottom: '16px' }}>
          <UnderlineNav aria-label="タスク作成モード選択" sx={{ padding: 0, transform: 'translateY(-8px)' }}>
            <UnderlineNav.Item
              aria-current={createMode === 'normal' ? 'page' : undefined}
              onSelect={() => setCreateMode('normal')}
            >
              通常作成
            </UnderlineNav.Item>
            <UnderlineNav.Item
              aria-current={createMode === 'template' ? 'page' : undefined}
              onSelect={() => setCreateMode('template')}
            >
              テンプレートから作成
            </UnderlineNav.Item>
          </UnderlineNav>
        </div>

        {/* テンプレート選択モード */}
        {createMode === 'template' && (
          <div style={{ marginBottom: '24px', flex: 1, minHeight: '500px' }}>
            <TemplateSelector
              templates={templates}
              onSelect={handleTemplateSelect}
            />
          </div>
        )}

        {/* 通常作成フォーム */}
        {createMode === 'normal' && (
          <div onKeyDown={handleKeyPress} style={{ flex: 1, minHeight: '500px' }}>
            {selectedTemplate && (
              <Flash variant="default" sx={{ mb: 3, display: 'flex', alignItems: 'center', gap: 2 }}>
                <InfoIcon size={16} />
                <span>テンプレート「{selectedTemplate.name}」から作成中</span>
              </Flash>
            )}

            <div style={{ width: '100%', marginBottom: '24px' }}>
              <FormField
                id="task-title"
                label="タイトル"
                value={title}
                placeholder="タスクのタイトルを入力"
                onChange={setTitle}
                onKeyDown={handleKeyPress}
                autoFocus
                required
              />
            </div>

            <div style={{ width: '100%', marginBottom: '24px' }}>
              <FormControl>
                <FormControl.Label>説明（任意）</FormControl.Label>
                <RichTextEditor
                  value={description}
                  onChange={setDescription}
                  placeholder="タスクの説明を入力"
                />
              </FormControl>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <FormControl>
                <FormControl.Label>期限（任意）</FormControl.Label>
                <div style={{ width: '100%' }}>
                  <TextInput
                    type="date"
                    value={dueDate}
                    onChange={(e: React.ChangeEvent<HTMLInputElement>) => setDueDate(e.target.value)}
                    sx={{ width: '100%' }}
                  />
                </div>
                <div style={{ display: 'flex', gap: '8px', flexWrap: 'wrap', marginTop: '8px' }}>
                  <TimeSelector
                    hasTime={hasTime}
                    dueTime={dueTime}
                    onTimeChange={handleTimeChange}
                    disabled={!dueDate}
                  />
                  <RecurrenceSelector
                    recurrence={recurrence}
                    onRecurrenceChange={setRecurrence}
                    disabled={!dueDate}
                  />
                </div>

                {!dueDate && (
                  <div style={{ marginTop: '8px', fontSize: '12px', color: 'fg.muted' }}>
                    ※期限を設定すると時刻設定と繰り返し設定が有効になります
                  </div>
                )}
              </FormControl>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <FormControl>
                <FormControl.Label>ラベル（任意）</FormControl.Label>
                <LabelSelector
                  selectedLabels={labels}
                  onLabelsChange={setLabels}
                />
              </FormControl>
            </div>

            <div style={{ marginBottom: '24px' }}>
              <PrioritySelector
                priority={priority}
                onPriorityChange={setPriority}
              />
            </div>

            <div>
              <FormControl>
                <FormControl.Label>ファイル添付（任意）</FormControl.Label>
                <FileUploader
                  attachments={attachments}
                  onAttachmentsChange={setAttachments}
                  showModeSelector={false}
                />
              </FormControl>
            </div>
          </div>
        )}
      </div>
    </UnifiedDialog>
  );
});

export default TaskCreateDialog;