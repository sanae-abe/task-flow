import { useCallback, useReducer, useEffect, useRef } from "react";
import type {
  FormState,
  FormAction,
  FormFieldConfig,
  UseFormReturn,
  FormError,
  ValidationRule,
} from "../types/unified-form";

// フォーム初期状態
const createInitialState = (
  fields: FormFieldConfig[],
  initialValues?: Record<string, unknown>,
): FormState => {
  const values = fields.reduce((acc, field) => {
    // initialValuesに値があるかチェック（undefinedも含む）
    const hasInitialValue = initialValues && field.name in initialValues;
    const value = hasInitialValue
      ? initialValues[field.name]
      : (field.value ?? "");

    return {
      ...acc,
      [field.name]: value,
    };
  }, {});

  return {
    values,
    errors: [],
    touched: {},
    isSubmitting: false,
    isDirty: false,
    isValid: true,
  };
};

// フォームレデューサー
const formReducer = (state: FormState, action: FormAction): FormState => {
  switch (action.type) {
    case "SET_FIELD_VALUE": {
      const newValues = { ...state.values, [action.fieldId]: action.value };
      const isDirty = Object.keys(newValues).some(
        (key) => newValues[key] !== state.values[key],
      );

      return {
        ...state,
        values: newValues,
        isDirty,
      };
    }

    case "SET_FIELD_ERROR": {
      const newErrors = state.errors.filter(
        (_error) => _error.fieldId !== action.fieldId,
      );
      if (action._error) {
        newErrors.push({ fieldId: action.fieldId, message: action._error });
      }

      return {
        ...state,
        errors: newErrors,
        isValid: newErrors.length === 0,
      };
    }

    case "SET_FIELD_TOUCHED": {
      return {
        ...state,
        touched: { ...state.touched, [action.fieldId]: action.touched },
      };
    }

    case "SET_SUBMITTING": {
      return {
        ...state,
        isSubmitting: action.isSubmitting,
      };
    }

    case "SET_ERRORS": {
      return {
        ...state,
        errors: action.errors,
        isValid: action.errors.length === 0,
      };
    }

    case "RESET_FORM": {
      // fieldsを参照するため、reducerの外で処理する必要がある
      return action.newState;
    }

    case "VALIDATE_FORM": {
      // バリデーションロジックは別途実装
      return state;
    }

    default:
      return state;
  }
};

// バリデーション関数
const validateField = (
  value: unknown,
  validation?: ValidationRule,
): string | null => {
  if (!validation) {
    return null;
  }

  // 必須チェック
  if (validation.required && (!value || value.toString().trim() === "")) {
    return "必須項目です";
  }

  // 最小長チェック
  if (
    validation.minLength &&
    value &&
    value.toString().length < validation.minLength
  ) {
    return `${validation.minLength}文字以上入力してください`;
  }

  // 最大長チェック
  if (
    validation.maxLength &&
    value &&
    value.toString().length > validation.maxLength
  ) {
    return `${validation.maxLength}文字以下で入力してください`;
  }

  // パターンチェック
  if (
    validation.pattern &&
    value &&
    !validation.pattern.test(value.toString())
  ) {
    return "入力形式が正しくありません";
  }

  // カスタムバリデーション
  if (validation.custom && value) {
    const customError = validation.custom(value);
    if (customError) {
      return customError;
    }
  }

  return null;
};

/**
 * 統合フォーム管理フック
 *
 * @param fields - フォームフィールド設定配列
 * @param initialValues - 初期値（オプション）
 * @returns フォーム状態と操作関数
 */
export const useUnifiedForm = (
  fields: FormFieldConfig[],
  initialValues?: Record<string, unknown>,
): UseFormReturn => {
  const [state, dispatch] = useReducer(
    formReducer,
    createInitialState(fields, initialValues),
  );

  // 前回のinitialValuesを追跡するためのref
  const prevInitialValuesRef = useRef<string | null>(null);

  // フィールド値設定
  const setValue = useCallback(
    (fieldId: string, value: unknown) => {
      dispatch({ type: "SET_FIELD_VALUE", fieldId, value });

      // リアルタイムバリデーション（フィールドがtouchedの場合のみ）
      if (state.touched[fieldId]) {
        const field = fields.find((f) => f.name === fieldId);
        if (field?.validation) {
          const _error = validateField(value, field.validation);
          dispatch({ type: "SET_FIELD_ERROR", fieldId, _error });
        }
      }
    },
    [fields, state.touched],
  );

  // エラー設定
  const setError = useCallback((fieldId: string, _error: string | null) => {
    dispatch({ type: "SET_FIELD_ERROR", fieldId, _error });
  }, []);

  // タッチ状態設定
  const setTouched = useCallback((fieldId: string, touched: boolean) => {
    dispatch({ type: "SET_FIELD_TOUCHED", fieldId, touched });
  }, []);

  // 個別フィールドバリデーション
  const validateFieldCallback = useCallback(
    (fieldId: string): boolean => {
      const field = fields.find((f) => f.name === fieldId);
      if (!field?.validation) {
        return true;
      }

      const value = state.values[fieldId];
      const _error = validateField(value, field.validation);
      dispatch({ type: "SET_FIELD_ERROR", fieldId, _error });

      return !_error;
    },
    [fields, state.values],
  );

  // フォーム全体バリデーション
  const validateForm = useCallback((): boolean => {
    const errors: FormError[] = [];

    fields.forEach((field) => {
      if (field.validation) {
        const value = state.values[field.name];
        const _error = validateField(value, field.validation);
        if (_error) {
          errors.push({ fieldId: field.name, message: _error });
        }
      }
    });

    dispatch({ type: "SET_ERRORS", errors });
    return errors.length === 0;
  }, [fields, state.values]);

  // フォームリセット
  const resetForm = useCallback(
    (newInitialValues?: Record<string, unknown>) => {
      const newState = createInitialState(fields, newInitialValues);
      dispatch({ type: "RESET_FORM", newState });
    },
    [fields],
  );

  // フォーム送信ハンドラー
  const handleSubmit = useCallback(
    (onSubmit: (values: Record<string, unknown>) => void | Promise<void>) =>
      async (e?: React.FormEvent) => {
        if (e) {
          e.preventDefault();
        }

        dispatch({ type: "SET_SUBMITTING", isSubmitting: true });

        try {
          // 送信前バリデーション
          if (!validateForm()) {
            return;
          }

          await onSubmit(state.values);
        } catch (_error) {
          // eslint-disable-next-line no-console
          console.error("Form submission _error:", _error);
        } finally {
          dispatch({ type: "SET_SUBMITTING", isSubmitting: false });
        }
      },
    [state.values, validateForm],
  );

  // フィールドの有効性チェック
  const isFieldValid = useCallback(
    (fieldId: string): boolean =>
      !state.errors.some((_error) => _error.fieldId === fieldId),
    [state.errors],
  );

  // フィールドエラー取得
  const getFieldError = useCallback(
    (fieldId: string): string | null => {
      const _error = state.errors.find((_error) => _error.fieldId === fieldId);
      return _error?.message ?? null;
    },
    [state.errors],
  );

  // 初期値変更時の状態更新
  useEffect(() => {
    if (initialValues) {
      const initialValuesString = JSON.stringify(initialValues);

      // 前回の値と比較して変更があった場合のみ更新
      if (prevInitialValuesRef.current !== initialValuesString) {
        prevInitialValuesRef.current = initialValuesString;

        // フォーム全体をリセットするのではなく、個別フィールドを更新
        Object.entries(initialValues).forEach(([fieldName, value]) => {
          if (state.values[fieldName] !== value) {
            setValue(fieldName, value);
          }
        });
      }
    }
  }, [initialValues, setValue, state.values]);

  return {
    state,
    setValue,
    setError,
    setTouched,
    validateField: validateFieldCallback,
    validateForm,
    resetForm,
    handleSubmit,
    isFieldValid,
    getFieldError,
  };
};
