import React, { useMemo } from "react";

import { UnifiedForm, createSubTaskFormFields } from "./shared/Form";

interface SubTaskFormProps {
  title: string;
  onTitleChange: (title: string) => void;
  onSubmit: () => void;
  onCancel: () => void;
  onKeyDown: (event: React.KeyboardEvent) => void;
}

const SubTaskForm: React.FC<SubTaskFormProps> = ({
  title,
  onTitleChange,
  onSubmit,
  onCancel,
  onKeyDown,
}) => {
  // フォームフィールド設定を生成
  const formFields = useMemo(
    () =>
      createSubTaskFormFields(
        {
          title,
        },
        {
          setTitle: onTitleChange,
        },
        {
          onKeyDown,
        },
      ),
    [title, onTitleChange, onKeyDown],
  );

  return (
    <div className="flex items-center gap-2 rounded-md bg-background">
      <UnifiedForm
        fields={formFields}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitText="追加"
        cancelText="キャンセル"
        validateOnChange={false}
        validateOnBlur={false}
        sx={{
          "& > div > div": { mb: 0 }, // フォームコンテナの下マージン削除
          "& form": { display: "flex", alignItems: "center", gap: 2 },
        }}
        className="flex-1 "
      />
    </div>
  );
};

export default SubTaskForm;
