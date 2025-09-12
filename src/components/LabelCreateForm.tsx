import { Box, Button, TextInput, Text } from '@primer/react';
import React, { memo } from 'react';

import ColorSelector from './ColorSelector';

interface LabelCreateFormProps {
  labelName: string;
  selectedColor: string;
  onLabelNameChange: (name: string) => void;
  onColorSelect: (color: string) => void;
  onSave: () => void;
  onCancel: () => void;
  onKeyDown: (e: React.KeyboardEvent<HTMLInputElement>) => void;
  isValid: boolean;
}

const LabelCreateForm = memo<LabelCreateFormProps>(({
  labelName,
  selectedColor,
  onLabelNameChange,
  onColorSelect,
  onSave,
  onCancel,
  onKeyDown,
  isValid
}) => (
    <Box sx={{ 
      p: 3, 
      bg: 'canvas.subtle', 
      borderRadius: 2, 
      border: '1px solid', 
      borderColor: 'border.default' 
    }}>
      <Box sx={{ mb: 2 }}>
        <Text sx={{ fontSize: 1, fontWeight: '400', mb: 1, display: 'block' }}>
          ラベル名
        </Text>
        <TextInput
          value={labelName}
          onChange={(e) => onLabelNameChange(e.target.value)}
          placeholder="ラベル名を入力"
          sx={{ width: '100%' }}
          onKeyDown={onKeyDown}
          autoFocus
        />
      </Box>

      <Box sx={{ mb: 3 }}>
        <ColorSelector
          selectedColor={selectedColor}
          onColorSelect={onColorSelect}
        />
      </Box>

      <Box sx={{ display: 'flex', gap: 2 }}>
        <Button
          onClick={onSave}
          variant="primary"
          size="small"
          disabled={!isValid}
        >
          作成
        </Button>
        <Button
          onClick={onCancel}
          size="small"
        >
          キャンセル
        </Button>
      </Box>
    </Box>
  ));

export default LabelCreateForm;