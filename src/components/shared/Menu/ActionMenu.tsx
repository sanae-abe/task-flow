import { memo } from 'react';

import type { ActionMenuProps } from '../../../types/unified-menu';

import UnifiedMenu from './UnifiedMenu';

/**
 * アクションメニューコンポーネント
 * 
 * 複雑なアクションを持つメニューを提供します。
 * グループ分けや条件付き表示をサポートし、
 * ボード設定、カラム操作などに適用可能です。
 */
const ActionMenu = memo<ActionMenuProps>(({
  groups,
  trigger,
  overlayProps
}) => (
    <UnifiedMenu
      groups={groups}
      trigger={trigger}
      overlayProps={overlayProps}
    />
  ));

ActionMenu.displayName = 'ActionMenu';

export default ActionMenu;