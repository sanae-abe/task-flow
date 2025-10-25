import React from "react";
import {
  CircleCheck,
  GripVertical,
} from "lucide-react";
import CircleCheck2Icon from "../../shared/icons/CircleCheck2Icon";
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
        className="drag-handle p-1 cursor-grab"
      >
        <GripVertical size={16} className="text-gray-500" />
      </div>

      <IconButton
        icon={subTask.completed ? CircleCheck2Icon : CircleCheck}
        onClick={onToggle}
        ariaLabel={`${subTask.title}を${
          subTask.completed ? "未完了" : "完了"
        }にする`}
        variant="success"
        stopPropagation
      />
    </div>
  );