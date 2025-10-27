/**
 * カスタムフィールドコンポーネント
 *
 * TaskFlow固有のカスタムフィールドタイプに対応
 */

import React, { useCallback } from "react";

import LabelSelector from "../../../LabelSelector";
import CircleColorPicker from "../../../CircleColorPicker";
import FileUploader from "../../../FileUploader";
import RecurrenceSelector from "../../../RecurrenceSelector";
import type { BaseFieldProps } from "./types";
import type {
  Label,
  FileAttachment,
  RecurrenceConfig,
} from "../../../../types";

/**
 * ラベルセレクターフィールドプロパティ
 */
interface LabelSelectorFieldProps extends BaseFieldProps {
  type: "label-selector";
}

/**
 * カラーセレクターフィールドプロパティ
 */
interface ColorSelectorFieldProps extends BaseFieldProps {
  type: "color-selector";
}

/**
 * ファイルアップローダーフィールドプロパティ
 */
interface FileUploaderFieldProps extends BaseFieldProps {
  type: "file";
}

/**
 * 繰り返し設定フィールドプロパティ
 */
interface RecurrenceSelectorFieldProps extends BaseFieldProps {
  type: "recurrence-selector";
}

/**
 * カスタムコンポーネントフィールドプロパティ
 */
interface CustomComponentFieldProps extends BaseFieldProps {
  type: "custom";
  customComponent?: React.ReactNode;
}

/**
 * ラベルセレクターフィールドコンポーネント
 */
export const LabelSelectorField: React.FC<LabelSelectorFieldProps> = React.memo(
  ({ value, onChange }) => {
    const handleLabelsChange = useCallback(
      (labels: Label[]) => onChange(labels),
      [onChange],
    );

    return (
      <LabelSelector
        selectedLabels={(value as Label[]) ?? []}
        onLabelsChange={handleLabelsChange}
      />
    );
  },
);

/**
 * カラーセレクターフィールドコンポーネント
 */
export const ColorSelectorField: React.FC<ColorSelectorFieldProps> = React.memo(
  ({ value, onChange }) => {
    const handleColorSelect = useCallback(
      (color: string) => onChange(color),
      [onChange],
    );

    return (
      <CircleColorPicker
        selectedColor={String(value || "default")}
        onColorSelect={handleColorSelect}
      />
    );
  },
);

/**
 * ファイルアップローダーフィールドコンポーネント
 */
export const FileUploaderField: React.FC<FileUploaderFieldProps> = React.memo(
  ({ value, onChange }) => {
    const handleAttachmentsChange = useCallback(
      (attachments: FileAttachment[]) => onChange(attachments),
      [onChange],
    );

    return (
      <FileUploader
        attachments={(value as FileAttachment[]) ?? []}
        onAttachmentsChange={handleAttachmentsChange}
        showModeSelector={false}
      />
    );
  },
);

/**
 * 繰り返し設定フィールドコンポーネント
 */
export const RecurrenceSelectorField: React.FC<RecurrenceSelectorFieldProps> =
  React.memo(({ value, onChange, disabled = false }) => {
    const handleRecurrenceChange = useCallback(
      (recurrence: RecurrenceConfig | undefined) => onChange(recurrence),
      [onChange],
    );

    return (
      <RecurrenceSelector
        recurrence={value as RecurrenceConfig | undefined}
        onRecurrenceChange={handleRecurrenceChange}
        disabled={disabled}
      />
    );
  });

/**
 * カスタムコンポーネントフィールド
 */
export const CustomComponentField: React.FC<CustomComponentFieldProps> =
  React.memo(({ customComponent }) => <>{customComponent}</>);

// デバッグ用のdisplayName設定
LabelSelectorField.displayName = "LabelSelectorField";
ColorSelectorField.displayName = "ColorSelectorField";
FileUploaderField.displayName = "FileUploaderField";
RecurrenceSelectorField.displayName = "RecurrenceSelectorField";
CustomComponentField.displayName = "CustomComponentField";