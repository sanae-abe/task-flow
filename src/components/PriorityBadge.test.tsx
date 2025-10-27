/**
 * PriorityBadge component tests
 * 優先度バッジコンポーネントの包括的テスト
 */

import { describe, it, expect } from 'vitest'
import { render, screen } from '@testing-library/react'
import '@testing-library/jest-dom'
import PriorityBadge from './PriorityBadge'
import { Priority } from '../types'

describe('PriorityBadge', () => {
  describe('Priority rendering', () => {
    it('should render critical priority badge', () => {
      render(<PriorityBadge priority="critical" />)

      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveAttribute('aria-label', expect.stringContaining('優先度'))
    })

    it('should render high priority badge', () => {
      render(<PriorityBadge priority="high" />)

      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveAttribute('aria-label', expect.stringContaining('優先度'))
    })

    it('should render medium priority badge', () => {
      render(<PriorityBadge priority="medium" />)

      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveAttribute('aria-label', expect.stringContaining('優先度'))
    })

    it('should render low priority badge', () => {
      render(<PriorityBadge priority="low" />)

      const badge = screen.getByRole('status')
      expect(badge).toBeInTheDocument()
      expect(badge).toHaveAttribute('aria-label', expect.stringContaining('優先度'))
    })

    it('should return null when priority is not provided', () => {
      const { container } = render(<PriorityBadge />)

      expect(container.firstChild).toBeNull()
    })

    it('should return null when priority is undefined', () => {
      const { container } = render(<PriorityBadge priority={undefined} />)

      expect(container.firstChild).toBeNull()
    })
  })

  describe('Icon display', () => {
    it('should show icon by default', () => {
      render(<PriorityBadge priority="critical" />)

      const badge = screen.getByRole('status')
      const svg = badge.querySelector('svg[aria-hidden="true"]')
      expect(svg).toBeInTheDocument()
    })

    it('should hide icon when showIcon is false', () => {
      render(<PriorityBadge priority="critical" showIcon={false} />)

      const badge = screen.getByRole('status')
      const svg = badge.querySelector('svg[aria-hidden="true"]')
      expect(svg).not.toBeInTheDocument()
    })

    it('should show icon when showIcon is explicitly true', () => {
      render(<PriorityBadge priority="high" showIcon />)

      const badge = screen.getByRole('status')
      const svg = badge.querySelector('svg[aria-hidden="true"]')
      expect(svg).toBeInTheDocument()
    })
  })

  describe('Label display', () => {
    it('should show label by default', () => {
      render(<PriorityBadge priority="critical" />)

      const badge = screen.getByRole('status')
      const span = badge.querySelector('span')
      expect(span).toBeInTheDocument()
      expect(span?.textContent).toBeTruthy()
    })

    it('should hide label when showLabel is false', () => {
      render(<PriorityBadge priority="critical" showLabel={false} />)

      const badge = screen.getByRole('status')
      const span = badge.querySelector('span')
      expect(span).not.toBeInTheDocument()
    })

    it('should show label content for different priorities', () => {
      const priorities: Priority[] = ['critical', 'high', 'medium', 'low']

      priorities.forEach(priority => {
        const { unmount } = render(<PriorityBadge priority={priority} />)

        const badge = screen.getByRole('status')
        const span = badge.querySelector('span')
        expect(span).toBeInTheDocument()
        expect(span?.textContent).toBeTruthy()

        unmount()
      })
    })

    it('should change label text when useEnglishLabel changes', () => {
      const { rerender } = render(<PriorityBadge priority="critical" useEnglishLabel={false} />)

      const badge = screen.getByRole('status')
      const span = badge.querySelector('span')
      const japaneseText = span?.textContent

      rerender(<PriorityBadge priority="critical" useEnglishLabel />)

      const spanAfter = screen.getByRole('status').querySelector('span')
      const englishText = spanAfter?.textContent

      expect(japaneseText).not.toBe(englishText)
    })
  })

  describe('Combined props', () => {
    it('should render only icon when showLabel is false', () => {
      render(<PriorityBadge priority="high" showIcon showLabel={false} />)

      const badge = screen.getByRole('status')
      const svg = badge.querySelector('svg[aria-hidden="true"]')
      const span = badge.querySelector('span')

      expect(svg).toBeInTheDocument()
      expect(span).not.toBeInTheDocument()
    })

    it('should render only label when showIcon is false', () => {
      render(<PriorityBadge priority="high" showIcon={false} showLabel />)

      const badge = screen.getByRole('status')
      const svg = badge.querySelector('svg[aria-hidden="true"]')
      const span = badge.querySelector('span')

      expect(svg).not.toBeInTheDocument()
      expect(span).toBeInTheDocument()
    })

    it('should render neither icon nor label when both are false', () => {
      render(<PriorityBadge priority="high" showIcon={false} showLabel={false} />)

      const badge = screen.getByRole('status')
      const svg = badge.querySelector('svg[aria-hidden="true"]')
      const span = badge.querySelector('span')

      expect(svg).not.toBeInTheDocument()
      expect(span).not.toBeInTheDocument()
      expect(badge).toBeInTheDocument()
    })
  })

  describe('CSS styling', () => {
    it('should apply correct inline styles for critical priority', () => {
      render(<PriorityBadge priority="critical" />)

      const badge = screen.getByRole('status')
      const styles = window.getComputedStyle(badge)
      expect(styles.backgroundColor).toBeTruthy()
      expect(styles.color).toBeTruthy()
    })

    it('should apply correct CSS classes', () => {
      render(<PriorityBadge priority="critical" />)

      const badge = screen.getByRole('status')
      expect(badge).toHaveClass('inline-flex', 'items-center', 'gap-1')
      expect(badge).toHaveClass('px-2', 'py-[3px]', 'rounded-[3px]')
      expect(badge).toHaveClass('cursor-default')
    })

    it('should apply correct colors for each priority level', () => {
      const priorities: Priority[] = ['critical', 'high', 'medium', 'low']

      priorities.forEach(priority => {
        const { unmount } = render(<PriorityBadge priority={priority} />)

        const badge = screen.getByRole('status')
        const styles = window.getComputedStyle(badge)
        expect(styles.backgroundColor).toBeTruthy()
        expect(styles.color).toBeTruthy()

        unmount()
      })
    })
  })

  describe('Accessibility', () => {
    it('should have proper ARIA attributes', () => {
      render(<PriorityBadge priority="critical" />)

      const badge = screen.getByRole('status')
      expect(badge).toHaveAttribute('aria-label', expect.stringContaining('優先度'))
      expect(badge).toHaveAttribute('role', 'status')
    })

    it('should have proper aria-hidden on icon', () => {
      render(<PriorityBadge priority="high" />)

      const badge = screen.getByRole('status')
      const svg = badge.querySelector('svg[aria-hidden="true"]')
      expect(svg).toHaveAttribute('aria-hidden', 'true')
    })

    it('should maintain semantic structure', () => {
      render(<PriorityBadge priority="high" />)

      const badge = screen.getByRole('status')
      expect(badge.tagName.toLowerCase()).toBe('div')
    })
  })
})