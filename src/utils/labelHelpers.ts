export interface LabelColors {
  bg: string;
  color: string;
}

export const getLabelColors = (variant: string): LabelColors => {
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