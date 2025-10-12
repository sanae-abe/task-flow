import { Button } from '@primer/react';
import { memo } from 'react';

import type { DialogAction } from '../../../types/unified-dialog';

interface DialogActionsProps {
  /** アクション群 */
  actions: DialogAction[];
  /** レイアウトタイプ */
  layout?: 'standard' | 'split';
}

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
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          gap: "8px",
          width: '100%'
        }}
      >
        <div style={{ display: 'flex', gap: "8px" }}>
          {leftActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant ?? 'default'}
              disabled={action.disabled}
              leadingVisual={action.icon}
              sx={{
                color: action.variant === 'primary' ? 'fg.onEmphasis !important' : undefined
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
        <div style={{ display: 'flex', gap: "8px" }}>
          {rightActions.map((action, index) => (
            <Button
              key={index}
              onClick={action.onClick}
              variant={action.variant ?? 'default'}
              disabled={action.disabled}
              leadingVisual={action.icon}
              sx={{
                color: action.variant === 'primary' ? 'fg.onEmphasis !important' : undefined
              }}
            >
              {action.label}
            </Button>
          ))}
        </div>
      </div>
    );
  }

  // 標準レイアウト（右揃え）
  return (
    <>
      {actions.map((action, index) => (
        <Button
          key={index}
          onClick={action.onClick}
          variant={action.variant ?? 'default'}
          disabled={action.disabled}
          leadingVisual={action.icon}
          sx={{
            color: action.variant === 'primary' ? 'fg.onEmphasis !important' : undefined
          }}
        >
          {action.label}
        </Button>
      ))}
    </>
  );
});

DialogActions.displayName = 'DialogActions';

export default DialogActions;