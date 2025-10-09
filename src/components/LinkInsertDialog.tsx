import { Box, Button, Text, TextInput } from '@primer/react';
import React, { useState, useCallback, useMemo } from 'react';

import UnifiedDialog from './shared/Dialog/UnifiedDialog';

interface LinkInsertDialogProps {
  isOpen: boolean;
  onInsert: (url: string, text?: string) => void;
  onCancel: () => void;
}

// URL検証ヘルパー関数
const validateUrl = (url: string): boolean => {
  if (!url.trim()) {return false;}

  try {
    const fullUrl = url.startsWith('http') ? url : `https://${url}`;
    new URL(fullUrl);
    return true;
  } catch {
    return false;
  }
};

const LinkInsertDialog: React.FC<LinkInsertDialogProps> = ({
  isOpen,
  onInsert,
  onCancel,
}) => {
  const [url, setUrl] = useState('');
  const [linkText, setLinkText] = useState('');

  // URL検証結果をメモ化
  const isValidUrl = useMemo(() => validateUrl(url), [url]);

  const handleInsert = useCallback(() => {
    if (isValidUrl) {
      onInsert(url.trim(), linkText.trim() || undefined);
      setUrl('');
      setLinkText('');
    }
  }, [url, linkText, onInsert, isValidUrl]);

  const handleCancel = useCallback(() => {
    setUrl('');
    setLinkText('');
    onCancel();
  }, [onCancel]);

  const handleKeyPress = useCallback((e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && (e.ctrlKey || e.metaKey) && isValidUrl) {
      e.preventDefault();
      handleInsert();
    }
  }, [handleInsert, isValidUrl]);

  return (
    <UnifiedDialog
      title="リンクを挿入"
      isOpen={isOpen}
      onClose={handleCancel}
      variant="modal"
      size="large"
      hideFooter
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
            sx={{
              width: '100%',
              ...(url && !isValidUrl && {
                borderColor: 'danger.fg',
                '&:focus': {
                  borderColor: 'danger.fg',
                  boxShadow: '0 0 0 2px rgba(248, 81, 73, 0.3)',
                }
              })
            }}
          />
          {url && !isValidUrl && (
            <Text sx={{ fontSize: 0, color: 'danger.fg', mt: 1 }}>
              有効なURLを入力してください
            </Text>
          )}
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
          disabled={!isValidUrl}
        >
          挿入
        </Button>
      </Box>
    </UnifiedDialog>
  );
};

export default LinkInsertDialog;