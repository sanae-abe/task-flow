import React from "react";
import { Box, Text } from "@primer/react";
import { TrashIcon, PencilIcon } from "@primer/octicons-react";
import type { SubTask } from "../../../types";
import IconButton from "../../shared/IconButton";
import { subTaskItemStyles } from "../styles/subTaskItemStyles";

interface DisplayViewProps {
  subTask: SubTask;
  onEdit: (event: React.MouseEvent) => void;
  onDelete: (event: React.MouseEvent) => void;
}

export const DisplayView: React.FC<DisplayViewProps> = ({
  subTask,
  onEdit,
  onDelete,
}) => (
    <>
      <Text
        sx={{
          ...subTaskItemStyles.taskText,
          opacity: subTask.completed ? 0.6 : 1,
        }}
      >
        {subTask.title}
      </Text>
      <Box className="action-buttons" sx={subTaskItemStyles.actionButtons}>
        <IconButton
          icon={PencilIcon}
          onClick={onEdit}
          ariaLabel={`${subTask.title}を編集`}
          size="small"
          stopPropagation
          sx={subTaskItemStyles.editButton}
        />
        <IconButton
          icon={TrashIcon}
          onClick={onDelete}
          ariaLabel={`${subTask.title}を削除`}
          size="small"
          stopPropagation
          sx={subTaskItemStyles.deleteButton}
        />
      </Box>
    </>
  );