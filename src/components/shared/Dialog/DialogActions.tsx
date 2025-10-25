import { Button } from '@/components/ui/button';
import { memo } from 'react';

import type { DialogAction } from '../../../types/unified-dialog';

interface DialogActionsProps {
  /** アクション群 */
  actions: DialogAction[];
  /** レイアウトタイプ */
  layout?: 'standard' | 'split';
}

/**
 * DialogActionのvariantをButtonのvariantにマッピングする
 */
const mapVariantToButton = (variant?: DialogAction['variant']) => {
  switch (variant) {
    case 'primary':
      return 'default';
    case 'danger':
      return 'destructive';
    default:
      return variant;
  }
};

/**
 * ダイアログアクションボタン群コンポーネント
 *
 * 統一されたダイアログアクションを提供し、
 * 一貫したボタンスタイルとレイアウトを確保します。
 *
 * @param layout - 'standard': 全ボタンを右揃え, 'split': 左右に分割配置
 */
const DialogActions = memo<DialogActionsProps>(({ actions, layout = 'standard' }) => {
  if (layout === 'split') {
    const leftActions = actions.filter(action => action.position === 'left');
    const rightActions = actions.filter(action => action.position !== 'left');

    return (
      <div className="flex justify-between gap-2 w-full">
        <div className="flex gap-2">
          {leftActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={mapVariantToButton(action.variant)}
              disabled={action.disabled}
            >
              {action.icon && <span className="mr-2"><action.icon size={16} /></span>}
              {action.label}
            </Button>
          ))}
        </div>
        <div className="flex gap-2">
          {rightActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={mapVariantToButton(action.variant)}
              disabled={action.disabled}
            >
              {action.icon && <span className="mr-2"><action.icon size={16} /></span>}
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // 標準レイアウト（右揃え）
  return (
    <div className="flex justify-end gap-2">
      {actions.map((action, index) => (
        <Button
          key={index}
          onClick={action.onClick}
          variant={mapVariantToButton(action.variant)}
          disabled={action.disabled}
        >
          {action.icon && <span className="mr-2"><action.icon size={16} /></span>}
          {action.label}
        </Button>
      ))}
    </div>
  );
});

DialogActions.displayName = 'DialogActions';

export default DialogActions;