import { memo } from "react";

import type { ColumnEditDialogProps } from "../types/dialog";

import { SimpleFormDialog } from "./shared/Dialog";

const ColumnEditDialog = memo<ColumnEditDialogProps>(
  ({ isOpen, currentTitle, onSave, onCancel }) => (
    <SimpleFormDialog
      isOpen={isOpen}
      title="カラム名を編集"
      fieldLabel="カラム名"
      placeholder="カラム名を入力"
      saveText="保存"
      initialValue={currentTitle}
      onSave={onSave}
      onCancel={onCancel}
      onClose={onCancel}
    />
  ),
);

export default ColumnEditDialog;
