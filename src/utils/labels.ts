import type { Label } from '../types';

export const LABEL_COLORS = [
  { name: 'Default', variant: 'default' },
  { name: 'Primary', variant: 'primary' },
  { name: 'Success', variant: 'success' },
  { name: 'Attention', variant: 'attention' },
  { name: 'Severe', variant: 'severe' },
  { name: 'Danger', variant: 'danger' },
  { name: 'Done', variant: 'done' },
] as const;

export const getColorInfo = (
  variant: string
): { name: string; variant: string } =>
  LABEL_COLORS.find(c => c.variant === variant) ?? LABEL_COLORS[0];

export const createLabel = (name: string, variant: string): Label => ({
  id: `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
  name: name.trim(),
  color: variant,
});
