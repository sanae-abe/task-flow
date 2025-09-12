import { useState, useEffect, useCallback, useMemo } from 'react';

interface UseFormDialogProps {
  isOpen: boolean;
  initialValue?: string;
  onSave: (value: string) => void;
  onCancel: () => void;
  required?: boolean;
  minLength?: number;
}

interface UseFormDialogReturn {
  value: string;
  setValue: (value: string) => void;
  handleSave: () => void;
  handleKeyPress: (event: React.KeyboardEvent<HTMLInputElement>) => void;
  isValid: boolean;
  reset: () => void;
}

export const useFormDialog = ({
  isOpen,
  initialValue = '',
  onSave,
  onCancel,
  required = true,
  minLength = 1
}: UseFormDialogProps): UseFormDialogReturn => {
  const [value, setValue] = useState(initialValue);

  useEffect(() => {
    if (isOpen) {
      setValue(initialValue);
    }
  }, [isOpen, initialValue]);

  const reset = useCallback(() => {
    setValue(initialValue);
  }, [initialValue]);

  const handleSave = useCallback(() => {
    const trimmedValue = value.trim();
    if (!required || (trimmedValue.length >= minLength)) {
      try {
        onSave(trimmedValue);
      } catch (error) {
        console.error('Error saving form data:', error);
      }
    }
  }, [value, onSave, required, minLength]);

  const handleKeyPress = useCallback((event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      handleSave();
    } else if (event.key === 'Escape') {
      event.preventDefault();
      onCancel();
    }
  }, [handleSave, onCancel]);

  const isValid = useMemo(() => {
    if (!required) {
      return true;
    }
    const trimmedValue = value.trim();
    return trimmedValue.length >= minLength;
  }, [value, required, minLength]);

  return {
    value,
    setValue,
    handleSave,
    handleKeyPress,
    isValid,
    reset
  };
};