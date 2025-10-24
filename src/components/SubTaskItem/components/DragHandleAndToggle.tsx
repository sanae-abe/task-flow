import React from "react";
import {
  CheckCircle,
  CheckCircle2,
  GripVertical,
} from "lucide-react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { SubTask } from "../../../types";
import IconButton from "../../shared/IconButton";

interface DragHandleAndToggleProps {
  subTask: SubTask;
  onToggle: (event: React.MouseEvent) => void;
  dragAttributes: DraggableAttributes;
  dragListeners: SyntheticListenerMap | undefined;
}

export const DragHandleAndToggle: React.FC<DragHandleAndToggleProps> = ({
  subTask,
  onToggle,
  dragAttributes,
  dragListeners,
}) => (
    <div className="flex items-center">
      <div
        {...dragAttributes}
        {...dragListeners}
        className="drag-handle p-1 cursor-grab hover:bg-gray-100 rounded"
      >
        <GripVertical size={16} className="text-gray-500" />
      </div>

      <IconButton
        icon={subTask.completed ? CheckCircle2 : CheckCircle}
        onClick={onToggle}
        ariaLabel={`${subTask.title}を${
          subTask.completed ? "未完了" : "完了"
        }にする`}
        variant="success"
        stopPropagation
      />
    </div>
  );