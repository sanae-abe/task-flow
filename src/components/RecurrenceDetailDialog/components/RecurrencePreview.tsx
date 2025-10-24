import React from "react";
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
        background: "var(--color-neutral-100)",
        borderRadius: "var(--borderRadius-medium)",
        border: "1px solid var(--borderColor-muted)",
      }}
    >
      <span className="text-sm text-muted-foreground">
        設定内容: {getRecurrenceDescription(config)}
      </span>
    </div>
  );
};

export default RecurrencePreview;