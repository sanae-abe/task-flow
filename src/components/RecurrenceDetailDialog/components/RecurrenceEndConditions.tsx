import React from "react";
import { FormControl, Text, TextInput } from "@primer/react";
import { Timer } from "lucide-react";
import type { RecurrenceConfig } from "../types";

interface RecurrenceEndConditionsProps {
  config: RecurrenceConfig;
  onEndDateChange: (value: string) => void;
  onMaxOccurrencesChange: (value: string) => void;
}

const RecurrenceEndConditions: React.FC<RecurrenceEndConditionsProps> = ({
  config,
  onEndDateChange,
  onMaxOccurrencesChange,
}) => (
  <div style={{
    marginTop: "8px",
    borderTop: "1px solid var(--borderColor-muted)",
    paddingTop: "16px",
  }}>
    <div style={{ marginBottom: "8px" }}>
      <Text as="h3" sx={{ fontSize: 1, fontWeight: "600", display: "flex", alignItems: "center", gap: "4px" }}>
        <Timer size={16} />
        <span>終了条件</span>
      </Text>
    </div>
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        gap: "12px",
      }}
    >
      <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
        <FormControl.Label sx={{ alignSelf: "center", minWidth: "80px" }}>終了日</FormControl.Label>
        <TextInput
          type="date"
          value={config.endDate || ""}
          onChange={(e) => onEndDateChange(e.target.value)}
          sx={{ width: "150px", marginTop: "0 !important" }}
        />
      </FormControl>
      <FormControl sx={{ display: "flex", flexDirection: "row", alignItems: "center", gap: "8px" }}>
        <FormControl.Label sx={{ alignSelf: "center", minWidth: "80px" }}>最大回数</FormControl.Label>
        <TextInput
          type="number"
          value={config.maxOccurrences?.toString() || ""}
          onChange={(e) => onMaxOccurrencesChange(e.target.value)}
          placeholder="回数"
          sx={{ width: "80px", marginTop: "0 !important" }}
          min={1}
          step={1}
        />
        <Text sx={{ fontSize: 1 }}>回</Text>
      </FormControl>
    </div>
  </div>
);

export default RecurrenceEndConditions;