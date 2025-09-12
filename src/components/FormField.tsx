import { Box, Text, TextInput, Textarea } from '@primer/react';
import React, { memo } from 'react';

import type { FormFieldProps, TextareaFieldProps, DateFieldProps, DateTimeFieldProps } from '../types/dialog';

const FORM_STYLES = {
  container: {
    mb: 4,
    display: 'flex',
    flexDirection: 'column' as const,
    gap: 1
  },
  label: {
    fontSize: 1,
    color: 'fg.muted'
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

  const containerStyles = sx ? { ...FORM_STYLES.container, ...sx } : FORM_STYLES.container;

  return (
    <Box sx={containerStyles}>
      {!hideLabel && (
        <Text 
          as="label" 
          htmlFor={id}
          sx={FORM_STYLES.label}
        >
          {label}
        </Text>
      )}
      <TextInput
        id={id}
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        placeholder={placeholder}
        autoFocus={autoFocus}
        sx={FORM_STYLES.input}
        aria-required={required}
        aria-label={hideLabel ? label : undefined}
      />
    </Box>
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
    <Box sx={FORM_STYLES.container}>
      <Text 
        as="label" 
        htmlFor={id}
        sx={FORM_STYLES.label}
      >
        {label}
      </Text>
      <Textarea
        id={id}
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
    </Box>
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
    <Box sx={FORM_STYLES.container}>
      <Text 
        as="label" 
        htmlFor={id}
        sx={FORM_STYLES.label}
      >
        {label}
      </Text>
      <TextInput
        id={id}
        type="date"
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        sx={FORM_STYLES.input}
        aria-required={required}
      />
    </Box>
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
    <Box sx={FORM_STYLES.container}>
      <Text 
        as="label" 
        htmlFor={id}
        sx={FORM_STYLES.label}
      >
        {label}
      </Text>
      <TextInput
        id={id}
        type="datetime-local"
        value={value}
        onChange={handleChange}
        onKeyDown={onKeyDown}
        sx={FORM_STYLES.input}
        aria-required={required}
      />
    </Box>
  );
});

export default FormField;
export { FORM_STYLES };