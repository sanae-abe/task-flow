import type {
  FormFieldConfig,
  FieldType,
} from "../../../types/unified-form";

/**
 * フォームフィールド作成ヘルパー関数
 */
export const createFormField = (
  config: Partial<FormFieldConfig> & {
    id: string;
    name: string;
    type: FieldType;
    label: string;
    onChange: (value: unknown) => void;
  },
): FormFieldConfig => {
  const getDefaultValue = () => {
    switch (config.type) {
      case "recurrence-selector":
        return { enabled: false, pattern: "daily" as const, interval: 1 };
      case "number":
        return 0;
      case "checkbox":
        return false;
      case "label-selector":
        return [];
      case "file":
        return [];
      default:
        return "";
    }
  };

  const defaultValue = getDefaultValue();

  return {
    value: defaultValue,
    placeholder: "",
    autoFocus: false,
    disabled: false,
    hideLabel: false,
    ...config,
  };
};


/**
 * ラベル作成フォーム用フィールド設定を生成
 */
export const createLabelFormFields = (
  values: {
    name: string;
    color: string;
  },
  handlers: {
    setName: (name: string) => void;
    setColor: (color: string) => void;
  },
  options: {
    onKeyDown?: (e: React.KeyboardEvent) => void;
  } = {},
): FormFieldConfig[] => [
  createFormField({
    id: "label-name",
    name: "name",
    type: "text",
    label: "ラベル名",
    value: values.name,
    placeholder: "ラベル名を入力",
    onChange: handlers.setName as (value: unknown) => void,
    onKeyDown: options.onKeyDown,
    autoFocus: true,
    validation: { required: true, minLength: 1, maxLength: 50 },
  }),

  createFormField({
    id: "label-color",
    name: "color",
    type: "color-selector",
    label: "色",
    value: values.color,
    onChange: handlers.setColor as (value: unknown) => void,
  }),
];


/**
 * サブタスクフォーム用フィールド設定を生成
 */
export const createSubTaskFormFields = (
  values: {
    title: string;
  },
  handlers: {
    setTitle: (title: string) => void;
  },
  options: {
    onKeyDown?: (event: React.KeyboardEvent) => void;
  } = {},
): FormFieldConfig[] => [
  createFormField({
    id: "subtask-title",
    name: "title",
    type: "text",
    label: "サブタスク名",
    value: values.title,
    placeholder: "サブタスク名を入力...",
    onChange: handlers.setTitle as (value: unknown) => void,
    onKeyDown: options.onKeyDown,
    autoFocus: true,
    hideLabel: true,
    validation: { required: true, minLength: 1, maxLength: 100 },
  }),
];

