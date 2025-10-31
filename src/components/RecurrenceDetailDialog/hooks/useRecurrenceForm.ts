import { useState, useEffect, useMemo } from 'react';
import type { RecurrenceConfig, RecurrencePattern } from '../../../types';
import { validateRecurrenceConfig } from '../../../utils/recurrence';

interface UseRecurrenceFormProps {
  isOpen: boolean;
  recurrence?: RecurrenceConfig;
}

export interface RecurrenceFormState {
  config: RecurrenceConfig;
  errors: string[];
  isFormValid: boolean;
}

export const useRecurrenceForm = ({
  isOpen,
  recurrence,
}: UseRecurrenceFormProps): RecurrenceFormState & {
  setConfig: React.Dispatch<React.SetStateAction<RecurrenceConfig>>;
} => {
  const defaultConfig: RecurrenceConfig = useMemo(
    () => ({
      enabled: true,
      pattern: 'daily' as RecurrencePattern,
      interval: 1,
    }),
    []
  );

  const [config, setConfig] = useState<RecurrenceConfig>(() =>
    recurrence ? { ...defaultConfig, ...recurrence } : defaultConfig
  );

  const [errors, setErrors] = useState<string[]>([]);

  // propsのrecurrenceが変更された時に内部状態を更新
  useEffect(() => {
    if (isOpen) {
      const newConfig = recurrence
        ? { ...defaultConfig, ...recurrence }
        : defaultConfig;
      setConfig(newConfig);
    }
  }, [isOpen, recurrence, defaultConfig]);

  // バリデーション
  useEffect(() => {
    if (!config) {
      setErrors([]);
      return;
    }

    const newErrors = validateRecurrenceConfig(config);
    setErrors(newErrors);
  }, [config]);

  const isFormValid = useMemo(() => errors.length === 0, [errors]);

  return {
    config,
    setConfig,
    errors,
    isFormValid,
  };
};
