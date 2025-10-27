/**
 * 統合メニューシステムの型定義
 */
import type { LucideIcon } from "lucide-react";

export type MenuVariant = "default" | "danger" | "invisible";
export type MenuSize = "small" | "medium" | "large" | "icon";
export type TriggerType = "button" | "icon-button" | "custom";

// ベースメニューアイテム
export interface BaseMenuItem {
  /** アイテムID（一意識別子） */
  id: string;
  /** 表示ラベル */
  label: string;
  /** アイコン（オプション） */
  icon?: LucideIcon;
  /** 無効状態 */
  disabled?: boolean;
  /** 非表示状態 */
  hidden?: boolean;
  /** 説明文（ツールチップ用） */
  description?: string;
}

// アクションメニューアイテム
export interface ActionMenuItem extends BaseMenuItem {
  /** アイテムの種類 */
  type: "action";
  /** クリック時のコールバック */
  onSelect: () => void;
  /** アイテムのバリアント */
  variant?: "default" | "danger";
}

// 選択可能メニューアイテム
export interface SelectableMenuItem extends BaseMenuItem {
  /** アイテムの種類 */
  type: "selectable";
  /** 選択状態 */
  selected?: boolean;
  /** 選択時のコールバック */
  onSelect: (id: string) => void;
  /** 値（選択時に返される） */
  value?: unknown;
}

// ネストメニューアイテム
export interface NestedMenuItem extends BaseMenuItem {
  /** アイテムの種類 */
  type: "nested";
  /** サブメニューアイテム */
  children: MenuItem[];
}

// 区切り線
export interface MenuDivider {
  /** アイテムの種類 */
  type: "divider";
  /** アイテムID（一意識別子） */
  id: string;
}

// 統合メニューアイテム型
export type MenuItem =
  | ActionMenuItem
  | SelectableMenuItem
  | NestedMenuItem
  | MenuDivider;

// メニューグループ
export interface MenuGroup {
  /** グループID */
  id: string;
  /** グループラベル（オプション） */
  label?: string;
  /** グループ内のアイテム */
  items: MenuItem[];
  /** 条件付き表示 */
  condition?: boolean;
}

// トリガーボタンの設定
export interface MenuTrigger {
  /** トリガーの種類 */
  type: TriggerType;
  /** ボタンラベル */
  label?: string;
  /** アイコン */
  icon?: LucideIcon;
  /** ボタンのバリアント */
  variant?: MenuVariant;
  /** ボタンのサイズ */
  size?: MenuSize;
  /** aria-label */
  ariaLabel?: string;
  /** カスタムトリガーコンポーネント */
  customTrigger?: React.ReactNode;
  /** 追加のスタイル */
  className?: string;
}

// 統合メニューコンポーネントのプロパティ
export interface UnifiedMenuProps {
  /** メニューアイテム（フラット構造） */
  items?: MenuItem[];
  /** メニューグループ（グループ構造） */
  groups?: MenuGroup[];
  /** トリガーボタンの設定 */
  trigger: MenuTrigger;
  /** メニューの配置 */
  placement?: "auto" | "top" | "bottom" | "left" | "right";
  /** z-index */
  zIndex?: number;
  /** 追加のスタイル */
  overlayProps?: Record<string, unknown>;
}

// 専用メニューコンポーネントのプロパティ

// アクションメニュー（複雑なアクション群）
export interface ActionMenuProps {
  /** メニューグループ */
  groups: MenuGroup[];
  /** トリガーボタンの設定 */
  trigger: MenuTrigger;
  /** 追加設定 */
  overlayProps?: Record<string, unknown>;
}

// セレクターメニュー（選択肢から選択）
export interface SelectorMenuProps<T = unknown> {
  /** 選択可能オプション */
  options: Array<{
    id: string;
    label: string;
    value: T;
    icon?: LucideIcon;
    disabled?: boolean;
  }>;
  /** 現在選択中の値 */
  selectedValue: T;
  /** 選択時のコールバック */
  onSelectionChange: (value: T) => void;
  /** トリガーボタンの設定 */
  trigger: MenuTrigger;
  /** 現在の選択状態をトリガーに表示するか */
  showSelection?: boolean;
}

// ドロップダウンメニュー（シンプルなアクション群）
export interface DropdownMenuProps {
  /** メニューアイテム */
  items: MenuItem[];
  /** トリガーボタンの設定 */
  trigger: MenuTrigger;
  /** 追加設定 */
  overlayProps?: Record<string, unknown>;
}
