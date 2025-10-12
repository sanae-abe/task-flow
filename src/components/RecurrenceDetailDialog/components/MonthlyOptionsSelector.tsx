import React from "react";
import { Text, TextInput } from "@primer/react";
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
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Text sx={{ fontSize: 1, minWidth: "60px" }}>日付:</Text>
      <TextInput
        type="number"
        value={config.dayOfMonth?.toString() || ""}
        onChange={(e) => onDayOfMonthChange(e.target.value)}
        placeholder="毎月の日付（1-31）"
        sx={{ width: "80px" }}
        min={1}
        max={31}
        step={1}
      />
      <Text sx={{ fontSize: 1 }}>日</Text>
    </div>
  );
};

export default MonthlyOptionsSelector;