import type { Label } from '../types';

export const LABEL_COLORS = [
  { name: 'Blue', value: '#0969da', bg: '#ddf4ff' },
  { name: 'Green', value: '#1a7f37', bg: '#dcffe4' },
  { name: 'Red', value: '#cf222e', bg: '#ffebe9' },
  { name: 'Orange', value: '#bc4c00', bg: '#fff8dc' },
  { name: 'Purple', value: '#8250df', bg: '#fbefff' },
  { name: 'Pink', value: '#bf8700', bg: '#fff5b1' },
  { name: 'Gray', value: '#656d76', bg: '#f6f8fa' },
  { name: 'Cyan', value: '#0598bc', bg: '#cff4fc' }
] as const;

export const getColorInfo = (color: string): { name: string; value: string; bg: string } => {
  return LABEL_COLORS.find(c => c.value === color) || LABEL_COLORS[0];
};

export const createLabel = (name: string, color: string): Label => {
  return {
    id: `label-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
    name: name.trim(),
    color
  };
};