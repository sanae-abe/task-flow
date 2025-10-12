import React from "react";
import {
  Text,
  ActionMenu,
  ActionList,
  Checkbox,
} from "@primer/react";
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
    <div style={{ display: "flex", alignItems: "center", gap: "8px" }}>
      <Text sx={{ fontSize: 1, minWidth: "60px" }}>曜日選択:</Text>
      <ActionMenu>
        <ActionMenu.Button sx={{ width: "200px" }}>
          {selectedDaysText}
        </ActionMenu.Button>
        <ActionMenu.Overlay>
          <ActionList>
            {WEEKDAYS.map((day) => (
              <ActionList.Item
                key={day.value}
                onSelect={() =>
                  onDaysOfWeekChange(
                    day.value,
                    !config.daysOfWeek?.includes(day.value)
                  )
                }
              >
                <div
                  style={{
                    display: "flex",
                    alignItems: "center",
                    gap: "8px",
                    width: "100%",
                  }}
                >
                  <Checkbox
                    checked={config.daysOfWeek?.includes(day.value) || false}
                    onChange={() => {}}
                  />
                  {day.label}
                </div>
              </ActionList.Item>
            ))}
          </ActionList>
        </ActionMenu.Overlay>
      </ActionMenu>
    </div>
  );
};

export default WeeklyOptionsSelector;