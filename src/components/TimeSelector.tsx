import { ClockIcon } from "@primer/octicons-react";
import { Button } from "@/components/ui/button";
import React, { useState, useCallback } from "react";

import TimeSelectorDialog from "./TimeSelectorDialog";

interface TimeSelectorProps {
  hasTime: boolean;
  dueTime: string;
  onTimeChange: (hasTime: boolean, time: string) => void;
  disabled?: boolean;
}

const TimeSelector: React.FC<TimeSelectorProps> = ({
  hasTime,
  dueTime,
  onTimeChange,
  disabled = false,
}) => {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleDetailDialogSave = useCallback(
    (newHasTime: boolean, newTime: string) => {
      onTimeChange(newHasTime, newTime);
    },
    [onTimeChange],
  );

  const handleDetailDialogClose = useCallback(() => {
    setIsDetailDialogOpen(false);
  }, []);

  const handleButtonClick = useCallback(() => {
    if (!disabled) {
      setIsDetailDialogOpen(true);
    }
  }, [disabled]);

  const getButtonText = () => {
    if (hasTime && dueTime) {
      return `${dueTime} まで`;
    }
    return "時刻を設定";
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        disabled={disabled}
        variant="ghost"
        className="flex items-center gap-2"
      >
        <ClockIcon size={16} />
        {getButtonText()}
      </Button>

      <TimeSelectorDialog
        isOpen={isDetailDialogOpen}
        hasTime={hasTime}
        dueTime={dueTime}
        onSave={handleDetailDialogSave}
        onClose={handleDetailDialogClose}
      />
    </>
  );
};

export default TimeSelector;
