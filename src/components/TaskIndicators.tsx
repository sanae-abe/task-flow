import { Check, Paperclip } from "lucide-react";
import React from "react";

import type { SubTask, FileAttachment } from "../types";

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
    <div className="flex justify-end gap-2">
      {hasSubTasks && (
        <div className="flex items-center gap-1 px-1 py-1 rounded text-xs font-normal self-start text-zinc-500">
          <Check size={12} />
          <span className="text-xs">
            {subTasks.filter((sub) => sub.completed).length}/{subTasks.length}
          </span>
        </div>
      )}

      {hasAttachments && (
        <div className="flex items-center gap-1 px-1 py-1 rounded text-xs font-normal self-start text-zinc-500">
          <Paperclip size={12} />
          <span className="text-xs">{attachments.length}</span>
        </div>
      )}
    </div>
  );
};

export default TaskIndicators;
