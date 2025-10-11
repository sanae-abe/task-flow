import React, { useState, useEffect, useCallback } from 'react';
import { Box, TextInput, FormControl, Textarea } from '@primer/react';

import type { TaskTemplate, TemplateFormData } from '../../types/template';
import type { Label, Priority } from '../../types';
import UnifiedDialog from '../shared/Dialog/UnifiedDialog';
import TemplateCategorySelector from './TemplateCategorySelector';
import LabelSelector from '../LabelSelector';
import RichTextEditor from '../RichTextEditor';
import PrioritySelector from '../PrioritySelector';

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
  mode
}) => {
  const [formData, setFormData] = useState<TemplateFormData>({
    name: '',
    description: '',
    category: 'work',
    taskTitle: '',
    taskDescription: '',
    priority: undefined,
    labels: [],
    dueDate: null,
    isFavorite: false
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
          columnId: template.columnId
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
          isFavorite: false
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
        taskTitle: formData.taskTitle.trim()
      });

      onClose();
    } catch (error) {
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
    setFormData((prev) => ({ ...prev, priority }));
  }, []);

  // ラベル変更
  const handleLabelsChange = useCallback((labels: Label[]) => {
    setFormData((prev) => ({ ...prev, labels }));
  }, []);

  const actions = [
    {
      label: 'キャンセル',
      variant: 'default' as const,
      onClick: handleCancel
    },
    {
      label: mode === 'create' ? '作成' : '更新',
      variant: 'primary' as const,
      onClick: handleSave,
      disabled: !formData.name.trim() || !formData.taskTitle.trim() || isLoading
    }
  ];

  return (
    <UnifiedDialog
      isOpen={isOpen}
      onClose={onClose}
      title={mode === 'create' ? 'テンプレートを作成' : 'テンプレートを編集'}
      variant="modal"
      size="large"
      actions={actions}
    >
      <Box sx={{ display: 'flex', flexDirection: 'column' }} onKeyDown={handleKeyDown}>
        <Box sx={{
          mt: 2,
          mb: 3,
          fontWeight: 'bold',
          fontSize: 2
        }}>
          テンプレート情報
        </Box>
        {/* テンプレート基本情報 */}
        <Box sx={{
          p: 3,
          borderRadius: 2,
          bg: 'canvas.subtle'
        }}>

          {/* テンプレート名 */}
          <FormControl sx={{ mb: 3 }}>
            <FormControl.Label>テンプレート名</FormControl.Label>
            <TextInput
              value={formData.name}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, name: e.target.value }));
                if (errors.name) {
                  setErrors((prev) => ({ ...prev, name: undefined }));
                }
              }}
              placeholder="例: 週次レポート作成"
              sx={{ width: '100%' }}
              validationStatus={errors.name ? 'error' : undefined}
              autoFocus
              disabled={isLoading}
            />
            {errors.name && (
              <FormControl.Validation variant="error">{errors.name}</FormControl.Validation>
            )}
          </FormControl>

          {/* テンプレート説明 */}
          <FormControl sx={{ mb: 3 }}>
            <FormControl.Label>説明（任意）</FormControl.Label>
            <Textarea
              value={formData.description}
              onChange={(e) =>
                setFormData((prev) => ({ ...prev, description: e.target.value }))
              }
              placeholder="このテンプレートの用途を説明"
              sx={{ width: '100%' }}
              rows={2}
              disabled={isLoading}
            />
          </FormControl>

          {/* カテゴリー */}
          <TemplateCategorySelector
            value={formData.category}
            onChange={(category) => setFormData((prev) => ({ ...prev, category }))}
            disabled={isLoading}
          />
        </Box>

        {/* タスク情報 */}
        <Box sx={{
          mt: 5,
          mb: 3,
          fontWeight: 'bold',
          fontSize: 2,
        }}>
            作成されるタスク
        </Box>
        <Box sx={{
          p: 3,
          bg: 'canvas.subtle',
          borderRadius: 2
        }}>
          {/* タスクタイトル */}
          <FormControl sx={{ mb: 3 }}>
            <FormControl.Label>タスクタイトル</FormControl.Label>
            <TextInput
              value={formData.taskTitle}
              onChange={(e) => {
                setFormData((prev) => ({ ...prev, taskTitle: e.target.value }));
                if (errors.taskTitle) {
                  setErrors((prev) => ({ ...prev, taskTitle: undefined }));
                }
              }}
              placeholder="例: 週次レポートを作成する"
              sx={{ width: '100%' }}
              validationStatus={errors.taskTitle ? 'error' : undefined}
              disabled={isLoading}
            />
            {errors.taskTitle && (
              <FormControl.Validation variant="error">
                {errors.taskTitle}
              </FormControl.Validation>
            )}
          </FormControl>

          {/* タスク説明 */}
          <FormControl sx={{ mb: 3 }}>
            <FormControl.Label>タスク説明（任意）</FormControl.Label>
            <RichTextEditor
              value={formData.taskDescription}
              onChange={(value) =>
                setFormData((prev) => ({ ...prev, taskDescription: value }))
              }
              placeholder="タスクの詳細を入力"
              disabled={isLoading}
              minHeight="120px"
            />
          </FormControl>

          {/* 優先度 */}
          <div style={{ marginBottom: '16px' }}>
            <PrioritySelector
              priority={formData.priority}
              onPriorityChange={handlePriorityChange}
              disabled={isLoading}
              variant="full"
            />
          </div>

          {/* ラベル */}
          <FormControl>
            <FormControl.Label>ラベル（任意）</FormControl.Label>
            <LabelSelector
              selectedLabels={formData.labels}
              onLabelsChange={handleLabelsChange}
            />
          </FormControl>
        </Box>
      </Box>
    </UnifiedDialog>
  );
};

export default TemplateFormDialog;
