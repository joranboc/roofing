import { describe, expect, it } from 'vitest'
import type { H3Error } from 'h3'
import { validateMeasureInput, validatePriceInput } from '../../../server/utils/validate'

describe('validate', () => {
  describe('validateMeasureInput', () => {
    it('should return address unchanged with surrounding spaces preserved', () => {
      const body = { address: '  123 Main St  ' }
      const result = validateMeasureInput(body)
      expect(result.address).toBe('  123 Main St  ')
    })

    it('should return address for valid input', () => {
      const body = { address: '456 Oak Ave, Denver' }
      const result = validateMeasureInput(body)
      expect(result).toEqual({ address: '456 Oak Ave, Denver' })
    })

    it('should throw 400 with field "address" for empty string', () => {
      const body = { address: '' }
      expect(() => validateMeasureInput(body)).toThrow()
      try {
        validateMeasureInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('address')
      }
    })

    it('should throw 400 with field "address" for whitespace-only string', () => {
      const body = { address: '   ' }
      expect(() => validateMeasureInput(body)).toThrow()
      try {
        validateMeasureInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('address')
      }
    })

    it('should throw 400 with field "address" for missing address', () => {
      const body = {}
      expect(() => validateMeasureInput(body)).toThrow()
      try {
        validateMeasureInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('address')
      }
    })

    it('should throw 400 with field "address" for non-string address', () => {
      const body = { address: 123 }
      expect(() => validateMeasureInput(body)).toThrow()
      try {
        validateMeasureInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('address')
      }
    })

    it('should throw 400 with field "body" for non-object body (null)', () => {
      expect(() => validateMeasureInput(null)).toThrow()
      try {
        validateMeasureInput(null)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('body')
      }
    })

    it('should throw 400 with field "body" for non-object body (string)', () => {
      expect(() => validateMeasureInput('not an object')).toThrow()
      try {
        validateMeasureInput('not an object')
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('body')
      }
    })

    it('should throw 400 with field "body" for non-object body (array)', () => {
      expect(() => validateMeasureInput(['address'])).toThrow()
      try {
        validateMeasureInput(['address'])
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('body')
      }
    })

    it('should throw 400 with field "body" for undefined body', () => {
      expect(() => validateMeasureInput(undefined)).toThrow()
      try {
        validateMeasureInput(undefined)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('body')
      }
    })
  })

  describe('validatePriceInput', () => {
    const validInput = {
      material: 'shingle',
      pattern: 'dim',
      trim: 'white',
      roofAreaSqFt: 2000,
    }

    it('should return typed input for valid price body', () => {
      const result = validatePriceInput(validInput)
      expect(result).toEqual(validInput)
      expect(result.material).toBe('shingle')
      expect(result.pattern).toBe('dim')
      expect(result.trim).toBe('white')
      expect(result.roofAreaSqFt).toBe(2000)
    })

    it('should throw 400 with field "material" for unknown material', () => {
      const body = { ...validInput, material: 'unknown' }
      expect(() => validatePriceInput(body)).toThrow()
      try {
        validatePriceInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('material')
      }
    })

    it('should throw 400 with field "pattern" for pattern from another material', () => {
      const body = { ...validInput, material: 'shingle', pattern: 'wide' } // wide is metal
      expect(() => validatePriceInput(body)).toThrow()
      try {
        validatePriceInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('pattern')
      }
    })

    it('should throw 400 with field "pattern" for non-string pattern', () => {
      const body = { ...validInput, pattern: 123 }
      expect(() => validatePriceInput(body)).toThrow()
      try {
        validatePriceInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('pattern')
      }
    })

    it('should throw 400 with field "trim" for unknown trim', () => {
      const body = { ...validInput, trim: 'unknown' }
      expect(() => validatePriceInput(body)).toThrow()
      try {
        validatePriceInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('trim')
      }
    })

    it('should throw 400 with field "roofAreaSqFt" for area 0', () => {
      const body = { ...validInput, roofAreaSqFt: 0 }
      expect(() => validatePriceInput(body)).toThrow()
      try {
        validatePriceInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('roofAreaSqFt')
      }
    })

    it('should throw 400 with field "roofAreaSqFt" for negative area', () => {
      const body = { ...validInput, roofAreaSqFt: -100 }
      expect(() => validatePriceInput(body)).toThrow()
      try {
        validatePriceInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('roofAreaSqFt')
      }
    })

    it('should throw 400 with field "roofAreaSqFt" for NaN', () => {
      const body = { ...validInput, roofAreaSqFt: NaN }
      expect(() => validatePriceInput(body)).toThrow()
      try {
        validatePriceInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('roofAreaSqFt')
      }
    })

    it('should throw 400 with field "roofAreaSqFt" for Infinity', () => {
      const body = { ...validInput, roofAreaSqFt: Infinity }
      expect(() => validatePriceInput(body)).toThrow()
      try {
        validatePriceInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('roofAreaSqFt')
      }
    })

    it('should throw 400 with field "roofAreaSqFt" for string area', () => {
      const body = { ...validInput, roofAreaSqFt: '2000' }
      expect(() => validatePriceInput(body)).toThrow()
      try {
        validatePriceInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('roofAreaSqFt')
      }
    })

    it('should throw 400 with field "roofAreaSqFt" for area 100001', () => {
      const body = { ...validInput, roofAreaSqFt: 100001 }
      expect(() => validatePriceInput(body)).toThrow()
      try {
        validatePriceInput(body)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('roofAreaSqFt')
      }
    })

    it('should accept area exactly 100000', () => {
      const body = { ...validInput, roofAreaSqFt: 100000 }
      const result = validatePriceInput(body)
      expect(result.roofAreaSqFt).toBe(100000)
    })

    it('should throw 400 with field "body" for non-object body (null)', () => {
      expect(() => validatePriceInput(null)).toThrow()
      try {
        validatePriceInput(null)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('body')
      }
    })

    it('should throw 400 with field "body" for non-object body (array)', () => {
      expect(() => validatePriceInput([1, 2, 3])).toThrow()
      try {
        validatePriceInput([1, 2, 3])
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('body')
      }
    })

    it('should throw 400 with field "body" for undefined body', () => {
      expect(() => validatePriceInput(undefined)).toThrow()
      try {
        validatePriceInput(undefined)
      }
      catch (error) {
        const err = error as H3Error<unknown>
        expect(err.statusCode).toBe(400)
        expect((err.data as Record<string, string> | undefined)?.field).toBe('body')
      }
    })
  })
})
