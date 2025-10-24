import React from "react";

import type { Task } from "../types";
import { formatDateTime } from "../utils/dateHelpers";

interface TaskMetadataProps {
  task: Task;
}

const TaskMetadata: React.FC<TaskMetadataProps> = ({ task }) => (
  <div className="mb-4">
    <h3 className="text-sm m-0 mb-2 font-bold">
      作成/更新日時
    </h3>
    <div className="p-3 flex flex-col gap-1 bg-gray-50 text-sm">
      <p>作成日時: {formatDateTime(task.createdAt)}</p>
      <p>更新日時: {formatDateTime(task.updatedAt)}</p>
    </div>
  </div>
);

export default TaskMetadata;
