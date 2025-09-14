import { Button } from '@primer/react';
import { memo } from 'react';

import type { DialogAction } from '../../../types/unified-dialog';

interface DialogActionsProps {
  /** アクション群 */
  actions: DialogAction[];
}

/**
 * ダイアログアクションボタン群コンポーネント
 * 
 * 統一されたダイアログアクションを提供し、
 * 一貫したボタンスタイルとレイアウトを確保します。
 */
const DialogActions = memo<DialogActionsProps>(({ actions }) => (
  <>
    {actions.map((action, index) => (
      <Button
        key={index}
        onClick={action.onClick}
        variant={action.variant ?? 'default'}
        disabled={action.disabled}
        sx={{
          color: action.variant === 'primary' ? 'fg.onEmphasis !important' : undefined
        }}
      >
        {action.icon && <action.icon size={16} />}
        {action.label}
      </Button>
    ))}
  </>
));

DialogActions.displayName = 'DialogActions';

export default DialogActions;