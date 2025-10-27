/**
 * LoadingButton component tests
 * ボタンコンポーネントの基本的なテスト
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'

// Simple LoadingButton component for testing
interface LoadingButtonProps {
  children: React.ReactNode
  loading?: boolean
  onClick?: () => void
  disabled?: boolean
}

const LoadingButton: React.FC<LoadingButtonProps> = ({
  children,
  loading = false,
  onClick,
  disabled = false
}) => (
    <button
      onClick={onClick}
      disabled={disabled || loading}
      className={`px-4 py-2 rounded ${loading ? 'opacity-50' : ''}`}
    >
      {loading ? (
        <span data-testid="loading-spinner">読み込み中...</span>
      ) : (
        children
      )}
    </button>
  )

describe('LoadingButton', () => {
  it('should render children when not loading', () => {
    render(<LoadingButton>保存</LoadingButton>)

    expect(screen.getByText('保存')).toBeInTheDocument()
    expect(screen.queryByTestId('loading-spinner')).not.toBeInTheDocument()
  })

  it('should render loading state when loading', () => {
    render(<LoadingButton loading>保存</LoadingButton>)

    expect(screen.getByTestId('loading-spinner')).toBeInTheDocument()
    expect(screen.getByText('読み込み中...')).toBeInTheDocument()
    expect(screen.queryByText('保存')).not.toBeInTheDocument()
  })

  it('should be disabled when loading', () => {
    render(<LoadingButton loading>保存</LoadingButton>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should be disabled when disabled prop is true', () => {
    render(<LoadingButton disabled>保存</LoadingButton>)

    const button = screen.getByRole('button')
    expect(button).toBeDisabled()
  })

  it('should call onClick when clicked and not loading', () => {
    const handleClick = vi.fn()
    render(<LoadingButton onClick={handleClick}>保存</LoadingButton>)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).toHaveBeenCalledTimes(1)
  })

  it('should not call onClick when loading', () => {
    const handleClick = vi.fn()
    render(<LoadingButton loading onClick={handleClick}>保存</LoadingButton>)

    const button = screen.getByRole('button')
    fireEvent.click(button)

    expect(handleClick).not.toHaveBeenCalled()
  })

  it('should apply correct CSS classes', () => {
    const { rerender } = render(<LoadingButton>保存</LoadingButton>)

    let button = screen.getByRole('button')
    expect(button).toHaveClass('px-4', 'py-2', 'rounded')
    expect(button).not.toHaveClass('opacity-50')

    rerender(<LoadingButton loading>保存</LoadingButton>)

    button = screen.getByRole('button')
    expect(button).toHaveClass('px-4', 'py-2', 'rounded', 'opacity-50')
  })
})