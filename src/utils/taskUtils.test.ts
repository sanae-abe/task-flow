/**
 * Task utility functions tests
 * 基本的なユーティリティ関数のテスト
 */

import { describe, it, expect } from 'vitest'

// Simple utility functions for testing
const formatTaskTitle = (title: string): string => {
  return title.trim().length > 0 ? title.trim() : '無題のタスク'
}

const isValidTaskId = (id: string): boolean => {
  return id.length > 0 && /^[a-zA-Z0-9_-]+$/.test(id)
}

const getPriorityLevel = (priority: string): number => {
  const levels = { 'critical': 4, 'high': 3, 'medium': 2, 'low': 1 }
  return levels[priority as keyof typeof levels] || 1
}

describe('TaskUtils', () => {
  describe('formatTaskTitle', () => {
    it('should return trimmed title for valid input', () => {
      expect(formatTaskTitle('  Test Task  ')).toBe('Test Task')
      expect(formatTaskTitle('Normal Task')).toBe('Normal Task')
    })

    it('should return default title for empty input', () => {
      expect(formatTaskTitle('')).toBe('無題のタスク')
      expect(formatTaskTitle('   ')).toBe('無題のタスク')
    })
  })

  describe('isValidTaskId', () => {
    it('should return true for valid IDs', () => {
      expect(isValidTaskId('task_123')).toBe(true)
      expect(isValidTaskId('task-456')).toBe(true)
      expect(isValidTaskId('TASK789')).toBe(true)
    })

    it('should return false for invalid IDs', () => {
      expect(isValidTaskId('')).toBe(false)
      expect(isValidTaskId('task 123')).toBe(false)
      expect(isValidTaskId('task@123')).toBe(false)
    })
  })

  describe('getPriorityLevel', () => {
    it('should return correct priority levels', () => {
      expect(getPriorityLevel('critical')).toBe(4)
      expect(getPriorityLevel('high')).toBe(3)
      expect(getPriorityLevel('medium')).toBe(2)
      expect(getPriorityLevel('low')).toBe(1)
    })

    it('should return default level for unknown priority', () => {
      expect(getPriorityLevel('unknown')).toBe(1)
      expect(getPriorityLevel('')).toBe(1)
    })
  })
})