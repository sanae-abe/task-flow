import {
  Box,
  Text,
  Select,
  TextInput,
  ActionMenu,
  ActionList,
  Checkbox,
} from "@primer/react";
import React, { useState, useEffect, useCallback, useMemo } from "react";

import type { RecurrenceConfig, RecurrencePattern } from "../types";
import type { DialogAction } from "../types/unified-dialog";
import {
  validateRecurrenceConfig,
  getRecurrenceDescription,
} from "../utils/recurrence";
import UnifiedDialog from "./shared/Dialog/UnifiedDialog";

interface RecurrenceDetailDialogProps {
  isOpen: boolean;
  recurrence?: RecurrenceConfig;
  onClose: () => void;
  onSave: (recurrence: RecurrenceConfig | undefined) => void;
}

const PATTERN_OPTIONS: { value: RecurrencePattern; label: string }[] = [
  { value: "daily", label: "毎日" },
  { value: "weekly", label: "毎週" },
  { value: "monthly", label: "毎月" },
  { value: "yearly", label: "毎年" },
];

const WEEKDAYS = [
  { value: 0, label: "日" },
  { value: 1, label: "月" },
  { value: 2, label: "火" },
  { value: 3, label: "水" },
  { value: 4, label: "木" },
  { value: 5, label: "金" },
  { value: 6, label: "土" },
];

const RecurrenceDetailDialog: React.FC<RecurrenceDetailDialogProps> = ({
  isOpen,
  recurrence,
  onClose,
  onSave,
}) => {
  const [config, setConfig] = useState<RecurrenceConfig>(() => {
    const defaultConfig: RecurrenceConfig = {
      enabled: true,
      pattern: "daily" as RecurrencePattern,
      interval: 1,
    };
    return recurrence ? { ...defaultConfig, ...recurrence } : defaultConfig;
  });

  const [errors, setErrors] = useState<string[]>([]);

  // propsのrecurrenceが変更された時に内部状態を更新
  useEffect(() => {
    if (isOpen) {
      const defaultConfig: RecurrenceConfig = {
        enabled: true,
        pattern: "daily" as RecurrencePattern,
        interval: 1,
      };
      const newConfig = recurrence
        ? { ...defaultConfig, ...recurrence }
        : defaultConfig;
      setConfig(newConfig);
    }
  }, [isOpen, recurrence]);

  useEffect(() => {
    if (!config) {
      setErrors([]);
      return;
    }

    const newErrors = validateRecurrenceConfig(config);
    setErrors(newErrors);
  }, [config]);

  const handlePatternChange = useCallback((value: string) => {
    setConfig((prev) => ({
      ...prev,
      pattern: value as RecurrencePattern,
      daysOfWeek: value === "weekly" ? [new Date().getDay()] : undefined,
      dayOfMonth: value === "monthly" ? new Date().getDate() : undefined,
    }));
  }, []);

  const handleIntervalChange = useCallback((value: string) => {
    const interval = parseInt(value, 10);
    if (!isNaN(interval) && interval > 0) {
      setConfig((prev) => ({ ...prev, interval }));
    }
  }, []);

  const handleDaysOfWeekChange = useCallback(
    (day: number, checked: boolean) => {
      setConfig((prev) => {
        const daysOfWeek = prev.daysOfWeek || [];
        const newDaysOfWeek = checked
          ? [...daysOfWeek, day].sort((a, b) => a - b)
          : daysOfWeek.filter((d) => d !== day);

        return { ...prev, daysOfWeek: newDaysOfWeek };
      });
    },
    [],
  );

  const handleDayOfMonthChange = useCallback((value: string) => {
    const dayOfMonth = parseInt(value, 10);
    if (!isNaN(dayOfMonth) && dayOfMonth >= 1 && dayOfMonth <= 31) {
      setConfig((prev) => ({ ...prev, dayOfMonth }));
    }
  }, []);

  const handleEndDateChange = useCallback((value: string) => {
    setConfig((prev) => ({
      ...prev,
      endDate: value || undefined,
      maxOccurrences: value ? undefined : prev.maxOccurrences,
    }));
  }, []);

  const handleMaxOccurrencesChange = useCallback((value: string) => {
    const maxOccurrences = parseInt(value, 10);
    if (value === "" || (!isNaN(maxOccurrences) && maxOccurrences > 0)) {
      setConfig((prev) => ({
        ...prev,
        maxOccurrences: value === "" ? undefined : maxOccurrences,
        endDate: value !== "" ? undefined : prev.endDate,
      }));
    }
  }, []);

  const handleSave = useCallback(() => {
    if (errors.length === 0) {
      onSave(config);
      onClose();
    }
  }, [config, errors, onSave, onClose]);

  const handleCancel = useCallback(() => {
    onClose();
  }, [onClose]);

  const handleDelete = useCallback(() => {
    onSave(undefined);
    onClose();
  }, [onSave, onClose]);

  const isFormValid = errors.length === 0;

  const actions: DialogAction[] = useMemo(() => {
    const actionList: DialogAction[] = [
      {
        label: "キャンセル",
        onClick: handleCancel,
        variant: "default",
      },
      {
        label: "保存",
        onClick: handleSave,
        variant: "primary",
        disabled: !isFormValid,
      },
    ];

    // 既存の繰り返し設定がある場合は削除ボタンを追加
    if (recurrence?.enabled) {
      actionList.splice(1, 0, {
        label: "削除",
        onClick: handleDelete,
        variant: "danger",
      });
    }

    return actionList;
  }, [
    handleCancel,
    handleSave,
    handleDelete,
    isFormValid,
    recurrence?.enabled,
  ]);

  return (
    <UnifiedDialog
      variant="modal"
      isOpen={isOpen}
      title="繰り返し設定の詳細"
      onClose={onClose}
      actions={actions}
    >
      <div style={{ display: "flex", flexDirection: "column", gap: "12px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Text sx={{ fontSize: 1, minWidth: "60px" }}>パターン:</Text>
          <Select
            value={config?.pattern || "daily"}
            onChange={(e) => handlePatternChange(e.target.value)}
            sx={{ width: "120px" }}
          >
            {PATTERN_OPTIONS.map((option) => (
              <Select.Option key={option.value} value={option.value}>
                {option.label}
              </Select.Option>
            ))}
          </Select>
        </div>

        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Text sx={{ fontSize: 1, minWidth: "60px" }}>間隔:</Text>
          <TextInput
            type="number"
            value={(config?.interval || 1).toString()}
            onChange={(e) => handleIntervalChange(e.target.value)}
            sx={{ width: "80px", "& input": { pr: "4px" } }}
            min={1}
            step={1}
          />
          <Text sx={{ fontSize: 1 }}>
            {config?.pattern === "daily"
              ? "日ごと"
              : config?.pattern === "weekly"
                ? "週間ごと"
                : config?.pattern === "monthly"
                  ? "ヶ月ごと"
                  : "年ごと"}
          </Text>
        </div>

        {config?.pattern === "weekly" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Text sx={{ fontSize: 1, minWidth: "60px" }}>曜日選択:</Text>
            <ActionMenu>
              <ActionMenu.Button sx={{ width: "200px" }}>
                {config?.daysOfWeek && config.daysOfWeek.length > 0
                  ? `${config.daysOfWeek.map((day) => WEEKDAYS.find((w) => w.value === day)?.label).join("、")}曜日`
                  : "曜日を選択"}
              </ActionMenu.Button>
              <ActionMenu.Overlay>
                <ActionList>
                  {WEEKDAYS.map((day) => (
                    <ActionList.Item
                      key={day.value}
                      onSelect={() =>
                        handleDaysOfWeekChange(
                          day.value,
                          !config?.daysOfWeek?.includes(day.value),
                        )
                      }
                    >
                      <Box
                        sx={{
                          display: "flex",
                          alignItems: "center",
                          gap: 2,
                          width: "100%",
                        }}
                      >
                        <Checkbox
                          checked={
                            config?.daysOfWeek?.includes(day.value) || false
                          }
                          onChange={() => {}}
                        />
                        {day.label}
                      </Box>
                    </ActionList.Item>
                  ))}
                </ActionList>
              </ActionMenu.Overlay>
            </ActionMenu>
          </div>
        )}

        {config?.pattern === "monthly" && (
          <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
            <Text sx={{ fontSize: 1, minWidth: "60px" }}>日付:</Text>
            <TextInput
              type="number"
              value={config?.dayOfMonth?.toString() || ""}
              onChange={(e) => handleDayOfMonthChange(e.target.value)}
              placeholder="毎月の日付（1-31）"
              sx={{ width: "80px", "& input": { pr: "4px" } }}
              min={1}
              max={31}
              step={1}
            />
            <Text sx={{ fontSize: 1 }}>日</Text>
          </div>
        )}

        <div>
          <div style={{ marginBottom: "8px" }}>
            <Text sx={{ fontSize: 1, fontWeight: "600" }}>
              終了条件（任意）:
            </Text>
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "8px", paddingLeft: "8px" }}>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Text sx={{ fontSize: 1, minWidth: "60px" }}>終了日:</Text>
              <TextInput
                type="date"
                value={config?.endDate || ""}
                onChange={(e) => handleEndDateChange(e.target.value)}
                sx={{ width: "150px" }}
              />
            </div>
            <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
              <Text sx={{ fontSize: 1, minWidth: "60px" }}>最大回数:</Text>
              <TextInput
                type="number"
                value={config?.maxOccurrences?.toString() || ""}
                onChange={(e) => handleMaxOccurrencesChange(e.target.value)}
                placeholder="回数"
                sx={{ width: "80px", "& input": { pr: "4px" } }}
                min={1}
                step={1}
              />
              <Text sx={{ fontSize: 1 }}>回</Text>
            </div>
          </div>
        </div>

        <div>
          {config && (
            <div style={{ padding: "8px", background: "var(--bgColor-muted)", borderRadius: "var(--borderRadius-medium)", marginBottom: "8px" }}>
              <Text sx={{ fontSize: 0, color: "fg.muted" }}>
                設定内容: {getRecurrenceDescription(config)}
              </Text>
            </div>
          )}

          {errors.length > 0 && (
            <div style={{ marginBottom: "8px" }}>
              {errors.map((error, index) => (
                <Text
                  key={index}
                  sx={{ fontSize: 0, color: "danger.fg", display: "block" }}
                >
                  ※{error}
                </Text>
              ))}
            </div>
          )}
        </div>
      </div>
    </UnifiedDialog>
  );
};

export default RecurrenceDetailDialog;
