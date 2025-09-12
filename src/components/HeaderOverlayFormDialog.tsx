import { memo } from 'react';
import { Box } from '@primer/react';

import { useFormDialog } from '../hooks/useFormDialog';
import type { SimpleFormDialogProps } from '../types/dialog';

import FormField from './FormField';
import HeaderOverlayDialog, { HeaderOverlayActions } from './HeaderOverlayDialog';

/**
 * ヘッダーオーバーレイ形式のシンプルなフォームダイアログコンポーネント
 * ヘッダー全面に展開される単一入力フィールドのダイアログを提供
 */
const HeaderOverlayFormDialog = memo<SimpleFormDialogProps>(({
  isOpen,
  title,
  fieldLabel,
  placeholder,
  confirmText,
  initialValue = '',
  onSave,
  onCancel,
  ariaLabelledBy,
  inputId
}) => {
  const {
    value,
    setValue,
    handleSave,
    handleKeyPress,
    isValid
  } = useFormDialog({ 
    isOpen, 
    initialValue, 
    onSave, 
    onCancel 
  });

  return (
    <HeaderOverlayDialog
      isOpen={isOpen}
      title={title}
      onClose={onCancel}
      ariaLabelledBy={ariaLabelledBy}
      actions={
        <HeaderOverlayActions
          onCancel={onCancel}
          onConfirm={handleSave}
          confirmText={confirmText}
          isConfirmDisabled={!isValid}
        />
      }
    >
      <Box sx={{ 
        flex: 1, 
        mx: 3,
        display: 'flex',
        alignItems: 'center',
        minHeight: '60px' // 十分な高さを確保
      }}>
        <FormField
          id={inputId}
          label={fieldLabel}
          value={value}
          placeholder={placeholder}
          onChange={setValue}
          onKeyDown={handleKeyPress}
          autoFocus
          required
          hideLabel // ヘッダーオーバーレイではラベルを非表示
          sx={{ 
            mb: 0, // マージンを削除してコンパクトに
            width: '100%', // 全幅使用
            '& input': {
              fontSize: 3, // フォントサイズをさらに大きく
              py: 3,
              px: 4,
              minHeight: '50px', // 最小高さをさらに確保
              border: '2px solid', // ボーダーを太く
              borderColor: 'border.default',
              borderRadius: 2,
              backgroundColor: 'canvas.default',
              '&:focus': {
                borderColor: 'accent.emphasis',
                outline: 'none',
                boxShadow: '0 0 0 3px rgba(9, 105, 218, 0.3)'
              },
              '&::placeholder': {
                color: 'fg.muted',
                opacity: 0.8
              }
            }
          }}
        />
      </Box>
    </HeaderOverlayDialog>
  );
});

export default HeaderOverlayFormDialog;