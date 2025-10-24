import React from "react";
import type { SubTask } from "../../types";
import { useSubTaskEdit } from "./hooks/useSubTaskEdit";
import { useSubTaskDrag } from "./hooks/useSubTaskDrag";
import { EditingView } from "./components/EditingView";
import { DisplayView } from "./components/DisplayView";
import { DragHandleAndToggle } from "./components/DragHandleAndToggle";

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
    <div
      ref={setNodeRef}
      style={style}
      className="group flex items-center gap-2 rounded bg-background cursor-pointer relative hover:bg-muted transition-colors"
    >
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
    </div>
  );
};

export default SubTaskItem;