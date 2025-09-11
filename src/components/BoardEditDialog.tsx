import React, { useState, useEffect } from 'react';
import { Box, Text, Button, TextInput } from '@primer/react';
import { XIcon } from '@primer/octicons-react';

interface BoardEditDialogProps {
  isOpen: boolean;
  currentTitle: string;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
}

const BoardEditDialog: React.FC<BoardEditDialogProps> = ({ 
  isOpen, 
  currentTitle, 
  onSave, 
  onCancel 
}) => {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    if (isOpen) {
      setTitle(currentTitle);
    }
  }, [isOpen, currentTitle]);

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
            ボード名を編集
          </Text>
          <Button
            variant="invisible"
            onClick={onCancel}
            sx={{ p: 1 }}
          >
            <XIcon size={16} />
          </Button>
        </Box>

        <Box sx={{ mb: 4 }}>
          <Text sx={{ fontSize: 1, color: 'fg.muted', mb: 2 }}>
            ボード名
          </Text>
          <TextInput
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            onKeyDown={handleKeyPress}
            placeholder="ボード名を入力"
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
            保存
          </Button>
        </Box>
      </Box>
    </Box>
  );
};

export default BoardEditDialog;