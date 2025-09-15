import { Box, Button, Text, Textarea } from '@primer/react';
import React, { useState, useCallback } from 'react';

import CommonDialog from './CommonDialog';

interface CodeInsertDialogProps {
  isOpen: boolean;
  initialCode?: string;
  onInsert: (code: string) => void;
  onCancel: () => void;
}

const CodeInsertDialog: React.FC<CodeInsertDialogProps> = ({
  isOpen,
  initialCode = '',
  onInsert,
  onCancel,
}) => {
  const [code, setCode] = useState(initialCode);

  const handleInsert = useCallback(() => {
    if (code.trim()) {
      onInsert(code.trim());
      setCode('');
    }
  }, [code, onInsert]);

  const handleCancel = useCallback(() => {
    setCode('');
    onCancel();
  }, [onCancel]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && e.ctrlKey && code.trim()) {
      e.preventDefault();
      handleInsert();
    }
  }, [handleInsert, code]);

  // ダイアログが開かれたときに初期コードを設定
  React.useEffect(() => {
    if (isOpen) {
      setCode(initialCode);
    }
  }, [isOpen, initialCode]);

  return (
    <CommonDialog
      title="コードを挿入"
      isOpen={isOpen}
      onClose={handleCancel}
      size="large"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
        <Box>
          <Text sx={{ fontSize: 1, mb: 2, display: 'block', fontWeight: '700' }}>
            コード <span style={{ color: '#d1242f' }}>*</span>
          </Text>
          <Textarea
            value={code}
            onChange={(e) => setCode(e.target.value)}
            placeholder="コードを入力してください..."
            onKeyDown={handleKeyPress}
            autoFocus
            rows={6}
            sx={{
              width: '100%',
              fontFamily: "'SFMono-Regular', Consolas, 'Liberation Mono', Menlo, monospace",
              fontSize: '13px',
            }}
          />
          <Text sx={{ fontSize: 0, color: 'fg.muted', mt: 1 }}>
            Ctrl+Enter で挿入
          </Text>
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          p: 3,
          borderTop: '1px solid',
          borderColor: 'border.default',
        }}
      >
        <Button onClick={handleCancel} variant="default">
          キャンセル
        </Button>
        <Button
          onClick={handleInsert}
          variant="primary"
          disabled={!code.trim()}
        >
          挿入
        </Button>
      </Box>
    </CommonDialog>
  );
};

export default CodeInsertDialog;