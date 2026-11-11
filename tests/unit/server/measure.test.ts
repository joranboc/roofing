import { describe, expect, it } from 'vitest'
import { normalizeAddress, measureRoof } from '../../../server/utils/measure'

describe('measure', () => {
  describe('normalizeAddress', () => {
    it('should trim whitespace', () => {
      expect(normalizeAddress('  12 Main St  ')).toBe('12 main st')
    })

    it('should convert to lowercase', () => {
      expect(normalizeAddress('UPPERCASE ADDRESS')).toBe('uppercase address')
    })

    it('should handle both trimming and lowercase', () => {
      expect(normalizeAddress('  MIXED Case  ')).toBe('mixed case')
    })

    it('should handle empty string', () => {
      expect(normalizeAddress('')).toBe('')
    })

    it('should handle string with only whitespace', () => {
      expect(normalizeAddress('   ')).toBe('')
    })
  })

  describe('measureRoof', () => {
    it('should return an object with roofAreaSqFt property', () => {
      const result = measureRoof('123 Main St')
      expect(result).toHaveProperty('roofAreaSqFt')
      expect(typeof result.roofAreaSqFt).toBe('number')
    })

    it('should return area between 1400 and 3400 inclusive', () => {
      const testAddresses = Array.from({ length: 50 }, (_, i) => `${i} Market St, San Francisco`)
      testAddresses.forEach((address) => {
        const result = measureRoof(address)
        expect(result.roofAreaSqFt).toBeGreaterThanOrEqual(1400)
        expect(result.roofAreaSqFt).toBeLessThanOrEqual(3400)
      })
    })

    it('should return a multiple of 100', () => {
      const testAddresses = Array.from({ length: 50 }, (_, i) => `${i} Market St, San Francisco`)
      testAddresses.forEach((address) => {
        const result = measureRoof(address)
        expect(result.roofAreaSqFt % 100).toBe(0)
      })
    })

    it('should return the same area for the same address with different case', () => {
      const address1 = '123 Main St'
      const address2 = '123 MAIN ST'
      const result1 = measureRoof(address1)
      const result2 = measureRoof(address2)
      expect(result1.roofAreaSqFt).toBe(result2.roofAreaSqFt)
    })

    it('should return the same area for the same address with different whitespace', () => {
      const address1 = '123 Main St'
      const address2 = '  123 Main St  '
      const result1 = measureRoof(address1)
      const result2 = measureRoof(address2)
      expect(result1.roofAreaSqFt).toBe(result2.roofAreaSqFt)
    })

    it('should return the same area when called twice with the same address', () => {
      const address = '456 Oak Ave, Denver'
      const result1 = measureRoof(address)
      const result2 = measureRoof(address)
      expect(result1.roofAreaSqFt).toBe(result2.roofAreaSqFt)
    })

    it('should return at least 5 distinct areas across 50 different addresses', () => {
      const testAddresses = Array.from({ length: 50 }, (_, i) => `${i} Market St, San Francisco`)
      const areas = new Set<number>()
      testAddresses.forEach((address) => {
        const result = measureRoof(address)
        areas.add(result.roofAreaSqFt)
      })
      expect(areas.size).toBeGreaterThanOrEqual(5)
    })

    it('should return a valid value for empty string', () => {
      const result = measureRoof('')
      expect(Number.isInteger(result.roofAreaSqFt)).toBe(true)
      expect(result.roofAreaSqFt).toBeGreaterThanOrEqual(1400)
      expect(result.roofAreaSqFt).toBeLessThanOrEqual(3400)
      expect(result.roofAreaSqFt % 100).toBe(0)
    })
  })
})
