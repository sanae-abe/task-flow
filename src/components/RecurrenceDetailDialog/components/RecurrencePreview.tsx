import React from "react";
import { Text } from "@primer/react";
import type { RecurrenceConfig } from "../types";
import { getRecurrenceDescription } from "../../../utils/recurrence";

interface RecurrencePreviewProps {
  config: RecurrenceConfig;
}

const RecurrencePreview: React.FC<RecurrencePreviewProps> = ({ config }) => {
  if (!config) {
    return null;
  }

  return (
    <div
      style={{
        marginTop: "20px",
        padding: "8px",
        background: "var(--bgColor-muted)",
        borderRadius: "var(--borderRadius-medium)",
        border: "1px solid var(--borderColor-muted)",
      }}
    >
      <Text sx={{ fontSize: 0, color: "fg.muted" }}>
        設定内容: {getRecurrenceDescription(config)}
      </Text>
    </div>
  );
};

export default RecurrencePreview;