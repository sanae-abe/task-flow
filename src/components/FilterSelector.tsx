import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/ui/dropdown-menu";
import {
  AlertTriangle,
  Clock,
  XCircle,
  Tag,
  Star,
  Filter as DefaultFilter,
} from "lucide-react";
import { memo, useMemo } from "react";

import type { TaskFilter, FilterConfig, Label, Priority } from "../types";
import { priorityConfig } from "../utils/priorityConfig";

interface FilterSelectorProps {
  currentFilter: TaskFilter;
  onFilterChange: (filter: TaskFilter) => void;
  availableLabels: Label[];
}

/**
 * タスクフィルター選択コンポーネント
 * 期限やラベルによるフィルタリング機能を提供
 */
const FilterSelector = memo<FilterSelectorProps>(
  ({ currentFilter, onFilterChange, availableLabels }) => {
    const filterConfigs: FilterConfig[] = useMemo(
      () => [
        {
          type: "all",
          label: "すべてのタスク",
          icon: "filter",
        },
        {
          type: "due-within-3-days",
          label: "期限まで3日以内",
          icon: "clock",
        },
        {
          type: "due-today",
          label: "本日期限",
          icon: "alert",
        },
        {
          type: "overdue",
          label: "期限切れ",
          icon: "x-circle",
        },
        {
          type: "label",
          label: "ラベルで絞り込み",
          icon: "tag",
        },
        {
          type: "priority",
          label: "優先度で絞り込み",
          icon: "star",
        },
      ],
      [],
    );

    const getFilterIcon = (iconName?: string): typeof DefaultFilter => {
      switch (iconName) {
        case "clock":
          return Clock;
        case "alert":
          return AlertTriangle;
        case "x-circle":
          return XCircle;
        case "tag":
          return Tag;
        case "star":
          return Star;
        default:
          return DefaultFilter;
      }
    };

    const getCurrentFilterLabel = () => {
      if (currentFilter.type === "label") {
        const selectedCount =
          currentFilter.selectedLabelNames?.length ??
          currentFilter.selectedLabels?.length ??
          0;
        if (selectedCount > 0) {
          return `ラベル: ${selectedCount}個選択`;
        }
      }
      if (currentFilter.type === "priority") {
        const selectedCount = currentFilter.selectedPriorities?.length ?? 0;
        if (selectedCount > 0) {
          return `優先度: ${selectedCount}個選択`;
        }
      }
      if (currentFilter.type === "has-labels") {
        return "ラベル付きタスク";
      }
      const config = filterConfigs.find((f) => f.type === currentFilter.type);
      return config?.label ?? "フィルター";
    };

    const handleFilterSelect = (filterType: string) => {
      if (filterType === "label") {
        // すべてのラベル = ラベル付きタスクのみに絞り込み
        onFilterChange({
          type: "has-labels",
          label: "ラベル付きタスク",
        });
      } else if (filterType === "priority") {
        // 優先度フィルターを開く時は空の状態でスタート
        onFilterChange({
          type: "priority",
          label: "優先度で絞り込み",
          selectedPriorities: [],
        });
      } else {
        const config = filterConfigs.find((f) => f.type === filterType);
        if (config) {
          onFilterChange({
            type: config.type,
            label: config.label,
          });
        }
      }
    };

    const handleLabelToggle = (labelName: string) => {
      // ラベル名ベースの選択処理に変更
      const currentLabelNames =
        currentFilter.type === "label"
          ? (currentFilter.selectedLabelNames ?? [])
          : [];
      const isSelected = currentLabelNames.includes(labelName);

      const newLabelNames = isSelected
        ? currentLabelNames.filter((name) => name !== labelName)
        : [...currentLabelNames, labelName];

      onFilterChange({
        type: "label",
        label: "ラベルで絞り込み",
        selectedLabelNames: newLabelNames,
      });
    };

    const handlePriorityToggle = (priority: Priority) => {
      const currentPriorities =
        currentFilter.type === "priority"
          ? (currentFilter.selectedPriorities ?? [])
          : [];
      const isSelected = currentPriorities.includes(priority);

      const newPriorities = isSelected
        ? currentPriorities.filter((p) => p !== priority)
        : [...currentPriorities, priority];

      onFilterChange({
        type: "priority",
        label: "優先度で絞り込み",
        selectedPriorities: newPriorities,
      });
    };

    const FilterIconComponent = getFilterIcon(
      filterConfigs.find((f) => f.type === currentFilter.type)?.icon,
    );

    return (
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            aria-label="タスクフィルターを選択"
            className={`flex items-center gap-2 ${
              currentFilter.type !== "all"
                ? "text-blue-600 font-semibold"
                : "text-gray-700 font-normal"
            }`}
          >
            <FilterIconComponent size={16} />
            {getCurrentFilterLabel()}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="z-150 w-56">
          {/* 期限でフィルター */}
          {filterConfigs.slice(0, 4).map((config) => {
            const IconComponent = getFilterIcon(config.icon);
            return (
              <DropdownMenuItem
                key={config.type}
                onClick={() => handleFilterSelect(config.type)}
                className={currentFilter.type === config.type ? 'bg-accent' : ''}
              >
                <IconComponent size={16} className="mr-2" />
                {config.label}
              </DropdownMenuItem>
            );
          })}

          {availableLabels.length > 0 && (
            <>
              <DropdownMenuSeparator />
              {/* ラベルでフィルター */}
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <DropdownMenuItem
                    className={`cursor-pointer ${currentFilter.type === "label" ? 'bg-accent' : ''}`}
                    onSelect={(e) => e.preventDefault()}
                  >
                    <Tag size={16} className="mr-2" />
                    ラベルで絞り込み
                    <span className="ml-auto text-xs text-muted-foreground">→</span>
                  </DropdownMenuItem>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="z-200 w-56">
                  <DropdownMenuItem
                    onClick={() => handleFilterSelect("label")}
                    className={currentFilter.type === "has-labels" ? 'bg-accent' : ''}
                  >
                    すべてのラベル
                  </DropdownMenuItem>
                  <DropdownMenuSeparator />
                  {availableLabels.map((label) => (
                    <DropdownMenuItem
                      key={label.id}
                      onClick={() => handleLabelToggle(label.name)}
                      className={currentFilter.selectedLabelNames?.includes(label.name) ? 'bg-accent' : ''}
                    >
                      <div
                        style={{ backgroundColor: label.color }}
                        className="mr-2 w-3 h-3 rounded-xs"
                      />
                      {label.name}
                    </DropdownMenuItem>
                  ))}
                </DropdownMenuContent>
              </DropdownMenu>
            </>
          )}

          <DropdownMenuSeparator />
          {/* 優先度でフィルター */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <DropdownMenuItem
                className={`cursor-pointer ${currentFilter.type === "priority" ? 'bg-accent' : ''}`}
                onSelect={(e) => e.preventDefault()}
              >
                <Star size={16} className="mr-2" />
                優先度で絞り込み
                <span className="ml-auto text-xs text-muted-foreground">→</span>
              </DropdownMenuItem>
            </DropdownMenuTrigger>
            <DropdownMenuContent className="z-200 w-56">
              {(["critical", "high", "medium", "low"] as Priority[]).map(
                (priority) => {
                  const config = priorityConfig[priority];
                  const IconComponent = config.icon;
                  return (
                    <DropdownMenuItem
                      key={priority}
                      onClick={() => handlePriorityToggle(priority)}
                      className={currentFilter.selectedPriorities?.includes(priority) ? 'bg-accent' : ''}
                    >
                      <span className="mr-2">
                        <IconComponent size={16} />
                      </span>
                      {config.label}
                    </DropdownMenuItem>
                  );
                },
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </DropdownMenuContent>
      </DropdownMenu>
    );
  },
);

FilterSelector.displayName = "FilterSelector";

export default FilterSelector;
