/**
 * AITaskInput - AI-powered natural language task creation UI
 *
 * 自然言語入力からタスクを作成するUIコンポーネント。
 * useAITaskCreation hookと統合し、以下機能を提供：
 * - 自然言語入力フィールド（例: "明日までにレポート提出"）
 * - ローディング状態表示（AI処理中）
 * - 成功/エラーフィードバック（toast通知）
 * - DOMPurifyによるXSS対策（hook内で自動処理）
 * - i18n対応（4言語：日本語・英語・韓国語・中国語）
 *
 * @example
 * ```tsx
 * <AITaskInput
 *   onTaskCreated={(task) => console.log('Created:', task)}
 *   placeholder="明日までにレポート提出"
 * />
 * ```
 *
 * @see /Users/sanae.abe/workspace/taskflow-app/src/hooks/useAITaskCreation.ts
 */

import React, { useState, useCallback, KeyboardEvent } from 'react';
import { Sparkles, Loader2 } from 'lucide-react';
import { useTranslation } from 'react-i18next';
import DOMPurify from 'dompurify';
import { Input } from './ui/input';
import { Button } from './ui/button';
import { useAITaskCreation } from '../hooks/useAITaskCreation';
import type { Task } from '../types';

/**
 * Props for AITaskInput component
 */
export interface AITaskInputProps {
  /**
   * Callback when task is successfully created
   * @param task - Created task object
   */
  onTaskCreated?: (task: Task) => void;

  /**
   * Callback when creation fails
   * @param error - Error message
   */
  onError?: (error: string) => void;

  /**
   * Custom placeholder text
   * @default "ai.input.placeholder" (i18n key)
   */
  placeholder?: string;

  /**
   * Show sparkles icon
   * @default true
   */
  showIcon?: boolean;

  /**
   * Custom className for container
   */
  className?: string;

  /**
   * Disable input and button
   * @default false
   */
  disabled?: boolean;
}

/**
 * AITaskInput Component
 *
 * AI自然言語タスク作成UIコンポーネント。
 * セキュリティ・UX・アクセシビリティをすべて考慮。
 */
export const AITaskInput: React.FC<AITaskInputProps> = ({
  onTaskCreated,
  onError,
  placeholder,
  showIcon = true,
  className = '',
  disabled = false,
}) => {
  const { t } = useTranslation();
  const { createTask, loading } = useAITaskCreation();

  // Local state for input value
  const [query, setQuery] = useState('');

  /**
   * Sanitize user input (XSS protection)
   *
   * ユーザー入力をサニタイズ（HTMLタグ削除）。
   * AI応答もhook内でサニタイズ済み。
   */
  const sanitizeInput = useCallback(
    (input: string): string =>
      DOMPurify.sanitize(input, {
        ALLOWED_TAGS: [], // Remove all HTML tags
        ALLOWED_ATTR: [],
      }),
    []
  );

  /**
   * Handle input change
   */
  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const rawValue = e.target.value;
      // Sanitize input to prevent XSS
      const sanitizedValue = sanitizeInput(rawValue);
      setQuery(sanitizedValue);
    },
    [sanitizeInput]
  );

  /**
   * Handle task creation submission
   */
  const handleSubmit = useCallback(async () => {
    if (!query.trim() || loading) {
      return;
    }

    try {
      const createdTask = await createTask(query.trim());

      if (createdTask) {
        // Success: clear input and call callback
        setQuery('');
        onTaskCreated?.(createdTask);
      } else {
        // Error: hook already showed toast
        onError?.(t('ai.errors.taskCreationFailed'));
      }
    } catch (err) {
      // Unexpected error (should be handled by hook)
      const errorMessage =
        err instanceof Error ? err.message : t('ai.errors.unexpectedError');
      onError?.(errorMessage);
    }
  }, [query, loading, createTask, onTaskCreated, onError, t]);

  /**
   * Handle Enter key press
   */
  const handleKeyPress = useCallback(
    (e: KeyboardEvent<HTMLInputElement>) => {
      if (e.key === 'Enter' && !e.shiftKey && !loading) {
        e.preventDefault();
        handleSubmit();
      }
    },
    [handleSubmit, loading]
  );

  return (
    <div className={`flex items-center gap-2 ${className}`}>
      {/* AI Icon (optional) */}
      {showIcon && (
        <Sparkles
          className='h-5 w-5 text-primary flex-shrink-0'
          aria-hidden='true'
        />
      )}

      {/* Natural Language Input */}
      <Input
        type='text'
        value={query}
        onChange={handleInputChange}
        onKeyPress={handleKeyPress}
        placeholder={placeholder || t('ai.input.placeholder')}
        disabled={disabled || loading}
        className='flex-1'
        aria-label={t('ai.input.ariaLabel')}
        aria-describedby='ai-input-description'
      />

      {/* Submit Button */}
      <Button
        onClick={handleSubmit}
        disabled={disabled || loading || !query.trim()}
        size='default'
        className='flex-shrink-0'
        aria-label={t('ai.button.create')}
      >
        {loading ? (
          <>
            <Loader2 className='mr-2 h-4 w-4 animate-spin' aria-hidden='true' />
            {t('ai.button.creating')}
          </>
        ) : (
          t('ai.button.create')
        )}
      </Button>

      {/* Screen reader description */}
      <span id='ai-input-description' className='sr-only'>
        {t('ai.input.description')}
      </span>
    </div>
  );
};

export default AITaskInput;
