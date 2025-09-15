import { Box, Button, Text, TextInput } from '@primer/react';
import React, { useState, useCallback } from 'react';

import CommonDialog from './CommonDialog';

interface LinkInsertDialogProps {
  isOpen: boolean;
  onInsert: (url: string, text?: string) => void;
  onCancel: () => void;
}

const LinkInsertDialog: React.FC<LinkInsertDialogProps> = ({
  isOpen,
  onInsert,
  onCancel,
}) => {
  const [url, setUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  const handleInsert = useCallback(() => {
    if (url.trim()) {
      onInsert(url.trim(), linkText.trim() || undefined);
      setUrl('');
      setLinkText('');
    }
  }, [url, linkText, onInsert]);

  const handleCancel = useCallback(() => {
    setUrl('');
    setLinkText('');
    onCancel();
  }, [onCancel]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && url.trim()) {
      e.preventDefault();
      handleInsert();
    }
  }, [handleInsert, url]);

  return (
    <CommonDialog
      title="リンクを挿入"
      isOpen={isOpen}
      onClose={handleCancel}
      size="large"
    >
      <Box sx={{ display: 'flex', flexDirection: 'column', gap: 3, mb: 3 }}>
        <Box>
          <Text sx={{ fontSize: 1, mb: 2, display: 'block', fontWeight: '700' }}>
            URL <span style={{ color: '#d1242f' }}>*</span>
          </Text>
          <TextInput
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="https://example.com"
            onKeyDown={handleKeyPress}
            autoFocus
            sx={{ width: '100%' }}
          />
        </Box>

        <Box>
          <Text sx={{ fontSize: 1, mb: 2, display: 'block', fontWeight: '700' }}>
            表示テキスト（任意）
          </Text>
          <TextInput
            value={linkText}
            onChange={(e) => setLinkText(e.target.value)}
            placeholder="リンクテキスト（空の場合はURLを使用）"
            onKeyDown={handleKeyPress}
            sx={{ width: '100%' }}
          />
        </Box>
      </Box>

      <Box
        sx={{
          display: 'flex',
          justifyContent: 'flex-end',
          gap: 2,
          borderColor: 'border.default',
        }}
      >
        <Button onClick={handleCancel} variant="default">
          キャンセル
        </Button>
        <Button
          onClick={handleInsert}
          variant="primary"
          disabled={!url.trim()}
        >
          挿入
        </Button>
      </Box>
    </CommonDialog>
  );
};

export default LinkInsertDialog;