import { FormControl, TextInput, Textarea } from '@primer/react';
import React, { memo } from 'react';

import type { FormFieldProps, TextareaFieldProps, DateFieldProps, DateTimeFieldProps } from '../types/dialog';

const FORM_STYLES = {
  container: {
    mb: 4
  },
  input: {
    width: '100%'
  }
} as const;

const FormField = memo<FormFieldProps>(({
  id,
  label,
  value,
  placeholder,
  onChange,
  onKeyDown,
  autoFocus = false,
  required = false,
  hideLabel = false,
  sx
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <FormControl id={id} sx={sx ? { ...FORM_STYLES.container, ...sx } : FORM_STYLES.container}>
      {!hideLabel && (
        <FormControl.Label>
          {label}
        </FormControl.Label>
      )}
      <TextInput
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        sx={FORM_STYLES.input}
        aria-required={required}
        aria-label={hideLabel ? label : undefined}
      />
    </FormControl>
  );
});

export const TextareaField = memo<TextareaFieldProps>(({
  id,
  label,
  value,
  placeholder,
  onChange,
  onKeyDown,
  rows = 3,
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    onChange(e.target.value);
  };

  return (
    <FormControl id={id} sx={FORM_STYLES.container}>
      <FormControl.Label>
        {label}
      </FormControl.Label>
      <Textarea
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        sx={{
          ...FORM_STYLES.input,
          resize: 'none',
          height: `${rows * 20 + 16}px`
        }}
        aria-required={required}
      />
    </FormControl>
  );
});

export const DateField = memo<DateFieldProps>(({
  id,
  label,
  value,
  onChange,
  onKeyDown,
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <FormControl id={id} sx={FORM_STYLES.container}>
      <FormControl.Label>
        {label}
      </FormControl.Label>
      <TextInput
        type="date"
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        sx={FORM_STYLES.input}
        aria-required={required}
      />
    </FormControl>
  );
});

export const DateTimeField = memo<DateTimeFieldProps>(({
  id,
  label,
  value,
  onChange,
  onKeyDown,
  required = false
}) => {
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    onChange(e.target.value);
  };

  return (
    <FormControl id={id} sx={FORM_STYLES.container}>
      <FormControl.Label>
        {label}
      </FormControl.Label>
      <TextInput
        type="datetime-local"
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        sx={FORM_STYLES.input}
        aria-required={required}
      />
    </FormControl>
  );
});

export default FormField;
export { FORM_STYLES };