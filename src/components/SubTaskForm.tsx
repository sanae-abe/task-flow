import React, { useMemo } from "react";

import { UnifiedForm, type FormFieldConfig } from "./shared/Form";

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
  // フォームフィールドを直接定義
  const formFields = useMemo(
    (): FormFieldConfig[] => [
      {
        id: "subtask-title",
        name: "title",
        type: "text",
        label: "サブタスク名",
        value: title,
        placeholder: "サブタスク名を入力...",
        onChange: onTitleChange as (value: unknown) => void,
        onKeyDown,
        autoFocus: true,
        hideLabel: true,
        disabled: false,
        validation: { required: true, minLength: 1, maxLength: 100 },
      },
    ],
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
        style={{
          "& > div > div": { mb: 0 }, // フォームコンテナの下マージン削除
          "& form": { display: "flex", alignItems: "center", gap: 2 },
        }}
        className="flex-1 "
      />
    </div>
  );
};

export default SubTaskForm;
