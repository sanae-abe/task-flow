import { memo, useMemo } from 'react';

import type { SelectorMenuProps } from '../../../types/unified-menu';

import UnifiedMenu from './UnifiedMenu';

/**
 * セレクターメニューコンポーネント
 * 
 * 選択肢から値を選択するメニューを提供します。
 * ソート選択、フィルター選択などに適用可能です。
 */
const SelectorMenu = memo<SelectorMenuProps>(({
  options,
  selectedValue,
  onSelectionChange,
  trigger,
  showSelection = true
}) => {
  const menuItems = useMemo(() => {
    return options.map(option => ({
      id: option.id,
      type: 'selectable' as const,
      label: option.label,
      icon: option.icon,
      disabled: option.disabled,
      selected: selectedValue === option.value,
      onSelect: () => onSelectionChange(option.value)
    }));
  }, [options, selectedValue, onSelectionChange]);

  // 現在選択中のオプションをトリガーに表示
  const enhancedTrigger = useMemo(() => {
    if (!showSelection) {
      return trigger;
    }

    const selectedOption = options.find(option => option.value === selectedValue);
    if (!selectedOption) {
      return trigger;
    }

    return {
      ...trigger,
      label: selectedOption.label,
      ariaLabel: `現在の選択: ${selectedOption.label}`
    };
  }, [trigger, options, selectedValue, showSelection]);

  return (
    <UnifiedMenu
      items={menuItems}
      trigger={enhancedTrigger}
    />
  );
});

SelectorMenu.displayName = 'SelectorMenu';

export default SelectorMenu;