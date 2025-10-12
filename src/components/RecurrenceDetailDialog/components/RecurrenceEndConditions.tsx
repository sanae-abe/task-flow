import React from "react";
import { Text, TextInput } from "@primer/react";
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
    <div>
      <div style={{ marginBottom: "8px" }}>
        <Text sx={{ fontSize: 1, fontWeight: "600" }}>
          終了条件（任意）:
        </Text>
      </div>
      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "8px",
          paddingLeft: "8px"
        }}
      >
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Text sx={{ fontSize: 1, minWidth: "60px" }}>終了日:</Text>
          <TextInput
            type="date"
            value={config.endDate || ""}
            onChange={(e) => onEndDateChange(e.target.value)}
            sx={{ width: "150px" }}
          />
        </div>
        <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
          <Text sx={{ fontSize: 1, minWidth: "60px" }}>最大回数:</Text>
          <TextInput
            type="number"
            value={config.maxOccurrences?.toString() || ""}
            onChange={(e) => onMaxOccurrencesChange(e.target.value)}
            placeholder="回数"
            sx={{ width: "80px" }}
            min={1}
            step={1}
          />
          <Text sx={{ fontSize: 1 }}>回</Text>
        </div>
      </div>
    </div>
  );

export default RecurrenceEndConditions;