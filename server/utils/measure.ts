import { fnv1a32 } from './hash'

export function normalizeAddress(address: string): string {
  return address.trim().toLowerCase()
}

// Demo stand-in for a real roof-measurement provider
export function measureRoof(address: string): { roofAreaSqFt: number } {
  const normalized = normalizeAddress(address)
  const hash = fnv1a32(normalized)
  const roofAreaSqFt = 1400 + (hash % 21) * 100

  return { roofAreaSqFt }
}
