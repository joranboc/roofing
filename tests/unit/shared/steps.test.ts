import { describe, expect, it } from 'vitest'
import {
  STEPPER_STEPS,
  STEPS,
  getStep,
  nextStep,
  prevStep,
  stepFromPath,
  stepNumber,
  type StepId,
} from '#shared/steps'

describe('steps', () => {
  describe('STEPS', () => {
    it('should have 7 steps in the correct order', () => {
      expect(STEPS).toHaveLength(7)
      const ids: StepId[] = ['address', 'style', 'color', 'design', 'solar', 'review', 'done']
      expect(STEPS.map(s => s.id)).toEqual(ids)
    })

    describe('step values', () => {
      it('address should have correct values', () => {
        const step = STEPS.find(s => s.id === 'address')
        expect(step).toEqual({
          id: 'address',
          label: 'Address',
          path: '/',
          cta: 'See my real price',
        })
      })

      it('style should have correct values', () => {
        const step = STEPS.find(s => s.id === 'style')
        expect(step).toEqual({
          id: 'style',
          label: 'Style',
          path: '/configure/style',
          cta: 'Continue to color',
        })
      })

      it('color should have correct values', () => {
        const step = STEPS.find(s => s.id === 'color')
        expect(step).toEqual({
          id: 'color',
          label: 'Color',
          path: '/configure/color',
          cta: 'Continue to design',
        })
      })

      it('design should have correct values', () => {
        const step = STEPS.find(s => s.id === 'design')
        expect(step).toEqual({
          id: 'design',
          label: 'Design',
          path: '/configure/design',
          cta: 'Continue to solar',
        })
      })

      it('solar should have correct values', () => {
        const step = STEPS.find(s => s.id === 'solar')
        expect(step).toEqual({
          id: 'solar',
          label: 'Solar',
          path: '/configure/solar',
          cta: 'Review my roof',
        })
      })

      it('review should have correct values', () => {
        const step = STEPS.find(s => s.id === 'review')
        expect(step).toEqual({
          id: 'review',
          label: 'Review',
          path: '/configure/review',
          cta: 'See my real price',
        })
      })

      it('done should have correct values', () => {
        const step = STEPS.find(s => s.id === 'done')
        expect(step).toEqual({
          id: 'done',
          label: 'Done',
          path: '/configure/done',
          cta: 'Reserve my install date',
        })
      })
    })
  })

  describe('STEPPER_STEPS', () => {
    it('should have exactly 5 steps', () => {
      expect(STEPPER_STEPS).toHaveLength(5)
    })

    it('should contain style, color, design, solar, review in that order', () => {
      const ids = STEPPER_STEPS.map(s => s.id)
      expect(ids).toEqual(['style', 'color', 'design', 'solar', 'review'])
    })

    it('should not contain address or done', () => {
      const ids = STEPPER_STEPS.map(s => s.id)
      expect(ids).not.toContain('address')
      expect(ids).not.toContain('done')
    })
  })

  describe('getStep', () => {
    it('should return the step for a given id', () => {
      expect(getStep('address').label).toBe('Address')
      expect(getStep('style').label).toBe('Style')
      expect(getStep('done').label).toBe('Done')
    })

    it('should resolve every step id to its own step', () => {
      STEPS.forEach((step) => {
        expect(getStep(step.id)).toBe(step)
      })
    })
  })

  describe('nextStep', () => {
    it('should return the next step in the middle', () => {
      expect(nextStep('address')).toBe('style')
      expect(nextStep('style')).toBe('color')
      expect(nextStep('color')).toBe('design')
      expect(nextStep('design')).toBe('solar')
      expect(nextStep('solar')).toBe('review')
      expect(nextStep('review')).toBe('done')
    })

    it('should return undefined for the last step', () => {
      expect(nextStep('done')).toBeUndefined()
    })
  })

  describe('prevStep', () => {
    it('should return the previous step in the middle', () => {
      expect(prevStep('style')).toBe('address')
      expect(prevStep('color')).toBe('style')
      expect(prevStep('design')).toBe('color')
      expect(prevStep('solar')).toBe('design')
      expect(prevStep('review')).toBe('solar')
      expect(prevStep('done')).toBe('review')
    })

    it('should return undefined for the first step', () => {
      expect(prevStep('address')).toBeUndefined()
    })
  })

  describe('stepFromPath', () => {
    it('should match exact paths', () => {
      expect(stepFromPath('/')).toBe('address')
      expect(stepFromPath('/configure/style')).toBe('style')
      expect(stepFromPath('/configure/color')).toBe('color')
      expect(stepFromPath('/configure/design')).toBe('design')
      expect(stepFromPath('/configure/solar')).toBe('solar')
      expect(stepFromPath('/configure/review')).toBe('review')
      expect(stepFromPath('/configure/done')).toBe('done')
    })

    it('should handle trailing slashes', () => {
      expect(stepFromPath('/configure/style/')).toBe('style')
      expect(stepFromPath('/configure/color/')).toBe('color')
      expect(stepFromPath('/configure/design/')).toBe('design')
      expect(stepFromPath('/configure/solar/')).toBe('solar')
      expect(stepFromPath('/configure/review/')).toBe('review')
      expect(stepFromPath('/configure/done/')).toBe('done')
    })

    it('should handle query strings', () => {
      expect(stepFromPath('/configure/style?x=1')).toBe('style')
      expect(stepFromPath('/configure/color?foo=bar&baz=qux')).toBe('color')
      expect(stepFromPath('/?param=value')).toBe('address')
    })

    it('should handle hash fragments', () => {
      expect(stepFromPath('/configure/style#section')).toBe('style')
      expect(stepFromPath('/configure/color#top')).toBe('color')
    })

    it('should handle query strings and hashes together', () => {
      expect(stepFromPath('/configure/design?x=1#section')).toBe('design')
      expect(stepFromPath('/configure/solar?foo=bar#hash')).toBe('solar')
    })

    it('should return undefined for unknown paths', () => {
      expect(stepFromPath('/unknown')).toBeUndefined()
      expect(stepFromPath('/configure/unknown')).toBeUndefined()
      expect(stepFromPath('/configure/style/extra')).toBeUndefined()
      expect(stepFromPath('')).toBeUndefined()
      expect(stepFromPath('/configure')).toBeUndefined()
    })
  })

  describe('stepNumber', () => {
    it('should return 1-based position in STEPPER_STEPS', () => {
      expect(stepNumber('style')).toBe(1)
      expect(stepNumber('color')).toBe(2)
      expect(stepNumber('design')).toBe(3)
      expect(stepNumber('solar')).toBe(4)
      expect(stepNumber('review')).toBe(5)
    })

    it('should return undefined for address', () => {
      expect(stepNumber('address')).toBeUndefined()
    })

    it('should return undefined for done', () => {
      expect(stepNumber('done')).toBeUndefined()
    })
  })

  describe('path and id round-trip', () => {
    it('should convert path to id and back for all steps', () => {
      STEPS.forEach((step) => {
        const id = stepFromPath(step.path)
        expect(id).toBe(step.id)
        const retrievedStep = getStep(step.id)
        expect(retrievedStep.path).toBe(step.path)
      })
    })
  })
})
