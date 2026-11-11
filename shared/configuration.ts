import type { ColorId, MaterialId, TrimId } from './catalog'
import { getPattern, isMaterialId, isTrimId, isColorId, getMaterial } from './catalog'

export type OrientId = 'ns' | 'ew' | 'flat'

export interface Configuration {
  address: string
  material: MaterialId
  pattern: string
  color: ColorId
  trim: TrimId
  solar: boolean
  usage: number
  orient: OrientId
  panels?: number
}

export const DEFAULTS: Readonly<Configuration> = {
  address: '',
  material: 'shingle',
  pattern: 'dim',
  color: 'charcoal',
  trim: 'white',
  solar: true,
  usage: 600,
  orient: 'ns',
  panels: undefined,
}

function isNumericString(v: unknown): v is string {
  if (typeof v !== 'string') return false
  return /^\d+$/.test(v)
}

function isSafeInteger(n: number): boolean {
  return Number.isSafeInteger(n) && n >= 0
}

export function parseQuery(query: Record<string, unknown>): Configuration {
  // Helper to extract first element if array, handle non-string types
  const getString = (v: unknown): string | undefined => {
    if (Array.isArray(v)) {
      v = v[0]
    }
    if (typeof v === 'string') {
      return v
    }
    return undefined
  }

  const addressValue = getString(query.address)
  const address = addressValue !== undefined ? addressValue : DEFAULTS.address

  const materialValue = getString(query.material)
  const material = isMaterialId(materialValue) ? materialValue : DEFAULTS.material

  const patternValue = getString(query.pattern)
  const pattern = patternValue && getPattern(material, patternValue)
    ? patternValue
    : getMaterial(material).defaultPatternId

  const colorValue = getString(query.color)
  const color = isColorId(colorValue) ? colorValue : DEFAULTS.color

  const trimValue = getString(query.trim)
  const trim = isTrimId(trimValue) ? trimValue : DEFAULTS.trim

  const solarValue = getString(query.solar)
  const solar = solarValue === '0' ? false : DEFAULTS.solar

  const usageValue = getString(query.usage)
  let usage = DEFAULTS.usage
  if (isNumericString(usageValue)) {
    const parsed = parseInt(usageValue, 10)
    if (isSafeInteger(parsed)) {
      usage = parsed
    }
  }

  const orientValue = getString(query.orient)
  const orient = (orientValue === 'ns' || orientValue === 'ew' || orientValue === 'flat')
    ? orientValue
    : DEFAULTS.orient

  const panelsValue = getString(query.panels)
  let panels: number | undefined = undefined
  if (isNumericString(panelsValue)) {
    const parsed = parseInt(panelsValue, 10)
    if (isSafeInteger(parsed)) {
      panels = parsed
    }
  }

  return {
    address,
    material,
    pattern,
    color,
    trim,
    solar,
    usage,
    orient,
    panels,
  }
}

export function toQuery(config: Configuration): Record<string, string> {
  const query: Record<string, string> = {}

  // address is always included
  query.address = config.address

  // material only if not default
  if (config.material !== DEFAULTS.material) {
    query.material = config.material
  }

  // pattern only if not material's default
  if (config.pattern !== getMaterial(config.material).defaultPatternId) {
    query.pattern = config.pattern
  }

  // color only if not default
  if (config.color !== DEFAULTS.color) {
    query.color = config.color
  }

  // trim only if not default
  if (config.trim !== DEFAULTS.trim) {
    query.trim = config.trim
  }

  // solar only when false
  if (config.solar !== DEFAULTS.solar) {
    query.solar = '0'
  }

  // usage only if not default
  if (config.usage !== DEFAULTS.usage) {
    query.usage = String(config.usage)
  }

  // orient only if not default
  if (config.orient !== DEFAULTS.orient) {
    query.orient = config.orient
  }

  // panels only if defined
  if (config.panels !== undefined) {
    query.panels = String(config.panels)
  }

  return query
}

export function withMaterial(
  config: Configuration,
  material: MaterialId,
): Configuration {
  return {
    ...config,
    material,
    pattern: getMaterial(material).defaultPatternId,
  }
}

export function withUsage(
  config: Configuration,
  usage: number,
): Configuration {
  return {
    ...config,
    usage,
    panels: undefined,
  }
}

export function withOrient(
  config: Configuration,
  orient: OrientId,
): Configuration {
  return {
    ...config,
    orient,
    panels: undefined,
  }
}
