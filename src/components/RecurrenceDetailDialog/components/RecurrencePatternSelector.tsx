import React from "react";
import { Input } from "@/components/ui/input";
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
  const getIntervalUnit = () => {
    switch (config.pattern) {
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

  return (
    <div className="flex flex-col gap-2">
      <div className="flex flex-row items-center gap-2">
        <label className="self-center min-w-[80px] text-sm">パターン</label>
        <select
          value={config.pattern || "daily"}
          onChange={(e) => onPatternChange(e.target.value)}
          className="w-[120px] h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          {PATTERN_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
      </div>

      <div className="flex flex-row items-center gap-2">
        <label className="self-center min-w-[80px] text-sm">間隔</label>
        <Input
          type="number"
          value={(config.interval || 1).toString()}
          onChange={(e) => onIntervalChange(e.target.value)}
          className="w-[80px]"
          min={1}
          step={1}
        />
        <span className="text-sm">{getIntervalUnit()}</span>
      </div>
    </div>
  );
};

export default RecurrencePatternSelector;