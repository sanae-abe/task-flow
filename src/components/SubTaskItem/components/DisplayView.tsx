import React from "react";
import { Trash2, Edit } from "lucide-react";
import { cn } from '@/lib/utils';
import type { SubTask } from "../../../types";
import IconButton from "../../shared/IconButton";

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
      <span
        className={cn(
          "flex-1 text-sm text-foreground cursor-pointer",
          subTask.completed && "opacity-60 line-through"
        )}
      >
        {subTask.title}
      </span>
      <div className="action-buttons flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <IconButton
          icon={Edit}
          size="icon"
          onClick={onEdit}
          ariaLabel={`${subTask.title}を編集`}
          className="w-8 h-8 p-2"
          stopPropagation
        />
        <IconButton
          icon={Trash2}
          size="icon"
          onClick={onDelete}
          ariaLabel={`${subTask.title}を削除`}
          className="w-8 h-8 p-2"
          stopPropagation
        />
      </div>
    </>
  );