import { ActionList, ActionMenu, Button } from '@primer/react';
import { AlertIcon, ClockIcon, XCircleIcon, TagIcon, FilterIcon as DefaultFilterIcon } from '@primer/octicons-react';
import { memo, useMemo } from 'react';

import type { TaskFilter, FilterConfig, Label } from '../types';

interface FilterSelectorProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  availableLabels: Label[];
}

/**
 * タスクフィルター選択コンポーネント
 * 期限やラベルによるフィルタリング機能を提供
 */
const FilterSelector = memo<FilterSelectorProps>(({
  currentFilter,
  onFilterChange,
  availableLabels
}) => {
  const filterConfigs: FilterConfig[] = useMemo(() => [
    {
      type: 'all',
      label: 'すべてのタスク',
      icon: 'filter',
    },
    {
      type: 'due-within-3-days',
      label: '期限まで3日以内',
      icon: 'clock',
    },
    {
      type: 'due-today',
      label: '本日期限',
      icon: 'alert',
    },
    {
      type: 'overdue',
      label: '期限切れ',
      icon: 'x-circle',
    },
    {
      type: 'label',
      label: 'ラベルで絞り込み',
      icon: 'tag',
    }
  ], []);

  const getFilterIcon = (iconName?: string): typeof DefaultFilterIcon => {
    switch (iconName) {
      case 'clock':
        return ClockIcon;
      case 'alert':
        return AlertIcon;
      case 'x-circle':
        return XCircleIcon;
      case 'tag':
        return TagIcon;
      default:
        return DefaultFilterIcon;
    }
  };

  const getCurrentFilterLabel = () => {
    if (currentFilter.type === 'label' && currentFilter.selectedLabels?.length) {
      return `ラベル: ${currentFilter.selectedLabels.length}個選択`;
    }
    const config = filterConfigs.find(f => f.type === currentFilter.type);
    return config?.label ?? 'フィルター';
  };

  const handleFilterSelect = (filterType: string) => {
    if (filterType === 'label') {
      // ラベルフィルターの場合は追加のUIが必要
      onFilterChange({
        type: 'label',
        label: 'ラベルで絞り込み',
        selectedLabels: []
      });
    } else {
      const config = filterConfigs.find(f => f.type === filterType);
      if (config) {
        onFilterChange({
          type: config.type,
          label: config.label
        });
      }
    }
  };

  const handleLabelToggle = (labelId: string) => {
    if (currentFilter.type !== 'label') {
      return;
    }
    
    const currentLabels = currentFilter.selectedLabels ?? [];
    const isSelected = currentLabels.includes(labelId);
    
    const newLabels = isSelected
      ? currentLabels.filter(id => id !== labelId)
      : [...currentLabels, labelId];
    
    onFilterChange({
      ...currentFilter,
      selectedLabels: newLabels
    });
  };

  const FilterIconComponent = getFilterIcon(
    filterConfigs.find(f => f.type === currentFilter.type)?.icon
  );

  return (
    <ActionMenu>
      <ActionMenu.Anchor>
        <Button
          variant="invisible"
          size="small"
          leadingVisual={FilterIconComponent}
          aria-label="タスクフィルターを選択"
          style={{
            color: currentFilter.type !== 'all' ? 'var(--fgColor-accent)' : 'var(--fgColor-default)',
            fontWeight: currentFilter.type !== 'all' ? '600' : 'normal'
          }}
        >
          {getCurrentFilterLabel()}
        </Button>
      </ActionMenu.Anchor>
      <ActionMenu.Overlay style={{ zIndex: 150 }}>
        <ActionList>
          <ActionList.Group title="期限でフィルター">
            {filterConfigs.slice(0, 4).map((config) => {
              const IconComponent = getFilterIcon(config.icon);
              return (
                <ActionList.Item
                  key={config.type}
                  onSelect={() => handleFilterSelect(config.type)}
                  selected={currentFilter.type === config.type}
                >
                  <ActionList.LeadingVisual>
                    <IconComponent />
                  </ActionList.LeadingVisual>
                  {config.label}
                </ActionList.Item>
              );
            })}
          </ActionList.Group>
          
          {availableLabels.length > 0 && (
            <ActionList.Group title="ラベルでフィルター">
              <ActionMenu>
                <ActionMenu.Anchor>
                  <ActionList.Item
                    selected={currentFilter.type === 'label'}
                  >
                    <ActionList.LeadingVisual>
                      <TagIcon />
                    </ActionList.LeadingVisual>
                    ラベルで絞り込み
                  </ActionList.Item>
                </ActionMenu.Anchor>
                <ActionMenu.Overlay style={{ zIndex: 200 }}>
                  <ActionList>
                    <ActionList.Item
                      onSelect={() => handleFilterSelect('label')}
                      selected={currentFilter.type === 'label' && (!currentFilter.selectedLabels || currentFilter.selectedLabels.length === 0)}
                    >
                      すべてのラベル
                    </ActionList.Item>
                    <ActionList.Divider />
                    {availableLabels.map((label) => (
                      <ActionList.Item
                        key={label.id}
                        onSelect={() => handleLabelToggle(label.id)}
                        selected={currentFilter.selectedLabels?.includes(label.id)}
                      >
                        <ActionList.LeadingVisual>
                          <div
                            style={{
                              width: '12px',
                              height: '12px',
                              borderRadius: '2px',
                              backgroundColor: label.color
                            }}
                          />
                        </ActionList.LeadingVisual>
                        {label.name}
                      </ActionList.Item>
                    ))}
                  </ActionList>
                </ActionMenu.Overlay>
              </ActionMenu>
            </ActionList.Group>
          )}
        </ActionList>
      </ActionMenu.Overlay>
    </ActionMenu>
  );
});

FilterSelector.displayName = 'FilterSelector';

export default FilterSelector;