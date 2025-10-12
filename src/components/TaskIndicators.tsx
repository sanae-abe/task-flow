import { CheckIcon, PaperclipIcon } from "@primer/octicons-react";
import { Text } from "@primer/react";
import React from "react";

import type { SubTask, FileAttachment } from "../types";

const INDICATOR_STYLES = {
  container: {
    display: "flex",
    alignItems: "center",
    gap: "4px",
    paddingInline: "4px",
    paddingBlock: "4px",
    borderRadius: "var(--borderRadius-medium)",
    fontSize: "12px",
    fontWeight: "400",
    alignSelf: "flex-start" as const,
    color: "var(--fgColor-muted)",
  },
} as const;

interface TaskIndicatorsProps {
  subTasks?: SubTask[];
  attachments?: FileAttachment[];
}

const TaskIndicators: React.FC<TaskIndicatorsProps> = ({
  subTasks,
  attachments,
}) => {
  const hasSubTasks = subTasks && subTasks.length > 0;
  const hasAttachments = attachments && attachments.length > 0;

  if (!hasSubTasks && !hasAttachments) {
    return null;
  }

  return (
    <div style={{ display: "flex", justifyContent: "flex-end", gap: "8px" }}>
      {hasSubTasks && (
        <div style={INDICATOR_STYLES.container}>
          <CheckIcon size={12} />
          <Text sx={{ fontSize: 0 }}>
            {subTasks.filter((sub) => sub.completed).length}/{subTasks.length}
          </Text>
        </div>
      )}

      {hasAttachments && (
        <div style={INDICATOR_STYLES.container}>
          <PaperclipIcon size={12} />
          <Text sx={{ fontSize: 0 }}>{attachments.length}</Text>
        </div>
      )}
    </div>
  );
};

export default TaskIndicators;
