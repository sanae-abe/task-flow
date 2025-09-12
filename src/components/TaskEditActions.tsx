import { TrashIcon } from '@primer/octicons-react';
import { Box, Button } from '@primer/react';
import { memo } from 'react';

interface TaskEditActionsProps {
  onSave: () => void;
  onDelete: () => void;
  onCancel: () => void;
  isValid: boolean;
}

const TaskEditActions = memo<TaskEditActionsProps>(({
  onSave,
  onDelete,
  onCancel,
  isValid
}) => (
    <Box
      sx={{
        display: 'flex',
        justifyContent: 'space-between',
        gap: 2,
        mt: 4
      }}
    >
      <Button
        onClick={onDelete}
        variant="danger"
        leadingVisual={TrashIcon}
        aria-label="タスクを削除"
      >
        削除
      </Button>
      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button onClick={onCancel}>
          キャンセル
        </Button>
        <Button
          variant="primary"
          onClick={onSave}
          disabled={!isValid}
          sx={{ color: 'fg.onEmphasis !important' }}
        >
          保存
        </Button>
      </Box>
    </Box>
  ));

export default TaskEditActions;