import React from "react";
import { Input } from "@/components/ui/input";
import { Check, X } from "lucide-react";
import IconButton from "../../shared/IconButton";

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
      <Input
        ref={inputRef}
        value={editTitle}
        onChange={(e) => setEditTitle(e.target.value)}
        onKeyDown={onKeyDown}
        className="flex-1 h-8 text-sm"
      />
      <div className="flex items-center opacity-0 group-hover:opacity-100 transition-opacity">
        <IconButton
          icon={Check}
          size="icon"
          onClick={onSave}
          ariaLabel="編集を保存"
          className="w-8 h-8 p-2"
          stopPropagation
        />
        <IconButton
          icon={X}
          size="icon"
          onClick={onCancel}
          ariaLabel="編集をキャンセル"
          className="w-8 h-8 p-2"
          stopPropagation
        />
      </div>
    </>
  );