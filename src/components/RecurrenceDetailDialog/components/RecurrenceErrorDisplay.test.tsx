import { render, screen } from '@testing-library/react';
import { describe, it, expect } from 'vitest';
import RecurrenceErrorDisplay from './RecurrenceErrorDisplay';

describe('RecurrenceErrorDisplay', () => {
  it('should render null when no errors exist', () => {
    const { container } = render(<RecurrenceErrorDisplay errors={[]} />);
    expect(container.firstChild).toBeNull();
  });

  it('should render single error message', () => {
    render(<RecurrenceErrorDisplay errors={['Error message 1']} />);
    expect(screen.getByText('Error message 1')).toBeInTheDocument();
  });

  it('should render multiple error messages', () => {
    const errors = ['Error message 1', 'Error message 2', 'Error message 3'];
    render(<RecurrenceErrorDisplay errors={errors} />);

    errors.forEach(error => {
      expect(screen.getByText(error)).toBeInTheDocument();
    });
  });

  it('should render each error message in separate InlineMessage', () => {
    const errors = ['Critical error 1', 'Critical error 2'];
    render(<RecurrenceErrorDisplay errors={errors} />);

    // Check both error messages are rendered
    expect(screen.getByText('Critical error 1')).toBeInTheDocument();
    expect(screen.getByText('Critical error 2')).toBeInTheDocument();
  });

  it('should render errors in a container with mt-2 class', () => {
    const errors = ['Small error'];
    const { container } = render(<RecurrenceErrorDisplay errors={errors} />);

    const errorContainer = container.querySelector('.mt-2');
    expect(errorContainer).toBeInTheDocument();
  });

  it('should handle empty string errors', () => {
    const { container } = render(<RecurrenceErrorDisplay errors={['']} />);
    // Empty string still creates a container
    const errorContainer = container.querySelector('.mt-2');
    expect(errorContainer).toBeInTheDocument();
  });

  it('should handle special characters in error messages', () => {
    const errors = ['Error with <special> & "characters"'];
    render(<RecurrenceErrorDisplay errors={errors} />);
    // Use regex for special characters
    expect(
      screen.getByText(/Error with <special> & "characters"/)
    ).toBeInTheDocument();
  });

  it('should render correct number of error messages', () => {
    const errors = ['Error 1', 'Error 2', 'Error 3', 'Error 4'];
    const { container } = render(<RecurrenceErrorDisplay errors={errors} />);

    const messageElements = container.querySelectorAll('.mt-2 > *');
    expect(messageElements).toHaveLength(4);
  });
});
