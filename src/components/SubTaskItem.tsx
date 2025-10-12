import React from "react";
import { Box } from "@primer/react";
import type { SubTask } from "../types";
import { useSubTaskEdit } from "./SubTaskItem/hooks/useSubTaskEdit";
import { useSubTaskDrag } from "./SubTaskItem/hooks/useSubTaskDrag";
import { EditingView } from "./SubTaskItem/components/EditingView";
import { DisplayView } from "./SubTaskItem/components/DisplayView";
import { DragHandleAndToggle } from "./SubTaskItem/components/DragHandleAndToggle";
import { subTaskItemStyles } from "./SubTaskItem/styles/subTaskItemStyles";

interface SubTaskItemProps {
  subTask: SubTask;
  onToggle: (subTaskId: string) => void;
  onEdit: (subTaskId: string, newTitle: string) => void;
  onDelete: (subTaskId: string) => void;
}

const SubTaskItem: React.FC<SubTaskItemProps> = ({
  subTask,
  onToggle,
  onEdit,
  onDelete,
}) => {
  // 編集機能のカスタムフック
  const {
    isEditing,
    editTitle,
    setEditTitle,
    inputRef,
    startEdit,
    saveEdit,
    cancelEdit,
    handleKeyDown,
  } = useSubTaskEdit({
    initialTitle: subTask.title,
    onEdit,
    subTaskId: subTask.id,
  });

  // ドラッグ&ドロップ機能のカスタムフック
  const { attributes, listeners, setNodeRef, style } = useSubTaskDrag({
    id: subTask.id,
  });

  // イベントハンドラー
  const handleToggle = (event: React.MouseEvent) => {
    event.stopPropagation();
    onToggle(subTask.id);
  };

  const handleDelete = (event: React.MouseEvent) => {
    event.stopPropagation();
    onDelete(subTask.id);
  };

  return (
    <Box ref={setNodeRef} style={style} sx={subTaskItemStyles.container}>
      {/* ドラッグハンドルとトグルボタン */}
      <DragHandleAndToggle
        subTask={subTask}
        onToggle={handleToggle}
        dragAttributes={attributes}
        dragListeners={listeners}
      />

      {/* 編集モードと表示モードの切り替え */}
      {isEditing ? (
        <EditingView
          editTitle={editTitle}
          setEditTitle={setEditTitle}
          inputRef={inputRef}
          onSave={saveEdit}
          onCancel={cancelEdit}
          onKeyDown={handleKeyDown}
        />
      ) : (
        <DisplayView
          subTask={subTask}
          onEdit={startEdit}
          onDelete={handleDelete}
        />
      )}
    </Box>
  );
};

export default SubTaskItem;
