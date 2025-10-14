import React from "react";
import { Text, Select, TextInput, FormControl } from "@primer/react";
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
    <div style={{ display: "flex", flexDirection: "column", gap: "8px" }}>
      <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
        <FormControl.Label sx={{ alignSelf: "center", minWidth: "80px" }}>パターン</FormControl.Label>
        <Select
          value={config.pattern || "daily"}
          onChange={(e) => onPatternChange(e.target.value)}
          sx={{ width: "120px" }}
        >
          {PATTERN_OPTIONS.map((option) => (
            <Select.Option key={option.value} value={option.value}>
              {option.label}
            </Select.Option>
          ))}
        </Select>
      </FormControl>

      <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
        <FormControl.Label sx={{ alignSelf: "center", minWidth: "80px" }}>間隔</FormControl.Label>
        <TextInput
          type="number"
          value={(config.interval || 1).toString()}
          onChange={(e) => onIntervalChange(e.target.value)}
          sx={{ width: "80px" }}
          min={1}
          step={1}
        />
        <Text sx={{ fontSize: 1 }}>{getIntervalUnit()}</Text>
      </FormControl>
    </div>
  );
};

export default RecurrencePatternSelector;