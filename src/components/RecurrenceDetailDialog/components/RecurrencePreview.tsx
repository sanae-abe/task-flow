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
    <div className="mt-5 p-2 bg-neutral-100 rounded-md border border-border">
      <span className="text-sm">
        設定内容: {getRecurrenceDescription(config)}
      </span>
    </div>
  );
};

export default RecurrencePreview;