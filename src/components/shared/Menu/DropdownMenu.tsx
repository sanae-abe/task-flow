import { memo } from 'react';

import type { DropdownMenuProps } from '../../../types/unified-menu';

import UnifiedMenu from './UnifiedMenu';

/**
 * ドロップダウンメニューコンポーネント
 * 
 * シンプルなアクション群を持つメニューを提供します。
 * カラムアクション、タスクアクションなどに適用可能です。
 */
const DropdownMenu = memo<DropdownMenuProps>(({
  items,
  trigger,
  overlayProps
}) => (
    <UnifiedMenu
      items={items}
      trigger={trigger}
      overlayProps={overlayProps}
    />
  ));

DropdownMenu.displayName = 'DropdownMenu';

export default DropdownMenu;