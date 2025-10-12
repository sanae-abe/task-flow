import type { RecurrenceConfig, RecurrencePattern } from "../../../types";

export interface RecurrenceDetailDialogProps {
  isOpen: boolean;
  recurrence?: RecurrenceConfig;
  onClose: () => void;
  onSave: (recurrence: RecurrenceConfig | undefined) => void;
}

export interface PatternOption {
  value: RecurrencePattern;
  label: string;
}

export interface WeekdayOption {
  value: number;
  label: string;
}

export * from "../../../types";