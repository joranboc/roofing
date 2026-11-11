export function fnv1a32(input: string): number {
  const bytes = new TextEncoder().encode(input)
  let hash = 2166136261 // FNV offset basis: 0x811c9dc5

  for (const byte of bytes) {
    hash ^= byte
    hash = Math.imul(hash, 16777619)
  }

  return hash >>> 0 // convert to unsigned 32-bit
}
