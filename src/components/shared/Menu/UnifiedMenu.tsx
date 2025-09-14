import { ActionMenu, ActionList, Button } from '@primer/react';
import { memo, useMemo } from 'react';

import type { UnifiedMenuProps, MenuItem, MenuGroup, MenuTrigger } from '../../../types/unified-menu';
import IconButton from '../IconButton';
import SubHeaderButton from '../../SubHeaderButton';

/**
 * メニュートリガーコンポーネント
 */
const MenuTriggerComponent = memo<{
  trigger: MenuTrigger;
  children?: React.ReactNode;
}>(({ trigger, children }) => {
  const { type, label, icon, variant = 'default', size = 'medium', ariaLabel } = trigger;

  if (trigger.customTrigger) {
    return <>{trigger.customTrigger}</>;
  }

  switch (type) {
    case 'icon-button':
      if (!icon) {
        // eslint-disable-next-line no-console
        console.warn('IconButton requires an icon');
        return null;
      }
      return (
        <IconButton
          icon={icon}
          onClick={() => {}} // ActionMenuが制御
          ariaLabel={ariaLabel ?? label ?? 'メニューを開く'}
          variant={variant === 'danger' ? 'danger' : 'default'}
          size={size}
        />
      );
    
    case 'button':
      if (!icon) {
        // eslint-disable-next-line no-console
        console.warn('SubHeaderButton requires an icon');
        return null;
      }
      return (
        <SubHeaderButton
          icon={icon}
          aria-label={ariaLabel ?? `${label}メニューを開く`}
        >
          {label}
        </SubHeaderButton>
      );
    
    default: // custom
      return (
        <Button
          variant={variant === 'invisible' ? 'invisible' : 'default'}
          size={size}
          leadingVisual={icon}
          aria-label={ariaLabel ?? label}
        >
          {label}
          {children}
        </Button>
      );
  }
});

/**
 * メニューアイテムレンダラー
 */
const renderMenuItem = (item: MenuItem): React.ReactNode => {
  if (item.type === 'divider') {
    return <ActionList.Divider key={item.id} />;
  }

  if (item.hidden) {
    return null;
  }

  const commonProps = {
    key: item.id,
    disabled: item.disabled
  };

  switch (item.type) {
    case 'action':
      return (
        <ActionList.Item
          {...commonProps}
          variant={item.variant}
          onSelect={item.onSelect}
        >
          {item.icon && (
            <ActionList.LeadingVisual>
              <item.icon size={16} />
            </ActionList.LeadingVisual>
          )}
          {item.label}
        </ActionList.Item>
      );

    case 'selectable':
      return (
        <ActionList.Item
          {...commonProps}
          selected={item.selected}
          onSelect={() => item.onSelect(item.id)}
        >
          {item.icon && (
            <ActionList.LeadingVisual>
              <item.icon size={16} />
            </ActionList.LeadingVisual>
          )}
          {item.label}
        </ActionList.Item>
      );

    case 'nested':
      return (
        <ActionMenu key={item.id}>
          <ActionMenu.Anchor>
            <ActionList.Item disabled={item.disabled}>
              {item.icon && (
                <ActionList.LeadingVisual>
                  <item.icon size={16} />
                </ActionList.LeadingVisual>
              )}
              {item.label}
            </ActionList.Item>
          </ActionMenu.Anchor>
          <ActionMenu.Overlay>
            <ActionList>
              {item.children.map(renderMenuItem)}
            </ActionList>
          </ActionMenu.Overlay>
        </ActionMenu>
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
  zIndex = 100,
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
            allItems.push(<ActionList.Divider key={`divider-${group.id}`} />);
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

  const overlayStyles = {
    zIndex,
    ...overlayProps
  };

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <MenuTriggerComponent trigger={trigger} />
      </ActionMenu.Anchor>
      <ActionMenu.Overlay sx={overlayStyles}>
        <ActionList>
          {menuContent}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
});

UnifiedMenu.displayName = 'UnifiedMenu';
MenuTriggerComponent.displayName = 'MenuTriggerComponent';

export default UnifiedMenu;