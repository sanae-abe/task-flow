/**
 * LabelSelector コンポーネントの定数
 */
export const LABEL_CIRCLE_SIZE = 12;
export const EMPTY_LABELS_MESSAGE = 'ラベルがありません';
export const SELECT_LABEL_TEXT = 'ラベルを選択';
export const ADD_LABEL_TEXT = '新しいラベルを追加';

/**
 * LabelSelector コンポーネントのスタイル定数
 */
export const LABEL_SELECTOR_STYLES = {
  container: {
    mt: 2,
  },
  menuContainer: {
    display: 'flex',
    gap: 2,
    alignItems: 'center',
  },
  buttonHover: {
    '&:hover': {
      color: 'fg.default',
      bg: 'neutral.subtle',
    },
  },
} as const;
