import { describe, expect, it } from 'vitest'
import { fnv1a32 } from '../../../server/utils/hash'

describe('hash', () => {
  describe('fnv1a32', () => {
    it('should return 0x811c9dc5 for empty string', () => {
      expect(fnv1a32('')).toBe(0x811c9dc5)
    })

    it('should return 0xe40c292c for "a"', () => {
      expect(fnv1a32('a')).toBe(0xe40c292c)
    })

    it('should return 0xbf9cf968 for "foobar"', () => {
      expect(fnv1a32('foobar')).toBe(0xbf9cf968)
    })

    it('should always return a non-negative integer', () => {
      const testCases = ['test', 'hello', '12345', 'UPPERCASE']
      testCases.forEach((input) => {
        const result = fnv1a32(input)
        expect(Number.isInteger(result)).toBe(true)
        expect(result).toBeGreaterThanOrEqual(0)
      })
    })

    it('should always return a value <= 0xffffffff', () => {
      const testCases = ['test', 'hello', '12345', 'UPPERCASE', '', 'a', 'foobar']
      testCases.forEach((input) => {
        const result = fnv1a32(input)
        expect(result).toBeLessThanOrEqual(0xffffffff)
      })
    })

    it('should handle non-ASCII input', () => {
      const result1 = fnv1a32('é')
      expect(Number.isInteger(result1)).toBe(true)
      expect(result1).toBeGreaterThanOrEqual(0)
      expect(result1).toBeLessThanOrEqual(0xffffffff)
    })

    it('should handle emoji input', () => {
      const result1 = fnv1a32('🏠')
      expect(Number.isInteger(result1)).toBe(true)
      expect(result1).toBeGreaterThanOrEqual(0)
      expect(result1).toBeLessThanOrEqual(0xffffffff)
    })

    it('should return the same hash for the same input', () => {
      const input = 'test input'
      const hash1 = fnv1a32(input)
      const hash2 = fnv1a32(input)
      expect(hash1).toBe(hash2)
    })

    it('should return the same hash for non-ASCII input when called twice', () => {
      const input = 'é'
      const hash1 = fnv1a32(input)
      const hash2 = fnv1a32(input)
      expect(hash1).toBe(hash2)
    })

    it('should return the same hash for emoji input when called twice', () => {
      const input = '🏠'
      const hash1 = fnv1a32(input)
      const hash2 = fnv1a32(input)
      expect(hash1).toBe(hash2)
    })
  })
})
