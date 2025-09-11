import React, { useState, useEffect } from 'react';
import { Button, TextInput, Box, Text } from '@primer/react';

interface ColumnEditDialogProps {
  isOpen: boolean;
  currentTitle: string;
  onSave: (newTitle: string) => void;
  onCancel: () => void;
}

const ColumnEditDialog: React.FC<ColumnEditDialogProps> = ({
  isOpen,
  currentTitle,
  onSave,
  onCancel
}) => {
  const [title, setTitle] = useState(currentTitle);

  useEffect(() => {
    setTitle(currentTitle);
  }, [currentTitle, isOpen]);

  const handleSave = () => {
    const trimmedTitle = title.trim();
    if (trimmedTitle) {
      onSave(trimmedTitle);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSave();
    } else if (e.key === 'Escape') {
      e.preventDefault();
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
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: 'rgba(0, 0, 0, 0.4)',
        zIndex: 1000
      }}
      onClick={onCancel}
    >
      <Box
        sx={{
          backgroundColor: 'canvas.default',
          border: '1px solid',
          borderColor: 'border.default',
          borderRadius: 2,
          boxShadow: 'shadow.large',
          minWidth: '400px',
          maxWidth: '90vw'
        }}
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
      >
        <Box sx={{ p: 3, borderBottom: '1px solid', borderColor: 'border.muted' }}>
          <Text sx={{ fontSize: 2, fontWeight: 'bold' }}>
            カラム名を編集
          </Text>
        </Box>
        <Box sx={{ p: 3 }}>
          <Box sx={{ display: 'flex', flexDirection: 'column', gap: 1, mb: 3 }}>
            <Text sx={{ fontSize: 1, fontWeight: '600' }}>
              カラム名
            </Text>
            <TextInput
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              onKeyDown={handleKeyDown}
              placeholder="カラム名を入力"
              autoFocus
              sx={{ width: '100%' }}
            />
          </Box>
          <Box sx={{ display: 'flex', gap: 2, justifyContent: 'flex-end' }}>
            <Button onClick={onCancel}>
              キャンセル
            </Button>
            <Button 
              variant="primary" 
              onClick={handleSave}
              disabled={!title.trim()}
            >
              保存
            </Button>
          </Box>
        </Box>
      </Box>
    </Box>
  );
};

export default ColumnEditDialog;