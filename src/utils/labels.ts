import type { Label } from '../types';

export const LABEL_COLORS = [
  { name: 'Default', variant: 'default' },
  { name: 'Primary', variant: 'primary' },
  { name: 'Secondary', variant: 'secondary' },
  { name: 'Accent', variant: 'accent' },
  { name: 'Success', variant: 'success' },
  { name: 'Attention', variant: 'attention' },
  { name: 'Severe', variant: 'severe' },
  { name: 'Danger', variant: 'danger' },
  { name: 'Done', variant: 'done' },
  { name: 'Sponsors', variant: 'sponsors' }
] as const;

export const getColorInfo = (variant: string): { name: string; variant: string } => {
  return LABEL_COLORS.find(c => c.variant === variant) || LABEL_COLORS[0];
};

export const createLabel = (name: string, variant: string): Label => {
  return {
    id: `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    color: variant
  };
};