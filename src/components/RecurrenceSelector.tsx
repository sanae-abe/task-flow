import { Button } from "@primer/react";
import { SyncIcon } from "@primer/octicons-react";
import React, { useState, useCallback } from "react";

import type { RecurrenceConfig } from "../types";
import { getRecurrenceDescription } from "../utils/recurrence";
import RecurrenceDetailDialog from "./RecurrenceDetailDialog";

interface RecurrenceSelectorProps {
  recurrence?: RecurrenceConfig;
  onRecurrenceChange: (recurrence: RecurrenceConfig | undefined) => void;
  disabled?: boolean;
}

const RecurrenceSelector: React.FC<RecurrenceSelectorProps> = ({
  recurrence,
  onRecurrenceChange,
  disabled = false,
}) => {
  const [isDetailDialogOpen, setIsDetailDialogOpen] = useState(false);

  const handleDetailDialogSave = useCallback(
    (newRecurrence: RecurrenceConfig | undefined) => {
      onRecurrenceChange(newRecurrence);
    },
    [onRecurrenceChange],
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
    if (recurrence?.enabled) {
      return getRecurrenceDescription(recurrence);
    }
    return "繰り返し設定";
  };

  return (
    <>
      <Button
        onClick={handleButtonClick}
        disabled={disabled}
        sx={{
          color: disabled ? "fg.disabled" : "fg.default",
          "& span": {
            display: "flex",
            alignItems: "center",
            gap: 1,
          },
        }}
      >
        <SyncIcon size={16} />
        {getButtonText()}
      </Button>

      <RecurrenceDetailDialog
        isOpen={isDetailDialogOpen}
        recurrence={recurrence}
        onSave={handleDetailDialogSave}
        onClose={handleDetailDialogClose}
      />
    </>
  );
};

export default RecurrenceSelector;
