import { useCallback } from "react";
import type { RecurrenceConfig, RecurrencePattern } from "../../../types";

interface UseRecurrenceHandlersProps {
  setConfig: React.Dispatch<React.SetStateAction<RecurrenceConfig>>;
}

export interface RecurrenceHandlers {
  handlePatternChange: (value: string) => void;
  handleIntervalChange: (value: string) => void;
  handleDaysOfWeekChange: (day: number, checked: boolean) => void;
  handleDayOfMonthChange: (value: string) => void;
  handleEndDateChange: (value: string | null) => void;
  handleMaxOccurrencesChange: (value: string) => void;
}

export const useRecurrenceHandlers = ({
  setConfig,
}: UseRecurrenceHandlersProps): RecurrenceHandlers => {
  const handlePatternChange = useCallback(
    (value: string) => {
      setConfig((prev) => ({
        ...prev,
        pattern: value as RecurrencePattern,
        daysOfWeek: value === "weekly" ? [new Date().getDay()] : undefined,
        dayOfMonth: value === "monthly" ? new Date().getDate() : undefined,
      }));
    },
    [setConfig]
  );

  const handleIntervalChange = useCallback(
    (value: string) => {
      const interval = parseInt(value, 10);
      if (!isNaN(interval) && interval > 0) {
        setConfig((prev) => ({ ...prev, interval }));
      }
    },
    [setConfig]
  );

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
    [setConfig]
  );

  const handleDayOfMonthChange = useCallback(
    (value: string) => {
      const dayOfMonth = parseInt(value, 10);
      if (!isNaN(dayOfMonth) && dayOfMonth >= 1 && dayOfMonth <= 31) {
        setConfig((prev) => ({ ...prev, dayOfMonth }));
      }
    },
    [setConfig]
  );

  const handleEndDateChange = useCallback(
    (value: string | null) => {
      setConfig((prev) => ({
        ...prev,
        endDate: value || undefined,
        maxOccurrences: value ? undefined : prev.maxOccurrences,
      }));
    },
    [setConfig]
  );

  const handleMaxOccurrencesChange = useCallback(
    (value: string) => {
      const maxOccurrences = parseInt(value, 10);
      if (value === "" || (!isNaN(maxOccurrences) && maxOccurrences > 0)) {
        setConfig((prev) => ({
          ...prev,
          maxOccurrences: value === "" ? undefined : maxOccurrences,
          endDate: value !== "" ? undefined : prev.endDate,
        }));
      }
    },
    [setConfig]
  );

  return {
    handlePatternChange,
    handleIntervalChange,
    handleDaysOfWeekChange,
    handleDayOfMonthChange,
    handleEndDateChange,
    handleMaxOccurrencesChange,
  };
};