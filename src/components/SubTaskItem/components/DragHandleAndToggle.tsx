import React from "react";
import { Box } from "@primer/react";
import {
  CheckCircleIcon,
  CheckCircleFillIcon,
  GrabberIcon,
} from "@primer/octicons-react";
import type { DraggableAttributes } from "@dnd-kit/core";
import type { SyntheticListenerMap } from "@dnd-kit/core/dist/hooks/utilities";
import type { SubTask } from "../../../types";
import IconButton from "../../shared/IconButton";
import { subTaskItemStyles } from "../styles/subTaskItemStyles";

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
    <div style={{ display: "flex", alignItems: "center" }}>
      <Box
        {...dragAttributes}
        {...dragListeners}
        className="drag-handle"
        sx={subTaskItemStyles.dragHandle}
      >
        <GrabberIcon size={16} />
      </Box>

      <IconButton
        icon={subTask.completed ? CheckCircleFillIcon : CheckCircleIcon}
        onClick={onToggle}
        ariaLabel={`${subTask.title}を${
          subTask.completed ? "未完了" : "完了"
        }にする`}
        variant="success"
        size="small"
        stopPropagation
        sx={subTaskItemStyles.toggleButton}
      />
    </div>
  );