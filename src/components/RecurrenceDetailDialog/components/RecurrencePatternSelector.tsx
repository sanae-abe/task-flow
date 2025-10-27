import React, { useMemo } from "react";
import type { FormFieldConfig } from "../../../types/unified-form";
import { useUnifiedForm } from "../../../hooks/useUnifiedForm";
import UnifiedFormField from "../../shared/Form/UnifiedFormField";
import type { RecurrenceConfig } from "../types";
import { PATTERN_OPTIONS } from "../utils/constants";

interface RecurrencePatternSelectorProps {
  config: RecurrenceConfig;
  onPatternChange: (value: string) => void;
  onIntervalChange: (value: string) => void;
}

const RecurrencePatternSelector: React.FC<RecurrencePatternSelectorProps> = ({
  config,
  onPatternChange,
  onIntervalChange,
}) => {
  // 初期値の設定
  const initialValues = useMemo(() => ({
    pattern: config.pattern || 'daily',
    interval: (config.interval || 1).toString()
  }), [config.pattern, config.interval]);

  // パターンオプションの変換
  const patternOptions = useMemo(() =>
    PATTERN_OPTIONS.map(option => ({
      value: option.value,
      label: option.label
    })), []
  );

  // 間隔単位の取得
  const getIntervalUnit = (pattern: string) => {
    switch (pattern) {
      case "daily":
        return "日ごと";
      case "weekly":
        return "週間ごと";
      case "monthly":
        return "ヶ月ごと";
      case "yearly":
        return "年ごと";
      default:
        return "日ごと";
    }
  };

  // フィールド設定
  const fields: FormFieldConfig[] = useMemo(() => [
    // パターン選択
    {
      id: 'pattern',
      name: 'pattern',
      type: 'select',
      label: 'パターン',
      value: initialValues.pattern,
      options: patternOptions,
      onChange: () => { }, // フォームで管理
    },
    // 間隔設定
    {
      id: 'interval',
      name: 'interval',
      type: 'number',
      label: '間隔',
      value: initialValues.interval,
      validation: {
        required: true,
        min: 1,
      },
      min: 1,
      step: 1,
      onChange: () => { }, // フォームで管理
    },
  ], [initialValues, patternOptions]);

  // 統合フォーム管理
  const form = useUnifiedForm(fields, initialValues);

  // 現在の値を取得
  const currentPattern = String(form.state.values['pattern'] || 'daily');
  const currentInterval = String(form.state.values['interval'] || '1');

  // パターン変更時の処理
  const handlePatternChange = (value: unknown) => {
    const newPattern = String(value);
    form.setValue('pattern', newPattern);
    onPatternChange(newPattern);
  };

  // 間隔変更時の処理
  const handleIntervalChange = (value: unknown) => {
    const newInterval = String(value);
    form.setValue('interval', newInterval);
    onIntervalChange(newInterval);
  };

  const patternField = fields[0];
  const intervalField = fields[1];

  if (!patternField || !intervalField) {
    return null;
  }

  return (
    <div className="flex flex-col gap-2">
      <UnifiedFormField
        id={patternField.id}
        name={patternField.name}
        type={patternField.type}
        label={patternField.label}
        value={currentPattern}
        options={patternField.options}
        onChange={handlePatternChange}
        onBlur={() => form.setTouched('pattern', true)}
        _error={form.getFieldError('pattern')}
        touched={form.state.touched['pattern']}
        disabled={form.state.isSubmitting}
        hideLabel={false}
        className="flex items-center gap-1 [&>label]:w-[80px] [&>label]:mb-0 [&>select]:w-auto"
      />
      <UnifiedFormField
        id={intervalField.id}
        name={intervalField.name}
        type={intervalField.type}
        label={intervalField.label}
        value={currentInterval}
        validation={intervalField.validation}
        min={intervalField.min}
        step={intervalField.step}
        onChange={handleIntervalChange}
        onBlur={() => form.setTouched('interval', true)}
        _error={form.getFieldError('interval')}
        touched={form.state.touched['interval']}
        disabled={form.state.isSubmitting}
        hideLabel={false}
        className="flex items-center gap-1 [&>label]:w-[80px] [&>label]:mb-0 [&>input]:w-auto"
      />
      <span className="text-sm">{getIntervalUnit(currentPattern)}</span>
    </div>
  );
};

export default RecurrencePatternSelector;