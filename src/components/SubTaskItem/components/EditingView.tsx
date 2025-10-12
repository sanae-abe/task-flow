import React from "react";
import { Box, TextInput } from "@primer/react";
import { CheckIcon, XIcon } from "@primer/octicons-react";
import IconButton from "../../shared/IconButton";
import { subTaskItemStyles } from "../styles/subTaskItemStyles";

interface EditingViewProps {
  editTitle: string;
  setEditTitle: (title: string) => void;
  inputRef: React.RefObject<HTMLInputElement | null>;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

export const EditingView: React.FC<EditingViewProps> = ({
  editTitle,
  setEditTitle,
  inputRef,
  onSave,
  onCancel,
  onKeyDown,
}) => (
    <>
      <TextInput
        ref={inputRef}
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        onKeyDown={onKeyDown}
        sx={subTaskItemStyles.textInput}
        size="small"
      />
      <Box sx={subTaskItemStyles.editActionsContainer}>
        <IconButton
          icon={CheckIcon}
          onClick={onSave}
          ariaLabel="編集を保存"
          size="small"
          stopPropagation
          sx={subTaskItemStyles.saveButton}
        />
        <IconButton
          icon={XIcon}
          onClick={onCancel}
          ariaLabel="編集をキャンセル"
          size="small"
          stopPropagation
          sx={subTaskItemStyles.cancelButton}
        />
      </Box>
    </>
  );