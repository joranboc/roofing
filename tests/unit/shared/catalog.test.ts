import { describe, expect, it } from 'vitest'
import {
  COLORS,
  MATERIALS,
  TRIMS,
  getPattern,
  getMaterial,
  isColorId,
  isMaterialId,
  isTrimId,
} from '#shared/catalog'

describe('catalog', () => {
  describe('materials', () => {
    it('should have exactly 4 materials', () => {
      expect(MATERIALS).toHaveLength(4)
    })

    it('should have 3 patterns each', () => {
      MATERIALS.forEach((material) => {
        expect(material.patterns).toHaveLength(3)
      })
    })

    it('should have defaultPatternId in each material\'s patterns', () => {
      MATERIALS.forEach((material) => {
        const patternExists = material.patterns.some(
          p => p.id === material.defaultPatternId,
        )
        expect(patternExists).toBe(true)
      })
    })

    it('should have correct default pattern ids', () => {
      expect(getMaterial('shingle').defaultPatternId).toBe('dim')
      expect(getMaterial('metal').defaultPatternId).toBe('wide')
      expect(getMaterial('tile').defaultPatternId).toBe('s')
      expect(getMaterial('slate').defaultPatternId).toBe('uniform')
    })

    it('should have unique material ids', () => {
      const ids = MATERIALS.map(m => m.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('should have unique pattern ids within each material', () => {
      MATERIALS.forEach((material) => {
        const patternIds = material.patterns.map(p => p.id)
        expect(new Set(patternIds).size).toBe(patternIds.length)
      })
    })
  })

  describe('colors', () => {
    it('should have exactly 8 colors', () => {
      expect(COLORS).toHaveLength(8)
    })

    it('should have unique color ids', () => {
      const ids = COLORS.map(c => c.id)
      expect(new Set(ids).size).toBe(ids.length)
    })
  })

  describe('trims', () => {
    it('should have unique trim ids', () => {
      const ids = TRIMS.map(t => t.id)
      expect(new Set(ids).size).toBe(ids.length)
    })

    it('match trim should have null hex', () => {
      const match = TRIMS.find(t => t.id === 'match')
      expect(match?.hex).toBeNull()
    })

    it('non-match trims should have 7-digit hex strings', () => {
      TRIMS.forEach((trim) => {
        if (trim.id !== 'match') {
          expect(trim.hex).toMatch(/^#[0-9A-F]{6}$/)
        }
      })
    })
  })

  describe('getPattern', () => {
    it('should return the pattern when it exists', () => {
      const pattern = getPattern('metal', 'batten')
      expect(pattern).toBeDefined()
      expect(pattern?.id).toBe('batten')
      expect(pattern?.name).toBe('Board & batten')
    })

    it('should return undefined when pattern doesn\'t exist', () => {
      const pattern = getPattern('metal', 'dim')
      expect(pattern).toBeUndefined()
    })
  })

  describe('getMaterial', () => {
    it('should return the material for a given id', () => {
      expect(getMaterial('shingle').name).toBe('Architectural shingle')
    })

    it('should resolve every material id to its own material', () => {
      MATERIALS.forEach((material) => {
        expect(getMaterial(material.id)).toBe(material)
      })
    })
  })

  describe('type guards', () => {
    describe('isMaterialId', () => {
      it('should accept valid material ids', () => {
        expect(isMaterialId('shingle')).toBe(true)
        expect(isMaterialId('metal')).toBe(true)
        expect(isMaterialId('tile')).toBe(true)
        expect(isMaterialId('slate')).toBe(true)
      })

      it('should reject invalid strings', () => {
        expect(isMaterialId('invalid')).toBe(false)
        expect(isMaterialId('shingles')).toBe(false)
      })

      it('should reject non-string values', () => {
        expect(isMaterialId(123)).toBe(false)
        expect(isMaterialId(null)).toBe(false)
        expect(isMaterialId(undefined)).toBe(false)
        expect(isMaterialId({})).toBe(false)
      })
    })

    describe('isTrimId', () => {
      it('should accept valid trim ids', () => {
        expect(isTrimId('white')).toBe(true)
        expect(isTrimId('black')).toBe(true)
        expect(isTrimId('bronze')).toBe(true)
        expect(isTrimId('match')).toBe(true)
      })

      it('should reject invalid strings', () => {
        expect(isTrimId('invalid')).toBe(false)
        expect(isTrimId('gray')).toBe(false)
      })

      it('should reject non-string values', () => {
        expect(isTrimId(123)).toBe(false)
        expect(isTrimId(null)).toBe(false)
        expect(isTrimId(undefined)).toBe(false)
        expect(isTrimId({})).toBe(false)
      })
    })

    describe('isColorId', () => {
      it('should accept valid color ids', () => {
        expect(isColorId('charcoal')).toBe(true)
        expect(isColorId('wood')).toBe(true)
        expect(isColorId('slate')).toBe(true)
        expect(isColorId('bark')).toBe(true)
        expect(isColorId('pewter')).toBe(true)
        expect(isColorId('tan')).toBe(true)
        expect(isColorId('terra')).toBe(true)
        expect(isColorId('forest')).toBe(true)
      })

      it('should reject invalid strings', () => {
        expect(isColorId('invalid')).toBe(false)
        expect(isColorId('blue')).toBe(false)
      })

      it('should reject non-string values', () => {
        expect(isColorId(123)).toBe(false)
        expect(isColorId(null)).toBe(false)
        expect(isColorId(undefined)).toBe(false)
        expect(isColorId({})).toBe(false)
      })
    })
  })
})
