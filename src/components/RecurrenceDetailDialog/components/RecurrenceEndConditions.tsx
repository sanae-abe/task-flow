import React from "react";
import { Input } from "@/components/ui/input";
import { Timer } from "lucide-react";
import type { RecurrenceConfig } from "../types";

interface RecurrenceEndConditionsProps {
  config: RecurrenceConfig;
  onEndDateChange: (value: string) => void;
  onMaxOccurrencesChange: (value: string) => void;
}

const RecurrenceEndConditions: React.FC<RecurrenceEndConditionsProps> = ({
  config,
  onEndDateChange,
  onMaxOccurrencesChange,
}) => (
  <div className="mt-2 border-t border-border pt-4">
    <div className="mb-2">
      <h3 className="text-sm font-semibold flex items-center gap-1">
        <Timer size={16} />
        <span>終了条件</span>
      </h3>
    </div>
    <div className="flex flex-col gap-3">
      <div className="flex flex-row items-center gap-2">
        <label className="self-center min-w-[80px] text-sm">終了日</label>
        <Input
          type="date"
          value={config.endDate || ""}
          onChange={(e) => onEndDateChange(e.target.value)}
          className="w-[150px]"
        />
      </div>
      <div className="flex flex-row items-center gap-2">
        <label className="self-center min-w-[80px] text-sm">最大回数</label>
        <Input
          type="number"
          value={config.maxOccurrences?.toString() || ""}
          onChange={(e) => onMaxOccurrencesChange(e.target.value)}
          placeholder="回数"
          className="w-[80px]"
          min={1}
          step={1}
        />
        <span className="text-sm">回</span>
      </div>
    </div>
  </div>
);

export default RecurrenceEndConditions;