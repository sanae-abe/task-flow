import React, { memo, useMemo } from 'react';
import { cn } from "@/lib/utils";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';

import type { UnifiedMenuProps, MenuItem, MenuGroup, MenuTrigger } from '../../../types/unified-menu';

/**
 * メニュートリガー内容コンポーネント（ボタン要素は含まない）
 */
const MenuTriggerContent = React.forwardRef<HTMLElement, {
  trigger: MenuTrigger;
  children?: React.ReactNode;
}>(({ trigger, children }, ref) => {
  const { label, icon, className } = trigger;

  if (trigger.customTrigger) {
    if (React.isValidElement(trigger.customTrigger)) {
      return React.cloneElement(trigger.customTrigger, { ref } as React.HTMLAttributes<HTMLElement>);
    }
    return <>{trigger.customTrigger}</>;
  }

  // DropdownMenuTrigger内で使用するため、ボタン要素は含まずコンテンツのみ返す
  return (
    <span ref={ref} className={cn("flex items-center gap-2", className)}>
      {icon && React.createElement(icon, { size: 16 })}
      {label}
      {children}
    </span>
  );
});

/**
 * メニューアイテムレンダラー (Shadcn/UI DropdownMenu用)
 */
const renderMenuItem = (item: MenuItem): React.ReactNode => {
  if (item.type === 'divider') {
    return <DropdownMenuSeparator key={item.id} />;
  }

  if (item.hidden) {
    return null;
  }

  switch (item.type) {
    case 'action':
      return (
        <DropdownMenuItem
          key={item.id}
          disabled={item.disabled}
          onSelect={item.onSelect}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (item.onSelect) {
              item.onSelect();
            }
          }}
          className={item.variant === 'danger' ? 'text-red-600 focus:text-red-600' : ''}
        >
          {item.icon && React.createElement(item.icon, { size: 16, className: "mr-2" })}
          {item.label}
        </DropdownMenuItem>
      );

    case 'selectable':
      return (
        <DropdownMenuItem
          key={item.id}
          disabled={item.disabled}
          onSelect={() => item.onSelect(item.id)}
          onClick={(event) => {
            event.preventDefault();
            event.stopPropagation();
            if (item.onSelect) {
              item.onSelect(item.id);
            }
          }}
          className={item.selected ? 'bg-accent' : ''}
        >
          {item.icon && React.createElement(item.icon, { size: 16, className: "mr-2" })}
          {item.label}
        </DropdownMenuItem>
      );

    case 'nested':
      // ネストメニューは将来のバージョンで実装予定
      // 現在はフラットなアイテムとして表示
      return (
        <DropdownMenuItem
          key={item.id}
          disabled={item.disabled}
        >
          {item.icon && React.createElement(item.icon, { size: 16, className: "mr-2" })}
          {item.label}
          <span className="ml-auto text-xs text-muted-foreground">→</span>
        </DropdownMenuItem>
      );

    default:
      return null;
  }
};

/**
 * メニューグループレンダラー
 */
const renderMenuGroup = (group: MenuGroup): React.ReactNode[] => {
  if (group.condition === false) {
    return [];
  }

  const items = group.items.map(renderMenuItem).filter(Boolean);
  
  if (items.length === 0) {
    return [];
  }

  // グループの前に区切り線を追加（最初のグループ以外）
  return items;
};

/**
 * 統合メニューコンポーネント
 * 
 * 様々な形式のメニューを統一されたAPIで提供します。
 * アクションメニュー、セレクター、ドロップダウンに対応し、
 * 一貫したメニュー体験を提供します。
 */
const UnifiedMenu = memo<UnifiedMenuProps>(({
  items = [],
  groups = [],
  trigger,
  placement: _placement,
  zIndex = 500,
  overlayProps = {}
}) => {
  const menuContent = useMemo(() => {
    // グループが指定されている場合はグループ単位でレンダリング
    if (groups.length > 0) {
      const allItems: React.ReactNode[] = [];
      let isFirstGroup = true;

      groups.forEach((group) => {
        if (group.condition === false) {
          return;
        }

        const groupItems = renderMenuGroup(group);
        if (groupItems.length > 0) {
          // 最初のグループ以外は区切り線を追加
          if (!isFirstGroup) {
            allItems.push(<DropdownMenuSeparator key={`divider-${group.id}`} />);
          }
          allItems.push(...groupItems);
          isFirstGroup = false;
        }
      });

      return allItems;
    }

    // アイテムが直接指定されている場合
    return items.map(renderMenuItem).filter(Boolean);
  }, [items, groups]);


  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        asChild={trigger.type === 'custom' && !!trigger.customTrigger}
        className={trigger.type === 'custom' && trigger.customTrigger ? undefined : cn("flex items-center gap-1", trigger.className)}
      >
        <MenuTriggerContent trigger={trigger} />
      </DropdownMenuTrigger>
      <DropdownMenuContent
        style={{ zIndex, ...overlayProps }}
      >
        {menuContent}
      </DropdownMenuContent>
    </DropdownMenu>
  );
});

UnifiedMenu.displayName = 'UnifiedMenu';
MenuTriggerContent.displayName = 'MenuTriggerContent';

export default UnifiedMenu;