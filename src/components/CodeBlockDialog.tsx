import { Box, Button, Text, Textarea, TextInput } from '@primer/react';
import React, { useState, useCallback } from 'react';

import CommonDialog from './CommonDialog';

interface CodeBlockDialogProps {
  isOpen: boolean;
  initialCode?: string;
  onInsert: (code: string, language?: string) => void;
  onCancel: () => void;
}

const CodeBlockDialog: React.FC<CodeBlockDialogProps> = ({
  isOpen,
  initialCode = '',
  onInsert,
  onCancel,
}) => {
  const [code, setCode] = useState(initialCode);
  const [language, setLanguage] = useState('');

  const handleInsert = useCallback(() => {
    if (code.trim()) {
      onInsert(code.trim(), language.trim() || undefined);
      setCode('');
      setLanguage('');
    }
  }, [code, language, onInsert]);

  const handleCancel = useCallback(() => {
    setCode('');
    setLanguage('');
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
      title="コードブロックを挿入"
      isOpen={isOpen}
      onClose={handleCancel}
      size="large"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, p: 3 }}>
        <Box>
          <Text sx={{ fontSize: 1, mb: 2, display: 'block', fontWeight: '700' }}>
            言語（任意）
          </Text>
          <TextInput
            value={language}
            onChange={(e) => setLanguage(e.target.value)}
            placeholder="javascript, python, html など"
            sx={{ width: '100%' }}
          />
        </Box>

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
            rows={12}
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

export default CodeBlockDialog;