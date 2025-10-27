/**
 * Button component tests
 * Shadcn/UI Buttonコンポーネントの包括的テスト
 */

import { describe, it, expect, vi } from 'vitest'
import { render, screen, fireEvent } from '@testing-library/react'
import '@testing-library/jest-dom'
import { Button } from './button'

describe('Button', () => {
  describe('Basic functionality', () => {
    it('should render children correctly', () => {
      render(<Button>テストボタン</Button>)

      expect(screen.getByRole('button')).toBeInTheDocument()
      expect(screen.getByText('テストボタン')).toBeInTheDocument()
    })

    it('should handle click events', () => {
      const handleClick = vi.fn()
      render(<Button onClick={handleClick}>クリック</Button>)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).toHaveBeenCalledTimes(1)
    })

    it('should be disabled when disabled prop is true', () => {
      render(<Button disabled>無効ボタン</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
    })
  })

  describe('Variants', () => {
    it('should apply default variant classes', () => {
      render(<Button>デフォルト</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-primary', 'text-primary-foreground')
    })

    it('should apply destructive variant classes', () => {
      render(<Button variant="destructive">削除</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-destructive', 'hover:bg-destructive')
    })

    it('should apply outline variant classes', () => {
      render(<Button variant="outline">アウトライン</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('border', 'border-input', 'bg-background')
    })

    it('should apply secondary variant classes', () => {
      render(<Button variant="secondary">セカンダリ</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('bg-secondary', 'text-secondary-foreground')
    })

    it('should apply ghost variant classes', () => {
      render(<Button variant="ghost">ゴースト</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('hover:bg-primary', 'hover:text-accent-foreground')
    })

    it('should apply link variant classes', () => {
      render(<Button variant="link">リンク</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('text-primary', 'underline-offset-4')
    })
  })

  describe('Sizes', () => {
    it('should apply default size classes', () => {
      render(<Button>デフォルトサイズ</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-10', 'px-4', 'py-2')
    })

    it('should apply small size classes', () => {
      render(<Button size="sm">小サイズ</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-9', 'px-3')
    })

    it('should apply large size classes', () => {
      render(<Button size="lg">大サイズ</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-11', 'px-8')
    })

    it('should apply icon size classes', () => {
      render(<Button size="icon">🔧</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('h-8', 'w-8')
    })
  })

  describe('Custom className', () => {
    it('should merge custom className with variant classes', () => {
      render(<Button className="custom-class">カスタム</Button>)

      const button = screen.getByRole('button')
      expect(button).toHaveClass('custom-class')
      expect(button).toHaveClass('bg-primary') // バリアントクラスも維持
    })
  })

  describe('AsChild functionality', () => {
    it('should render as child component when asChild is true', () => {
      render(
        <Button asChild>
          <a href="/test">リンクボタン</a>
        </Button>
      )

      const link = screen.getByRole('link')
      expect(link).toBeInTheDocument()
      expect(link).toHaveAttribute('href', '/test')
      expect(link).toHaveClass('bg-primary') // ボタンクラスが適用される
    })
  })

  describe('Accessibility', () => {
    it('should have proper button role', () => {
      render(<Button>アクセシブル</Button>)

      expect(screen.getByRole('button')).toBeInTheDocument()
    })

    it('should be focusable', () => {
      render(<Button>フォーカス可能</Button>)

      const button = screen.getByRole('button')
      button.focus()
      expect(button).toHaveFocus()
    })

    it('should not be focusable when disabled', () => {
      render(<Button disabled>無効</Button>)

      const button = screen.getByRole('button')
      expect(button).toBeDisabled()
      button.focus()
      expect(button).not.toHaveFocus()
    })
  })

  describe('Event propagation', () => {
    it('should not call onClick when disabled', () => {
      const handleClick = vi.fn()
      render(<Button disabled onClick={handleClick}>無効クリック</Button>)

      fireEvent.click(screen.getByRole('button'))
      expect(handleClick).not.toHaveBeenCalled()
    })
  })
})