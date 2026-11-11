import { describe, expect, it } from 'vitest'
import {
  DEFAULTS,
  parseQuery,
  toQuery,
  withMaterial,
  withUsage,
  withOrient,
  type Configuration,
} from '#shared/configuration'
import { getMaterial } from '#shared/catalog'

describe('configuration', () => {
  describe('parseQuery', () => {
    it('should return DEFAULTS for empty query', () => {
      const result = parseQuery({})
      expect(result).toEqual(DEFAULTS)
    })

    it('should parse a fully specified valid query', () => {
      const query = {
        address: '123 Main St',
        material: 'metal',
        pattern: 'batten',
        color: 'terra',
        trim: 'bronze',
        solar: '1',
        usage: '800',
        orient: 'ew',
        panels: '24',
      }
      const result = parseQuery(query)
      expect(result).toEqual({
        address: '123 Main St',
        material: 'metal',
        pattern: 'batten',
        color: 'terra',
        trim: 'bronze',
        solar: true,
        usage: 800,
        orient: 'ew',
        panels: 24,
      })
    })

    describe('parameter fallbacks', () => {
      it('should fallback bad material to shingle', () => {
        const result = parseQuery({ material: 'invalid' })
        expect(result.material).toBe('shingle')
      })

      it('should fallback bad color to charcoal', () => {
        const result = parseQuery({ color: 'invalid' })
        expect(result.color).toBe('charcoal')
      })

      it('should fallback bad trim to white', () => {
        const result = parseQuery({ trim: 'invalid' })
        expect(result.trim).toBe('white')
      })

      it('should fallback bad orient to ns', () => {
        const result = parseQuery({ orient: 'invalid' })
        expect(result.orient).toBe('ns')
      })

      it('should fallback usage "-5" to 600', () => {
        const result = parseQuery({ usage: '-5' })
        expect(result.usage).toBe(600)
      })

      it('should fallback usage "12.5" to 600', () => {
        const result = parseQuery({ usage: '12.5' })
        expect(result.usage).toBe(600)
      })

      it('should fallback usage "1e3" to 600', () => {
        const result = parseQuery({ usage: '1e3' })
        expect(result.usage).toBe(600)
      })

      it('should fallback usage " 600" (with space) to 600', () => {
        const result = parseQuery({ usage: ' 600' })
        expect(result.usage).toBe(600)
      })

      it('should fallback usage "abc" to 600', () => {
        const result = parseQuery({ usage: 'abc' })
        expect(result.usage).toBe(600)
      })

      it('should fallback usage "" (empty string) to 600', () => {
        const result = parseQuery({ usage: '' })
        expect(result.usage).toBe(600)
      })

      it('should fallback panels "-5" to undefined', () => {
        const result = parseQuery({ panels: '-5' })
        expect(result.panels).toBeUndefined()
      })

      it('should fallback panels "12.5" to undefined', () => {
        const result = parseQuery({ panels: '12.5' })
        expect(result.panels).toBeUndefined()
      })

      it('should fallback panels "1e3" to undefined', () => {
        const result = parseQuery({ panels: '1e3' })
        expect(result.panels).toBeUndefined()
      })

      it('should fallback panels " 20" (with space) to undefined', () => {
        const result = parseQuery({ panels: ' 20' })
        expect(result.panels).toBeUndefined()
      })

      it('should fallback panels "abc" to undefined', () => {
        const result = parseQuery({ panels: 'abc' })
        expect(result.panels).toBeUndefined()
      })

      it('should fallback panels "" (empty string) to undefined', () => {
        const result = parseQuery({ panels: '' })
        expect(result.panels).toBeUndefined()
      })

      it('should convert solar "0" to false', () => {
        const result = parseQuery({ solar: '0' })
        expect(result.solar).toBe(false)
      })

      it('should convert solar "1" to true', () => {
        const result = parseQuery({ solar: '1' })
        expect(result.solar).toBe(true)
      })

      it('should convert solar "yes" to true', () => {
        const result = parseQuery({ solar: 'yes' })
        expect(result.solar).toBe(true)
      })

      it('should convert missing solar to true', () => {
        const result = parseQuery({})
        expect(result.solar).toBe(true)
      })
    })

    describe('pattern handling', () => {
      it('should keep pattern valid for material', () => {
        const result = parseQuery({ material: 'metal', pattern: 'batten' })
        expect(result.pattern).toBe('batten')
      })

      it('should fallback pattern from another material to material default', () => {
        const result = parseQuery({ material: 'metal', pattern: 'dim' })
        expect(result.pattern).toBe(getMaterial('metal').defaultPatternId)
        expect(result.pattern).toBe('wide')
      })

      it('should reset pattern when material is bad and pattern invalid', () => {
        const result = parseQuery({ material: 'invalid', pattern: 'batten' })
        expect(result.material).toBe('shingle')
        expect(result.pattern).toBe('dim')
      })

      it('should use material default pattern when pattern is missing', () => {
        const result = parseQuery({ material: 'tile' })
        expect(result.pattern).toBe(getMaterial('tile').defaultPatternId)
        expect(result.pattern).toBe('s')
      })
    })

    describe('array values', () => {
      it('should use first element of array color', () => {
        const result = parseQuery({ color: ['terra', 'forest'] })
        expect(result.color).toBe('terra')
      })

      it('should fallback if array first element is invalid', () => {
        const result = parseQuery({ color: ['invalid', 'terra'] })
        expect(result.color).toBe('charcoal')
      })

      it('should use first element of array usage', () => {
        const result = parseQuery({ usage: ['800', '900'] })
        expect(result.usage).toBe(800)
      })

      it('should use first element of array material', () => {
        const result = parseQuery({ material: ['metal', 'tile'] })
        expect(result.material).toBe('metal')
      })
    })

    describe('non-string values', () => {
      it('should treat null as missing', () => {
        const result = parseQuery({ address: null })
        expect(result.address).toBe('')
      })

      it('should treat number as missing', () => {
        const result = parseQuery({ usage: 123 })
        expect(result.usage).toBe(600)
      })

      it('should treat object as missing', () => {
        const result = parseQuery({ material: {} })
        expect(result.material).toBe('shingle')
      })

      it('should treat undefined as missing', () => {
        const result = parseQuery({ color: undefined })
        expect(result.color).toBe('charcoal')
      })
    })

    describe('address handling', () => {
      it('should preserve address with spaces verbatim', () => {
        const result = parseQuery({ address: '  123 Main St  ' })
        expect(result.address).toBe('  123 Main St  ')
      })

      it('should use empty string for missing address', () => {
        const result = parseQuery({})
        expect(result.address).toBe('')
      })

      it('should use empty string for null address', () => {
        const result = parseQuery({ address: null })
        expect(result.address).toBe('')
      })
    })

    describe('zero values', () => {
      it('should parse usage "0" as 0', () => {
        const result = parseQuery({ usage: '0' })
        expect(result.usage).toBe(0)
      })

      it('should parse panels "0" as 0', () => {
        const result = parseQuery({ panels: '0' })
        expect(result.panels).toBe(0)
      })
    })
  })

  describe('toQuery', () => {
    it('should return only address for DEFAULTS with address "x"', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'x',
      }
      const result = toQuery(config)
      expect(result).toEqual({ address: 'x' })
    })

    it('should include address even when empty', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: '',
      }
      const result = toQuery(config)
      expect(result.address).toBe('')
    })

    it('should omit material when it is default shingle', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        material: 'shingle',
      }
      const result = toQuery(config)
      expect(result.material).toBeUndefined()
    })

    it('should include material when not default', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        material: 'metal',
      }
      const result = toQuery(config)
      expect(result.material).toBe('metal')
      expect(result.address).toBe('test')
    })

    it('should omit pattern for metal with default "wide"', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        material: 'metal',
        pattern: 'wide',
      }
      const result = toQuery(config)
      expect(result.pattern).toBeUndefined()
    })

    it('should include pattern for metal with non-default "narrow"', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        material: 'metal',
        pattern: 'narrow',
      }
      const result = toQuery(config)
      expect(result.pattern).toBe('narrow')
    })

    it('should omit color when default charcoal', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        color: 'charcoal',
      }
      const result = toQuery(config)
      expect(result.color).toBeUndefined()
    })

    it('should include color when not default', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        color: 'terra',
      }
      const result = toQuery(config)
      expect(result.color).toBe('terra')
    })

    it('should omit trim when default white', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        trim: 'white',
      }
      const result = toQuery(config)
      expect(result.trim).toBeUndefined()
    })

    it('should include trim when not default', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        trim: 'bronze',
      }
      const result = toQuery(config)
      expect(result.trim).toBe('bronze')
    })

    it('should omit solar when true (default)', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        solar: true,
      }
      const result = toQuery(config)
      expect(result.solar).toBeUndefined()
    })

    it('should include solar as "0" when false', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        solar: false,
      }
      const result = toQuery(config)
      expect(result.solar).toBe('0')
    })

    it('should omit usage when 600 (default)', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        usage: 600,
      }
      const result = toQuery(config)
      expect(result.usage).toBeUndefined()
    })

    it('should include usage as string when not default', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        usage: 800,
      }
      const result = toQuery(config)
      expect(result.usage).toBe('800')
    })

    it('should omit orient when ns (default)', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        orient: 'ns',
      }
      const result = toQuery(config)
      expect(result.orient).toBeUndefined()
    })

    it('should include orient when not default', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        orient: 'ew',
      }
      const result = toQuery(config)
      expect(result.orient).toBe('ew')
    })

    it('should omit panels when undefined', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        panels: undefined,
      }
      const result = toQuery(config)
      expect(result.panels).toBeUndefined()
    })

    it('should include panels as string when 0', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        panels: 0,
      }
      const result = toQuery(config)
      expect(result.panels).toBe('0')
    })

    it('should include panels as string when defined', () => {
      const config: Configuration = {
        ...DEFAULTS,
        address: 'test',
        panels: 24,
      }
      const result = toQuery(config)
      expect(result.panels).toBe('24')
    })
  })

  describe('round-trip (parseQuery -> toQuery -> parseQuery)', () => {
    it('should round-trip DEFAULTS with address', () => {
      const original: Configuration = {
        ...DEFAULTS,
        address: 'test addr',
      }
      const query = toQuery(original)
      const parsed = parseQuery(query)
      expect(parsed).toEqual(original)
    })

    it('should round-trip shingle config', () => {
      const original: Configuration = {
        address: '456 Oak Ave',
        material: 'shingle',
        pattern: 'shake',
        color: 'wood',
        trim: 'white',
        solar: true,
        usage: 600,
        orient: 'ns',
        panels: undefined,
      }
      const query = toQuery(original)
      const parsed = parseQuery(query)
      expect(parsed).toEqual(original)
    })

    it('should round-trip metal config', () => {
      const original: Configuration = {
        address: '789 Pine Rd',
        material: 'metal',
        pattern: 'batten',
        color: 'charcoal',
        trim: 'black',
        solar: false,
        usage: 1000,
        orient: 'ew',
        panels: 16,
      }
      const query = toQuery(original)
      const parsed = parseQuery(query)
      expect(parsed).toEqual(original)
    })

    it('should round-trip tile config', () => {
      const original: Configuration = {
        address: 'Tile House',
        material: 'tile',
        pattern: 'barrel',
        color: 'terra',
        trim: 'bronze',
        solar: true,
        usage: 700,
        orient: 'flat',
        panels: undefined,
      }
      const query = toQuery(original)
      const parsed = parseQuery(query)
      expect(parsed).toEqual(original)
    })

    it('should round-trip slate config', () => {
      const original: Configuration = {
        address: 'Slate Manor',
        material: 'slate',
        pattern: 'random',
        color: 'pewter',
        trim: 'match',
        solar: false,
        usage: 400,
        orient: 'ns',
        panels: 20,
      }
      const query = toQuery(original)
      const parsed = parseQuery(query)
      expect(parsed).toEqual(original)
    })

    it('should round-trip complex config with all non-defaults', () => {
      const original: Configuration = {
        address: '999 Complex St',
        material: 'tile',
        pattern: 'flat',
        color: 'slate',
        trim: 'bronze',
        solar: false,
        usage: 850,
        orient: 'ew',
        panels: 30,
      }
      const query = toQuery(original)
      const parsed = parseQuery(query)
      expect(parsed).toEqual(original)
    })
  })

  describe('withMaterial', () => {
    it('should set material and reset pattern to material default', () => {
      const config: Configuration = {
        ...DEFAULTS,
        material: 'shingle',
        pattern: 'shake',
      }
      const result = withMaterial(config, 'metal')
      expect(result.material).toBe('metal')
      expect(result.pattern).toBe(getMaterial('metal').defaultPatternId)
    })

    it('should not mutate the input config', () => {
      const config: Configuration = {
        ...DEFAULTS,
        material: 'shingle',
        pattern: 'dim',
      }
      const original = { ...config }
      withMaterial(config, 'tile')
      expect(config).toEqual(original)
    })

    it('should preserve other properties', () => {
      const config: Configuration = {
        address: '123 Main',
        material: 'shingle',
        pattern: 'dim',
        color: 'terra',
        trim: 'bronze',
        solar: false,
        usage: 800,
        orient: 'ew',
        panels: 16,
      }
      const result = withMaterial(config, 'slate')
      expect(result.address).toBe('123 Main')
      expect(result.color).toBe('terra')
      expect(result.trim).toBe('bronze')
      expect(result.solar).toBe(false)
      expect(result.usage).toBe(800)
      expect(result.orient).toBe('ew')
      expect(result.panels).toBe(16)
    })
  })

  describe('withUsage', () => {
    it('should set usage and clear panels', () => {
      const config: Configuration = {
        ...DEFAULTS,
        usage: 600,
        panels: 24,
      }
      const result = withUsage(config, 800)
      expect(result.usage).toBe(800)
      expect(result.panels).toBeUndefined()
    })

    it('should not mutate the input config', () => {
      const config: Configuration = {
        ...DEFAULTS,
        usage: 600,
        panels: 20,
      }
      const original = { ...config }
      withUsage(config, 750)
      expect(config).toEqual(original)
    })

    it('should preserve other properties', () => {
      const config: Configuration = {
        address: '456 Oak',
        material: 'metal',
        pattern: 'narrow',
        color: 'charcoal',
        trim: 'white',
        solar: true,
        usage: 600,
        orient: 'ns',
        panels: 15,
      }
      const result = withUsage(config, 900)
      expect(result.address).toBe('456 Oak')
      expect(result.material).toBe('metal')
      expect(result.pattern).toBe('narrow')
      expect(result.color).toBe('charcoal')
      expect(result.trim).toBe('white')
      expect(result.solar).toBe(true)
      expect(result.orient).toBe('ns')
    })
  })

  describe('withOrient', () => {
    it('should set orient and clear panels', () => {
      const config: Configuration = {
        ...DEFAULTS,
        orient: 'ns',
        panels: 24,
      }
      const result = withOrient(config, 'ew')
      expect(result.orient).toBe('ew')
      expect(result.panels).toBeUndefined()
    })

    it('should not mutate the input config', () => {
      const config: Configuration = {
        ...DEFAULTS,
        orient: 'ns',
        panels: 20,
      }
      const original = { ...config }
      withOrient(config, 'flat')
      expect(config).toEqual(original)
    })

    it('should preserve other properties', () => {
      const config: Configuration = {
        address: '789 Pine',
        material: 'tile',
        pattern: 's',
        color: 'wood',
        trim: 'match',
        solar: false,
        usage: 500,
        orient: 'ns',
        panels: 12,
      }
      const result = withOrient(config, 'ew')
      expect(result.address).toBe('789 Pine')
      expect(result.material).toBe('tile')
      expect(result.pattern).toBe('s')
      expect(result.color).toBe('wood')
      expect(result.trim).toBe('match')
      expect(result.solar).toBe(false)
      expect(result.usage).toBe(500)
    })
  })
})
