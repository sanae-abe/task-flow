import {
  Box,
  Text,
  Checkbox,
  Select,
  TextInput,
  Label,
} from '@primer/react';
import React, { useState, useEffect, useCallback } from 'react';

import type { RecurrenceConfig, RecurrencePattern } from '../types';
import {
  validateRecurrenceConfig,
  getRecurrenceDescription,
} from '../utils/recurrence';

interface RecurrenceSelectorProps {
  recurrence?: RecurrenceConfig;
  onRecurrenceChange: (recurrence: RecurrenceConfig | undefined) => void;
}

const PATTERN_OPTIONS: { value: RecurrencePattern; label: string }[] = [
  { value: 'daily', label: '毎日' },
  { value: 'weekly', label: '毎週' },
  { value: 'monthly', label: '毎月' },
  { value: 'yearly', label: '毎年' },
];

const WEEKDAYS = [
  { value: 0, label: '日' },
  { value: 1, label: '月' },
  { value: 2, label: '火' },
  { value: 3, label: '水' },
  { value: 4, label: '木' },
  { value: 5, label: '金' },
  { value: 6, label: '土' },
];

const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  recurrence,
  onRecurrenceChange,
}) => {
  const [config, setConfig] = useState<RecurrenceConfig>(() => ({
    enabled: false,
    pattern: 'daily',
    interval: 1,
    ...recurrence,
  }));

  const [errors, setErrors] = useState<string[]>([]);

  useEffect(() => {
    if (recurrence) {
      setConfig(prev => ({ ...prev, ...recurrence }));
    }
  }, [recurrence]);

  useEffect(() => {
    const newErrors = validateRecurrenceConfig(config);
    setErrors(newErrors);

    if (newErrors.length === 0) {
      onRecurrenceChange(config.enabled ? config : undefined);
    }
  }, [config, onRecurrenceChange]);

  const handleEnabledChange = useCallback((checked: boolean) => {
    setConfig(prev => ({ ...prev, enabled: checked }));
  }, []);

  const handlePatternChange = useCallback((value: string) => {
    setConfig(prev => ({
      ...prev,
      pattern: value as RecurrencePattern,
      daysOfWeek: value === 'weekly' ? [new Date().getDay()] : undefined,
      dayOfMonth: value === 'monthly' ? new Date().getDate() : undefined,
    }));
  }, []);

  const handleIntervalChange = useCallback((value: string) => {
    const interval = parseInt(value, 10);
    if (!isNaN(interval) && interval > 0) {
      setConfig(prev => ({ ...prev, interval }));
    }
  }, []);

  const handleDaysOfWeekChange = useCallback((day: number, checked: boolean) => {
    setConfig(prev => {
      const daysOfWeek = prev.daysOfWeek || [];
      const newDaysOfWeek = checked
        ? [...daysOfWeek, day].sort((a, b) => a - b)
        : daysOfWeek.filter(d => d !== day);

      return { ...prev, daysOfWeek: newDaysOfWeek };
    });
  }, []);

  const handleDayOfMonthChange = useCallback((value: string) => {
    const dayOfMonth = parseInt(value, 10);
    if (!isNaN(dayOfMonth) && dayOfMonth >= 1 && dayOfMonth <= 31) {
      setConfig(prev => ({ ...prev, dayOfMonth }));
    }
  }, []);

  const handleEndDateChange = useCallback((value: string) => {
    setConfig(prev => ({
      ...prev,
      endDate: value || undefined,
      maxOccurrences: value ? undefined : prev.maxOccurrences,
    }));
  }, []);

  const handleMaxOccurrencesChange = useCallback((value: string) => {
    const maxOccurrences = parseInt(value, 10);
    if (value === '' || (!isNaN(maxOccurrences) && maxOccurrences > 0)) {
      setConfig(prev => ({
        ...prev,
        maxOccurrences: value === '' ? undefined : maxOccurrences,
        endDate: value !== '' ? undefined : prev.endDate,
      }));
    }
  }, []);

  return (
    <Box sx={{ mb: 4 }}>
      <Label>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2, mb: 2 }}>
          <Checkbox
            checked={config.enabled}
            onChange={(e) => handleEnabledChange(e.target.checked)}
          />
          <Text sx={{ fontSize: 1, color: 'fg.muted', fontWeight: '700' }}>
            繰り返し設定
          </Text>
        </Box>
      </Label>

      {config.enabled && (
        <Box sx={{ pl: 4, display: 'flex', flexDirection: 'column', gap: 3 }}>
          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Text sx={{ fontSize: 1, minWidth: '60px' }}>パターン:</Text>
            <Select
              value={config.pattern}
              onChange={(e) => handlePatternChange(e.target.value)}
              sx={{ width: '120px' }}
            >
              {PATTERN_OPTIONS.map(option => (
                <Select.Option key={option.value} value={option.value}>
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </Box>

          <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
            <Text sx={{ fontSize: 1, minWidth: '60px' }}>間隔:</Text>
            <TextInput
              type="number"
              value={config.interval.toString()}
              onChange={(e) => handleIntervalChange(e.target.value)}
              sx={{ width: '80px' }}
              min={1}
            />
            <Text sx={{ fontSize: 1 }}>
              {config.pattern === 'daily' ? '日ごと' :
               config.pattern === 'weekly' ? '週間ごと' :
               config.pattern === 'monthly' ? 'ヶ月ごと' : '年ごと'}
            </Text>
          </Box>

          {config.pattern === 'weekly' && (
            <Box>
              <Text sx={{ fontSize: 1, mb: 2 }}>曜日選択:</Text>
              <Box sx={{ display: 'flex', gap: 1, flexWrap: 'wrap' }}>
                {WEEKDAYS.map(day => (
                  <Label key={day.value} sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>
                    <Checkbox
                      checked={config.daysOfWeek?.includes(day.value) || false}
                      onChange={(e) => handleDaysOfWeekChange(day.value, e.target.checked)}
                    />
                    <Text sx={{ fontSize: 1 }}>{day.label}</Text>
                  </Label>
                ))}
              </Box>
            </Box>
          )}

          {config.pattern === 'monthly' && (
            <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
              <Text sx={{ fontSize: 1, minWidth: '60px' }}>日付:</Text>
              <TextInput
                type="number"
                value={config.dayOfMonth?.toString() || ''}
                onChange={(e) => handleDayOfMonthChange(e.target.value)}
                placeholder="毎月の日付（1-31）"
                sx={{ width: '150px' }}
                min={1}
                max={31}
              />
              <Text sx={{ fontSize: 1 }}>日</Text>
            </Box>
          )}

          <Box>
            <Text sx={{ fontSize: 1, mb: 2 }}>終了条件（任意）:</Text>
            <Box sx={{ display: 'flex', flexDirection: 'column', gap: 2, pl: 2 }}>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Text sx={{ fontSize: 1, minWidth: '60px' }}>終了日:</Text>
                <TextInput
                  type="date"
                  value={config.endDate || ''}
                  onChange={(e) => handleEndDateChange(e.target.value)}
                  sx={{ width: '150px' }}
                />
              </Box>
              <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                <Text sx={{ fontSize: 1, minWidth: '60px' }}>最大回数:</Text>
                <TextInput
                  type="number"
                  value={config.maxOccurrences?.toString() || ''}
                  onChange={(e) => handleMaxOccurrencesChange(e.target.value)}
                  placeholder="回数"
                  sx={{ width: '80px' }}
                  min={1}
                />
                <Text sx={{ fontSize: 1 }}>回</Text>
              </Box>
            </Box>
          </Box>

          {config.enabled && (
            <Box sx={{ p: 2, bg: 'canvas.subtle', borderRadius: 2 }}>
              <Text sx={{ fontSize: 0, color: 'fg.muted' }}>
                設定内容: {getRecurrenceDescription(config)}
              </Text>
            </Box>
          )}

          {errors.length > 0 && (
            <Box sx={{ p: 2, bg: 'danger.subtle', borderRadius: 2 }}>
              {errors.map((error, index) => (
                <Text key={index} sx={{ fontSize: 0, color: 'danger.fg', display: 'block' }}>
                  {error}
                </Text>
              ))}
            </Box>
          )}
        </Box>
      )}
    </Box>
  );
};

export default RecurrenceSelector;