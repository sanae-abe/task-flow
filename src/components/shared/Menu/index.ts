/**
 * 統合メニューシステム
 * 
 * 一貫したメニュー体験を提供する統合システムです。
 * 以下のメニュータイプをサポートします：
 * 
 * - UnifiedMenu: ベースメニュー（完全カスタマイズ可能）
 * - SelectorMenu: セレクターメニュー（選択肢から選択）
 * - ActionMenu: アクションメニュー（複雑なアクション群）
 * - DropdownMenu: ドロップダウンメニュー（シンプルなアクション群）
 */

// ベースメニュー
export { default as UnifiedMenu } from './UnifiedMenu';

// 特化メニュー
export { default as SelectorMenu } from './SelectorMenu';
export { default as ActionMenu } from './ActionMenu';
export { default as DropdownMenu } from './DropdownMenu';

// 型定義をre-export
export type {
  UnifiedMenuProps,
  SelectorMenuProps,
  ActionMenuProps,
  DropdownMenuProps,
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