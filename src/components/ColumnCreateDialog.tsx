import React, { useState, useEffect } from 'react';
import { Box, Text, Button, TextInput } from '@primer/react';
import { XIcon } from '@primer/octicons-react';

interface ColumnCreateDialogProps {
  isOpen: boolean;
  onSave: (title: string) => void;
  onCancel: () => void;
}

const ColumnCreateDialog: React.FC<ColumnCreateDialogProps> = ({ 
  isOpen, 
  onSave, 
  onCancel 
}) => {
  const [title, setTitle] = useState('');

  useEffect(() => {
    if (isOpen) {
      setTitle('');
    }
  }, [isOpen]);

  const handleSave = () => {
    if (title.trim()) {
      onSave(title.trim());
    }
  };

  const handleKeyPress = (event: React.KeyboardEvent) => {
    if (event.key === 'Enter') {
      handleSave();
    } else if (event.key === 'Escape') {
      onCancel();
    }
  };

  if (!isOpen) {
    return null;
  }

  return (
    <Box
      sx={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        bg: 'primer.canvas.backdrop',
        zIndex: 1000,
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center'
      }}
      onClick={onCancel}
    >
      <Box
        sx={{
          bg: 'canvas.default',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          boxShadow: 'shadow.large',
          p: 4,
          minWidth: '400px',
          maxWidth: '500px'
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Box
          sx={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            mb: 3
          }}
        >
          <Text sx={{ fontSize: 2, fontWeight: 'bold' }}>
            新しいカラムを追加
          </Text>
          <Button
            variant="invisible"
            onClick={onCancel}
            sx={{ p: 1 }}
          >
            <XIcon size={16} />
          </Button>
        </Box>

        <Box sx={{ mb: 4, display: 'flex', flexDirection: 'column', gap: 1 }}>
          <Text sx={{ fontSize: 1, color: 'fg.muted' }}>
            カラム名
          </Text>
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="カラム名を入力"
            autoFocus
            sx={{ width: '100%' }}
          />
        </Box>

        <Box
          sx={{
            display: 'flex',
            justifyContent: 'flex-end',
            gap: 2
          }}
        >
          <Button
            onClick={onCancel}
          >
            キャンセル
          </Button>
          <Button
            variant="primary"
            onClick={handleSave}
            disabled={!title.trim()}
            sx={{ 
              color: 'fg.onEmphasis !important'
            }}
          >
            追加
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default ColumnCreateDialog;