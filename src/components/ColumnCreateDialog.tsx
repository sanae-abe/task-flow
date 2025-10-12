import { memo, useState, useEffect, useCallback, useMemo } from "react";
import { FormControl, Select } from "@primer/react";

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
          <div style={{ marginBottom: "24px" }}>
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
          <div style={{ display: "flex", flexDirection: "column", gap: "4px" }}>
            <FormControl.Label htmlFor="insert-position-select">
              挿入位置
            </FormControl.Label>
            <Select
              id="insert-position-select"
              value={insertIndex.toString()}
              onChange={(e) => setInsertIndex(parseInt(e.target.value, 10))}
            >
              {positionOptions.map((option) => (
                <Select.Option
                  key={option.value}
                  value={option.value.toString()}
                >
                  {option.label}
                </Select.Option>
              ))}
            </Select>
          </div>
        </div>
      </UnifiedDialog>
    );
  },
);

ColumnCreateDialog.displayName = "ColumnCreateDialog";

export default ColumnCreateDialog;
