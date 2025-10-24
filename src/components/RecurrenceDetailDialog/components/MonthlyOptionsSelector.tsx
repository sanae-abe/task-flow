import React from "react";
import { Input } from "@/components/ui/input";
import type { RecurrenceConfig } from "../types";

interface MonthlyOptionsSelectorProps {
  config: RecurrenceConfig;
  onDayOfMonthChange: (value: string) => void;
}

const MonthlyOptionsSelector: React.FC<MonthlyOptionsSelectorProps> = ({
  config,
  onDayOfMonthChange,
}) => {
  if (config.pattern !== "monthly") {
    return null;
  }

  return (
    <div className="flex flex-row items-center gap-2">
      <label className="self-center min-w-[80px] text-sm">日付</label>
      <Input
        type="number"
        value={config.dayOfMonth?.toString() || ""}
        onChange={(e) => onDayOfMonthChange(e.target.value)}
        placeholder="毎月の日付（1-31）"
        className="w-[80px]"
        min={1}
        max={31}
        step={1}
      />
      <span className="text-sm">日</span>
    </div>
  );
};

export default MonthlyOptionsSelector;