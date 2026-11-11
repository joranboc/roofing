import { describe, expect, it } from 'vitest'
import { roundTo10, computePrice, type PriceInput } from '../../../server/utils/pricing'
import { MATERIALS, TRIMS, type MaterialId } from '../../../shared/catalog'

describe('pricing', () => {
  describe('roundTo10', () => {
    it('should round 12344 down to 12340', () => {
      expect(roundTo10(12344)).toBe(12340)
    })

    it('should round 12345 up to 12350', () => {
      expect(roundTo10(12345)).toBe(12350)
    })

    it('should keep 12350 as is', () => {
      expect(roundTo10(12350)).toBe(12350)
    })
  })

  describe('computePrice', () => {
    const roofAreaSqFt = 2000

    it('should compute price for shingle with dim pattern and white trim', () => {
      const input: PriceInput = {
        roofAreaSqFt,
        material: 'shingle',
        pattern: 'dim',
        trim: 'white',
      }
      const result = computePrice(input)
      expect(result.total).toBe(12000)
      expect(result.currency).toBe('USD')
    })

    it('should compute price for metal with wide pattern and white trim', () => {
      const input: PriceInput = {
        roofAreaSqFt,
        material: 'metal',
        pattern: 'wide',
        trim: 'white',
      }
      const result = computePrice(input)
      expect(result.total).toBe(22000)
    })

    it('should compute price for tile with s pattern and bronze trim', () => {
      const input: PriceInput = {
        roofAreaSqFt,
        material: 'tile',
        pattern: 's',
        trim: 'bronze',
      }
      const result = computePrice(input)
      expect(result.total).toBe(32900)
    })

    it('should compute price for slate with fish pattern and black trim', () => {
      const input: PriceInput = {
        roofAreaSqFt,
        material: 'slate',
        pattern: 'fish',
        trim: 'black',
      }
      const result = computePrice(input)
      expect(result.total).toBe(42000)
    })

    // Test all patterns with 2000 sq ft and white trim
    const patternExpectations: Record<string, Record<string, number>> = {
      shingle: {
        '3tab': 10000,
        'dim': 12000,
        'shake': 15000,
      },
      metal: {
        wide: 22000,
        narrow: 24000,
        batten: 26000,
      },
      tile: {
        s: 32000,
        barrel: 35000,
        flat: 30000,
      },
      slate: {
        uniform: 36000,
        random: 39000,
        fish: 42000,
      },
    }

    Object.entries(patternExpectations).forEach(([material, patterns]) => {
      Object.entries(patterns).forEach(([pattern, expectedTotal]) => {
        it(`should compute ${material} ${pattern} as ${expectedTotal}`, () => {
          const input: PriceInput = {
            roofAreaSqFt,
            material: material as MaterialId,
            pattern,
            trim: 'white',
          }
          const result = computePrice(input)
          expect(result.total).toBe(expectedTotal)
        })
      })
    })

    it('should add 900 for bronze trim vs white', () => {
      const input1: PriceInput = {
        roofAreaSqFt,
        material: 'shingle',
        pattern: 'dim',
        trim: 'white',
      }
      const input2: PriceInput = {
        roofAreaSqFt,
        material: 'shingle',
        pattern: 'dim',
        trim: 'bronze',
      }
      const result1 = computePrice(input1)
      const result2 = computePrice(input2)
      expect(result2.total - result1.total).toBe(900)
    })

    it('should add 0 for black trim vs white', () => {
      const input1: PriceInput = {
        roofAreaSqFt,
        material: 'shingle',
        pattern: 'dim',
        trim: 'white',
      }
      const input2: PriceInput = {
        roofAreaSqFt,
        material: 'shingle',
        pattern: 'dim',
        trim: 'black',
      }
      const result1 = computePrice(input1)
      const result2 = computePrice(input2)
      expect(result2.total - result1.total).toBe(0)
    })

    it('should add 0 for match trim vs white', () => {
      const input1: PriceInput = {
        roofAreaSqFt,
        material: 'shingle',
        pattern: 'dim',
        trim: 'white',
      }
      const input2: PriceInput = {
        roofAreaSqFt,
        material: 'shingle',
        pattern: 'dim',
        trim: 'match',
      }
      const result1 = computePrice(input1)
      const result2 = computePrice(input2)
      expect(result2.total - result1.total).toBe(0)
    })

    it('should be deterministic: same input twice returns deep equal result', () => {
      const input: PriceInput = {
        roofAreaSqFt,
        material: 'tile',
        pattern: 'barrel',
        trim: 'bronze',
      }
      const result1 = computePrice(input)
      const result2 = computePrice(input)
      expect(result1).toEqual(result2)
    })

    it('should throw Error when pattern does not belong to material', () => {
      const input: PriceInput = {
        roofAreaSqFt,
        material: 'shingle',
        pattern: 'wide', // metal pattern, not shingle
        trim: 'white',
      }
      expect(() => computePrice(input)).toThrow(Error)
    })

    it('should price every catalog pattern and trim (tables stay in sync with the catalog)', () => {
      for (const material of MATERIALS) {
        for (const pattern of material.patterns) {
          for (const trim of TRIMS) {
            const result = computePrice({
              roofAreaSqFt,
              material: material.id,
              pattern: pattern.id,
              trim: trim.id,
            })
            expect(result.total).toBeGreaterThan(0)
          }
        }
      }
    })
  })
})
