import { useCallback, useRef, useState } from 'react';

interface UseDataImportDropZoneOptions {
  maxFileSize: number;
  onFileSelected: (file: File) => void;
  disabled?: boolean;
}

export const useDataImportDropZone = ({
  maxFileSize,
  onFileSelected,
  disabled = false,
}: UseDataImportDropZoneOptions) => {
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const dragCounterRef = useRef(0);

  const validateFile = useCallback(
    (file: File): string | null => {
      if (!file.type.includes('json') && !file.name.endsWith('.json')) {
        return 'JSONファイルを選択してください';
      }

      if (file.size > maxFileSize) {
        return `ファイルサイズが大きすぎます（最大: ${maxFileSize / 1024 / 1024}MB）`;
      }

      return null;
    },
    [maxFileSize]
  );

  const handleDragOver = useCallback(
    (e: React.DragEvent) => {
      if (disabled) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      if (e.dataTransfer) {
        e.dataTransfer.dropEffect = 'copy';
      }
    },
    [disabled]
  );

  const handleDragEnter = useCallback(
    (e: React.DragEvent) => {
      if (disabled) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      dragCounterRef.current++;

      if (e.dataTransfer?.items && e.dataTransfer.items.length > 0) {
        setIsDragOver(true);
      }
    },
    [disabled]
  );

  const handleDragLeave = useCallback(
    (e: React.DragEvent) => {
      if (disabled) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      dragCounterRef.current--;

      if (dragCounterRef.current === 0) {
        setIsDragOver(false);
      }
    },
    [disabled]
  );

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      if (disabled) {
        return;
      }

      e.preventDefault();
      e.stopPropagation();

      setIsDragOver(false);
      dragCounterRef.current = 0;

      const files = Array.from(e.dataTransfer?.files ?? []);
      const file = files[0];

      if (!file) {
        return;
      }

      const validationError = validateFile(file);
      if (validationError) {
        // eslint-disable-next-line no-console
        console.error(validationError);
        return;
      }

      onFileSelected(file);
    },
    [disabled, validateFile, onFileSelected]
  );

  const handleFileSelect = useCallback(() => {
    if (disabled) {
      return;
    }
    fileInputRef.current?.click();
  }, [disabled]);

  const handleFileInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      if (disabled) {
        return;
      }

      const file = e.target.files?.[0];
      if (!file) {
        return;
      }

      const validationError = validateFile(file);
      if (validationError) {
        // eslint-disable-next-line no-console
        console.error(validationError);
        return;
      }

      onFileSelected(file);
    },
    [disabled, validateFile, onFileSelected]
  );

  return {
    isDragOver,
    fileInputRef,
    handleDragOver,
    handleDragEnter,
    handleDragLeave,
    handleDrop,
    handleFileSelect,
    handleFileInputChange,
  };
};
