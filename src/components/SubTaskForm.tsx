import { Box } from '@primer/react';
import React, { useMemo } from 'react';

import { UnifiedForm, createSubTaskFormFields } from './shared/Form';

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
  onKeyDown
}) => {
  // フォームフィールド設定を生成
  const formFields = useMemo(() => createSubTaskFormFields(
    {
      title
    },
    {
      setTitle: onTitleChange
    },
    {
      onKeyDown
    }
  ), [title, onTitleChange, onKeyDown]);

  return (
    <Box
      sx={{
        display: 'flex',
        alignItems: 'center',
        gap: 2,
        borderRadius: 2,
        bg: 'canvas.default'
      }}
    >
      <UnifiedForm
        fields={formFields}
        onSubmit={onSubmit}
        onCancel={onCancel}
        submitText="追加"
        cancelText="キャンセル"
        disabled={!title.trim()}
        validateOnChange={false}
        validateOnBlur={false}
        sx={{ 
          flex: 1,
          '& > div': { mb: 0 }, // フォームコンテナの下マージンを削除
          '& form': { display: 'flex', alignItems: 'center', gap: 2 }
        }}
      />
    </Box>
  );
};

export default SubTaskForm;