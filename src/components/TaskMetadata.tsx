import { Text, Heading } from "@primer/react";
import React from "react";

import type { Task } from "../types";
import { formatDateTime } from "../utils/dateHelpers";

interface TaskMetadataProps {
  task: Task;
}

const TaskMetadata: React.FC<TaskMetadataProps> = ({ task }) => (
  <div style={{ marginBottom: "16px" }}>
    <Heading sx={{ fontSize: 1, margin: 0, mb: 2, fontWeight: "700" }}>
      作成/更新日時
    </Heading>
    <div
      style={{
        padding: "12px",
        display: "flex",
        flexDirection: "column",
        gap: "4px",
        backgroundColor: "var(--bgColor-muted)",
        fontSize: "14px",
      }}
    >
      <Text>作成日時: {formatDateTime(task.createdAt)}</Text>
      <Text>更新日時: {formatDateTime(task.updatedAt)}</Text>
    </div>
  </div>
);

export default TaskMetadata;
