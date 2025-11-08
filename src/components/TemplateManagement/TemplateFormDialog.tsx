import React, { useState, useEffect, useCallback, Suspense, lazy } from 'react';
import { useTranslation } from 'react-i18next';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';

import type { TaskTemplate, TemplateFormData } from '../../types/template';
import type { Label, Priority } from '../../types';
import UnifiedDialog from '../shared/Dialog/UnifiedDialog';
import TemplateCategorySelector from './TemplateCategorySelector';
import LabelSelector from '../LabelSelector';
import PrioritySelector from '../PrioritySelector';
import InlineMessage from '../shared/InlineMessage';

// 動的インポート - RichTextEditor
const LexicalRichTextEditor = lazy(() => import('../LexicalRichTextEditor/'));

interface TemplateFormDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onSave: (data: TemplateFormData) => void;
  template?: TaskTemplate | null;
  mode: 'create' | 'edit';
}

/**
 * テンプレートフォームダイアログ
 * テンプレートの作成・編集を行うダイアログ
 */
const TemplateFormDialog: React.FC<TemplateFormDialogProps> = ({
  isOpen,
  onClose,
  onSave,
  template,
  mode,
}) => {
  const { t } = useTranslation();

  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    category: 'work',
    taskTitle: '',
    taskDescription: '',
    priority: undefined,
    labels: [],
    dueDate: null,
    isFavorite: false,
  });

  const [errors, setErrors] = useState<{
    name?: string;
    taskTitle?: string;
  }>({});

  const [isLoading, setIsLoading] = useState(false);

  // フォームデータの初期化
  useEffect(() => {
    if (isOpen) {
      if (mode === 'edit' && template) {
        setFormData({
          name: template.name,
          description: template.description,
          category: template.category,
          taskTitle: template.taskTitle,
          taskDescription: template.taskDescription,
          priority: template.priority,
          labels: template.labels,
          dueDate: template.dueDate,
          isFavorite: template.isFavorite,
          boardId: template.boardId,
          columnId: template.columnId,
        });
      } else {
        setFormData({
          name: '',
          description: '',
          category: 'work',
          taskTitle: '',
          taskDescription: '',
          priority: undefined,
          labels: [],
          dueDate: null,
          isFavorite: false,
        });
      }
      setErrors({});
      setIsLoading(false);
    }
  }, [isOpen, mode, template]);

  // バリデーション
  const validateForm = useCallback(() => {
    const newErrors: { name?: string; taskTitle?: string } = {};

    // テンプレート名チェック
    const trimmedName = formData.name.trim();
    if (!trimmedName) {
      newErrors.name = 'テンプレート名は必須です';
    } else if (trimmedName.length < 2) {
      newErrors.name = 'テンプレート名は2文字以上で入力してください';
    } else if (trimmedName.length > 50) {
      newErrors.name = 'テンプレート名は50文字以下で入力してください';
    }

    // タスクタイトルチェック
    const trimmedTaskTitle = formData.taskTitle.trim();
    if (!trimmedTaskTitle) {
      newErrors.taskTitle = 'タスクタイトルは必須です';
    } else if (trimmedTaskTitle.length < 1) {
      newErrors.taskTitle = 'タスクタイトルを入力してください';
    } else if (trimmedTaskTitle.length > 100) {
      newErrors.taskTitle = 'タスクタイトルは100文字以下で入力してください';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  }, [formData.name, formData.taskTitle]);

  // 保存処理
  const handleSave = useCallback(async () => {
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});

    try {
      onSave({
        ...formData,
        name: formData.name.trim(),
        taskTitle: formData.taskTitle.trim(),
      });

      onClose();
    } catch (_error) {
      setErrors({ name: 'テンプレートの保存に失敗しました' });
    } finally {
      setIsLoading(false);
    }
  }, [formData, validateForm, onSave, onClose]);

  // キャンセル処理
  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  // Enterキーでの保存
  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      if (e.key === 'Enter' && (e.ctrlKey || e.metaKey)) {
        e.preventDefault();
        if (!isLoading) {
          handleSave();
        }
      }
    },
    [handleSave, isLoading]
  );

  // 優先度選択
  const handlePriorityChange = useCallback((priority: Priority | undefined) => {
    setFormData(prev => ({ ...prev, priority }));
  }, []);

  // ラベル変更
  const handleLabelsChange = useCallback((labels: Label[]) => {
    setFormData(prev => ({ ...prev, labels }));
  }, []);

  const actions = [
    {
      label: 'キャンセル',
      variant: 'outline' as const,
      onClick: handleCancel,
    },
    {
      label: mode === 'create' ? '作成' : '更新',
      variant: 'default' as const,
      onClick: handleSave,
      disabled:
        !formData.name.trim() || !formData.taskTitle.trim() || isLoading,
    },
  ];

  return (
    <UnifiedDialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'テンプレートを作成' : 'テンプレートを編集'}
      variant='modal'
      size='large'
      actions={actions}
    >
      <div className='flex flex-col' onKeyDown={handleKeyDown}>
        <div className='mb-3 mt-2 font-bold text-base'>テンプレート情報</div>
        {/* テンプレート基本情報 */}
        <div className='flex flex-col gap-4 p-3 rounded-md bg-neutral-100 border border-border'>
          {/* テンプレート名 */}
          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium' htmlFor='template-name'>
              テンプレート名
              <span className='text-destructive ml-1'>*</span>
            </label>
            <Input
              id='template-name'
              value={formData.name}
              onChange={e => {
                setFormData(prev => ({ ...prev, name: e.target.value }));
                if (errors.name) {
                  setErrors(prev => ({ ...prev, name: undefined }));
                }
              }}
              placeholder='例: 週次レポート作成'
              autoFocus
              disabled={isLoading}
              className={`w-full ${errors.name ? 'border-destructive' : ''}`}
            />
            {errors.name && (
              <InlineMessage
                variant='critical'
                message={errors.name}
                size='small'
              />
            )}
          </div>

          {/* テンプレート説明 */}
          <div className='flex flex-col gap-1'>
            <label
              className='text-sm font-medium'
              htmlFor='template-description'
            >
              説明
            </label>
            <Textarea
              id='template-description'
              value={formData.description}
              onChange={e =>
                setFormData(prev => ({ ...prev, description: e.target.value }))
              }
              placeholder='このテンプレートの用途を説明...'
              className='w-full'
              rows={2}
              disabled={isLoading}
            />
          </div>

          {/* カテゴリー */}
          <TemplateCategorySelector
            value={formData.category}
            onChange={category => setFormData(prev => ({ ...prev, category }))}
            disabled={isLoading}
          />
        </div>

        {/* タスク情報 */}
        <div className='mt-6 mb-3 font-bold text-base'>作成されるタスク</div>
        <div className='flex flex-col gap-4 p-3 bg-neutral-100 rounded-md border border-border'>
          {/* タスクタイトル */}
          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium' htmlFor='task-title'>
              タスクタイトル
              <span className='text-destructive ml-1'>*</span>
            </label>
            <Input
              id='task-title'
              value={formData.taskTitle}
              onChange={e => {
                setFormData(prev => ({ ...prev, taskTitle: e.target.value }));
                if (errors.taskTitle) {
                  setErrors(prev => ({ ...prev, taskTitle: undefined }));
                }
              }}
              placeholder='例: 週次レポートを作成する'
              className={`w-full ${errors.taskTitle ? 'border-destructive' : ''}`}
              disabled={isLoading}
            />
            {errors.taskTitle && (
              <InlineMessage
                variant='critical'
                message={errors.taskTitle}
                size='small'
              />
            )}
          </div>

          {/* タスク説明 */}
          <div className='flex flex-col gap-1'>
            <label className='text-sm font-medium' htmlFor='task-description'>
              タスク説明
            </label>
            <Suspense
              fallback={
                <div className='h-[120px] flex items-center justify-center border border-input rounded-md'>
                  <span className='text-sm text-muted-foreground'>
                    エディタを読み込み中...
                  </span>
                </div>
              }
            >
              <LexicalRichTextEditor
                value={formData.taskDescription}
                onChange={value =>
                  setFormData(prev => ({ ...prev, taskDescription: value }))
                }
                placeholder='タスクの説明を入力...'
                disabled={isLoading}
                minHeight='120px'
              />
            </Suspense>
          </div>

          {/* 優先度 */}
          <PrioritySelector
            priority={formData.priority}
            onPriorityChange={handlePriorityChange}
            disabled={isLoading}
            variant='full'
          />

          {/* ラベル */}
          <div>
            <label className='text-sm font-medium'>{t('label.labels')}</label>
            <LabelSelector
              selectedLabels={formData.labels}
              onLabelsChange={handleLabelsChange}
            />
          </div>
        </div>
      </div>
    </UnifiedDialog>
  );
};

export default TemplateFormDialog;
