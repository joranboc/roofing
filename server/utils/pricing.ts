import type { MaterialId, TrimId } from '../../shared/catalog'

// Demo pricing values
const MATERIAL_RATE: Record<MaterialId, number> = {
  shingle: 6,
  metal: 11,
  tile: 16,
  slate: 18,
}

const PATTERN_ADJ: Record<MaterialId, Record<string, number>> = {
  shingle: {
    '3tab': -1,
    'dim': 0,
    'shake': 1.5,
  },
  metal: {
    wide: 0,
    narrow: 1,
    batten: 2,
  },
  tile: {
    s: 0,
    barrel: 1.5,
    flat: -1,
  },
  slate: {
    uniform: 0,
    random: 1.5,
    fish: 3,
  },
}

const TRIM_FEE: Record<TrimId, number> = {
  white: 0,
  black: 0,
  bronze: 900,
  match: 0,
}

export function roundTo10(n: number): number {
  return Math.round(n / 10) * 10
}

export interface PriceInput {
  roofAreaSqFt: number
  material: MaterialId
  pattern: string
  trim: TrimId
}

export interface PriceResult {
  total: number
  currency: 'USD'
}

export function computePrice(input: PriceInput): PriceResult {
  const patternAdj = PATTERN_ADJ[input.material][input.pattern]
  if (patternAdj === undefined) {
    throw new Error(`No price adjustment for pattern "${input.pattern}" of material "${input.material}"`)
  }

  const materialRate = MATERIAL_RATE[input.material]
  const trimFee = TRIM_FEE[input.trim]

  const total = roundTo10(
    input.roofAreaSqFt * (materialRate + patternAdj) + trimFee,
  )

  return {
    total,
    currency: 'USD',
  }
}
