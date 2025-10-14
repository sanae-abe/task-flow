import React from "react";
import { Text, TextInput, FormControl } from "@primer/react";
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
    <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
      <FormControl.Label sx={{ alignSelf: "center", minWidth: "80px" }}>日付</FormControl.Label>
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
    </FormControl>
  );
};

export default MonthlyOptionsSelector;