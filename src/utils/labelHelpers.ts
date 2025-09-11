export interface LabelColors {
  bg: string;
  color: string;
}

export const getLabelColors = (variant: string): LabelColors => {
  switch (variant) {
    case 'default':
      return { bg: 'canvas.default', color: 'fg.default' };
    case 'primary':
      return { bg: 'canvas.subtle', color: 'fg.emphasis' };
    case 'secondary':
      return { bg: 'neutral.emphasis', color: 'fg.onEmphasis' };
    case 'accent':
      return { bg: 'accent.emphasis', color: 'fg.onEmphasis' };
    case 'success':
      return { bg: 'success.emphasis', color: 'fg.onEmphasis' };
    case 'attention':
      return { bg: 'attention.emphasis', color: 'fg.onEmphasis' };
    case 'severe':
      return { bg: 'severe.emphasis', color: 'fg.onEmphasis' };
    case 'danger':
      return { bg: 'danger.emphasis', color: 'fg.onEmphasis' };
    case 'done':
      return { bg: 'done.emphasis', color: 'fg.onEmphasis' };
    case 'sponsors':
      return { bg: 'sponsors.emphasis', color: 'fg.onEmphasis' };
    default:
      return { bg: 'neutral.emphasis', color: 'fg.onEmphasis' };
  }
};