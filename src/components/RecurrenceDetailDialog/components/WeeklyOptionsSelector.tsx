import React from "react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuCheckboxItem,
} from "@/components/ui/dropdown-menu";
import type { RecurrenceConfig } from "../types";
import { WEEKDAYS } from "../utils/constants";

interface WeeklyOptionsSelectorProps {
  config: RecurrenceConfig;
  onDaysOfWeekChange: (day: number, checked: boolean) => void;
}

const WeeklyOptionsSelector: React.FC<WeeklyOptionsSelectorProps> = ({
  config,
  onDaysOfWeekChange,
}) => {
  if (config.pattern !== "weekly") {
    return null;
  }

  const selectedDaysText =
    config.daysOfWeek && config.daysOfWeek.length > 0
      ? `${config.daysOfWeek
          .map((day) => WEEKDAYS.find((w) => w.value === day)?.label)
          .join("、")}曜日`
      : "曜日を選択";

  return (
    <div className="flex items-center gap-2">
      <label className="self-center min-w-[80px] text-sm">曜日選択</label>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="outline" size="sm">
            {selectedDaysText}
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent className="w-56">
          {WEEKDAYS.map((day) => (
            <DropdownMenuCheckboxItem
              key={day.value}
              checked={config.daysOfWeek?.includes(day.value) || false}
              onCheckedChange={(checked) =>
                onDaysOfWeekChange(day.value, checked)
              }
            >
              {day.label}
            </DropdownMenuCheckboxItem>
          ))}
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  );
};

export default WeeklyOptionsSelector;