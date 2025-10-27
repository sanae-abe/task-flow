import { ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem
} from "@/components/ui/dropdown-menu";
import React from "react";

import type { SortOption, SortConfig } from "../types";

const SORT_OPTIONS: SortConfig[] = [
  { option: "manual", label: "手動" },
  { option: "priority", label: "優先度順" },
  { option: "createdAt", label: "作成日順" },
  { option: "updatedAt", label: "更新日順" },
  { option: "dueDate", label: "期限順" },
  { option: "title", label: "名前順" },
];

interface TaskSortSelectorProps {
  readonly currentSort: SortOption;
  readonly onSortChange: (option: SortOption) => void;
}

const TaskSortSelector: React.FC<TaskSortSelectorProps> = ({
  currentSort,
  onSortChange,
}) => {
  const currentSortConfig = SORT_OPTIONS.find(
    (option) => option.option === currentSort,
  );

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button
          variant="ghost"
          size="sm"
          aria-label={`現在のソート: ${currentSortConfig?.label ?? "手動"}`}
          className="flex items-center gap-1 text-neutral-600 text-xs"
        >
          <ArrowUpDown size={16} />
          {currentSortConfig?.label ?? "手動"}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuRadioGroup value={currentSort} onValueChange={(value) => onSortChange(value as SortOption)}>
          {SORT_OPTIONS.map((option) => (
            <DropdownMenuRadioItem
              key={option.option}
              value={option.option}
              className={currentSort === option.option ? "bg-gray-100" : ""}
            >
              {option.label}
            </DropdownMenuRadioItem>
          ))}
        </DropdownMenuRadioGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TaskSortSelector;
