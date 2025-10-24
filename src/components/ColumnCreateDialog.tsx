import { memo, useState, useEffect, useCallback, useMemo } from "react";

import type { ColumnCreateDialogProps } from "../types/dialog";
import UnifiedDialog from "./shared/Dialog/UnifiedDialog";
import { UnifiedFormField } from "./shared/Form";

const ColumnCreateDialog = memo<ColumnCreateDialogProps>(
  ({ isOpen, onSave, onCancel, columns = [] }) => {
    const [title, setTitle] = useState("");
    const [insertIndex, setInsertIndex] = useState<number>(columns.length);

    useEffect(() => {
      if (isOpen) {
        setTitle("");
        setInsertIndex(columns.length); // デフォルトは最後
      }
    }, [isOpen, columns.length]);

    const handleSave = useCallback(() => {
      if (title.trim()) {
        onSave(title.trim(), insertIndex);
        setTitle("");
        setInsertIndex(columns.length);
      }
    }, [title, insertIndex, onSave, columns.length]);

    const positionOptions = useMemo(() => {
      const options = [{ value: 0, label: "最初" }];

      columns.forEach((column, index) => {
        options.push({
          value: index + 1,
          label: `「${column.title}」の後`,
        });
      });

      return options;
    }, [columns]);

    const actions = [
      {
        label: "キャンセル",
        onClick: onCancel,
        variant: "default" as const,
      },
      {
        label: "追加",
        onClick: handleSave,
        variant: "primary" as const,
        disabled: !title.trim(),
      },
    ];

    return (
      <UnifiedDialog
        isOpen={isOpen}
        title="新しいカラムを追加"
        onClose={onCancel}
        actions={actions}
        size="medium"
        closeOnEscape
        closeOnBackdropClick
      >
        <div>
          <div className="mb-6">
            <UnifiedFormField
              id="column-title-input"
              name="column-title-input"
              type="text"
              label="カラム名"
              value={title}
              placeholder="カラム名を入力"
              onChange={(value) => setTitle(value as string)}
              autoFocus
              validation={{ required: true }}
            />
          </div>
          <div className="flex flex-col gap-1">
            <label className="text-sm font-medium" htmlFor="insert-position-select">
              挿入位置
            </label>
            <select
              id="insert-position-select"
              value={insertIndex.toString()}
              onChange={(e) => setInsertIndex(parseInt(e.target.value, 10))}
              className="w-full h-10 px-3 py-2 border border-input bg-background rounded-md text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              {positionOptions.map((option) => (
                <option
                  key={option.value}
                  value={option.value.toString()}
                >
                  {option.label}
                </option>
              ))}
            </select>
          </div>
        </div>
      </UnifiedDialog>
    );
  },
);

ColumnCreateDialog.displayName = "ColumnCreateDialog";

export default ColumnCreateDialog;