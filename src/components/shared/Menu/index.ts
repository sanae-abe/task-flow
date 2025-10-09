/**
 * 統合メニューシステム
 *
 * 一貫したメニュー体験を提供する統合システムです。
 * 以下のメニュータイプをサポートします：
 *
 * - UnifiedMenu: ベースメニュー（完全カスタマイズ可能）
 * - ActionMenu: アクションメニュー（複雑なアクション群）
 */

// ベースメニュー
export { default as UnifiedMenu } from './UnifiedMenu';

// 特化メニュー
export { default as ActionMenu } from './ActionMenu';

// 型定義をre-export
export type {
  UnifiedMenuProps,
  ActionMenuProps,
  MenuItem,
  MenuGroup,
  MenuTrigger,
  ActionMenuItem,
  SelectableMenuItem,
  NestedMenuItem,
  MenuDivider,
  MenuVariant,
  MenuSize,
  TriggerType
} from '../../../types/unified-menu';