export interface LabelColors {
  bg: string;
  color: string;
}

// ヘックスカラーかどうかを判定
const isHexColor = (color: string): boolean =>
  /^#([A-Fa-f0-9]{6}|[A-Fa-f0-9]{3})$/.test(color);

// 色の明度を計算して適切なテキストカラーを決定
const getTextColor = (backgroundColor: string): string => {
  // ヘックス色から RGB に変換
  const hex = backgroundColor.replace('#', '');
  const r = parseInt(hex.substring(0, 2), 16);
  const g = parseInt(hex.substring(2, 4), 16);
  const b = parseInt(hex.substring(4, 6), 16);

  // 相対輝度を計算 (WCAG基準)
  const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;

  // 明度が0.5以上なら黒文字、それ以下なら白文字
  return luminance > 0.5 ? '#000000' : '#ffffff';
};

export const getLabelColors = (variant: string): LabelColors => {
  // ヘックスカラーが直接渡された場合
  if (isHexColor(variant)) {
    return {
      bg: variant,
      color: getTextColor(variant),
    };
  }

  // 事前定義されたvariant名の場合
  switch (variant) {
    case 'default':
      return { bg: '#656d76', color: '#ffffff' };
    case 'primary':
      return { bg: '#0969da', color: '#ffffff' };
    case 'success':
      return { bg: '#1a7f37', color: '#ffffff' };
    case 'attention':
      return { bg: '#9a6700', color: '#ffffff' };
    case 'severe':
      return { bg: '#bc4c00', color: '#ffffff' };
    case 'danger':
      return { bg: '#d1242f', color: '#ffffff' };
    case 'done':
      return { bg: '#8250df', color: '#ffffff' };
    default:
      return { bg: '#656d76', color: '#ffffff' };
  }
};
