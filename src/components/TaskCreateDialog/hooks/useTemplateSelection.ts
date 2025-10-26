import { useState, useCallback, useEffect } from 'react';
import type { TemplateState, TemplateActions, TaskFormActions } from '../types';
import type { TaskTemplate } from '../../../types/template';
import { TemplateStorage } from '../../../utils/templateStorage';

/**
 * テンプレート選択管理カスタムフック
 *
 * テンプレートの読み込み、選択、適用処理を管理します。
 * テンプレート選択時にフォーム状態も自動更新します。
 */
export const useTemplateSelection = (
  isDialogOpen: boolean,
  formActions: TaskFormActions
) => {
  // テンプレート状態
  const [templates, setTemplates] = useState<TaskTemplate[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<TaskTemplate | undefined>();

  // テンプレートをLocalStorageから読み込み（ダイアログが開くたびに）
  const loadTemplates = useCallback(() => {
    try {
      const loadedTemplates = TemplateStorage.load();
      setTemplates(loadedTemplates);
    } catch (_error) {
      // テンプレート読み込み失敗 - プロダクションではサイレント
      setTemplates([]);
    }
  }, []);

  // ダイアログが開かれた時にテンプレートを読み込み
  useEffect(() => {
    if (isDialogOpen) {
      loadTemplates();
    }
  }, [isDialogOpen, loadTemplates]);

  // テンプレート選択時の処理
  const handleTemplateSelect = useCallback((template: TaskTemplate) => {
    setSelectedTemplate(template);

    // フォーム状態を更新
    formActions.setTitle(template.taskTitle);
    formActions.setDescription(template.taskDescription);

    // ラベルと優先度も設定
    if (template.labels && template.labels.length > 0) {
      formActions.setLabels(template.labels);
    }
    // 優先度は常に設定（undefinedを含む）
    formActions.setPriority(template.priority);

    // テンプレート使用回数をインクリメント
    try {
      TemplateStorage.incrementUsage(template.id);
      // 使用回数更新後にテンプレート一覧を再読み込み
      loadTemplates();
    } catch (_error) {
      // テンプレート使用回数更新失敗 - プロダクションではサイレント
    }
  }, [formActions, loadTemplates]);

  // テンプレート選択をリセット
  const resetTemplateSelection = useCallback(() => {
    setSelectedTemplate(undefined);
  }, []);

  // ダイアログが閉じられた時にテンプレート選択をリセット
  useEffect(() => {
    if (!isDialogOpen) {
      resetTemplateSelection();
    }
  }, [isDialogOpen, resetTemplateSelection]);

  const templateState: TemplateState = {
    templates,
    selectedTemplate
  };

  const templateActions: TemplateActions = {
    setTemplates,
    setSelectedTemplate,
    handleTemplateSelect,
    loadTemplates
  };

  return {
    templateState,
    templateActions,
    resetTemplateSelection
  };
};