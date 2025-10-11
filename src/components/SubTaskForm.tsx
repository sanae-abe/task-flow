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
    <div
      style={{
        display: "flex",
        alignItems: "center",
        gap: "var(--primer-control-small-gap, 0.5rem)",
        borderRadius: "var(--primer-borderRadius-medium, 6px)",
        backgroundColor: "var(--primer-canvas-default)",
      }}
    >
      <UnifiedForm
        fields={formFields}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitText="追加"
        cancelText="キャンセル"
        validateOnChange={false}
        validateOnBlur={false}
        sx={{
          flex: 1,
          "& > div > div": { mb: 0 }, // フォームコンテナの下マージン削除
          "& form": { display: "flex", alignItems: "center", gap: 2 },
        }}
      />
    </div>
  );
};

export default SubTaskForm;
