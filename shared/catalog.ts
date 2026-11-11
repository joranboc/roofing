export type MaterialId = 'shingle' | 'metal' | 'tile' | 'slate'
export type TrimId = 'white' | 'black' | 'bronze' | 'match'
export type ColorId = 'charcoal' | 'wood' | 'slate' | 'bark' | 'pewter' | 'tan' | 'terra' | 'forest'

export interface Pattern {
  id: string
  name: string
  rows?: number
  ticks?: number[]
  seams?: number
  batten?: boolean
  arcs?: { w: number, depth: number }
}

export interface Material {
  id: MaterialId
  name: string
  description: string
  tier: '$' | '$$' | '$$$'
  defaultPatternId: string
  patterns: Pattern[]
}

export interface Color {
  id: ColorId
  name: string
  hex: string
}

export interface Trim {
  id: TrimId
  name: string
  hex: string | null
}

export const MATERIALS: readonly Material[] = [
  {
    id: 'shingle',
    name: 'Architectural shingle',
    description: 'Dimensional asphalt shingles, the everyday favorite.',
    tier: '$',
    defaultPatternId: 'dim',
    patterns: [
      { id: '3tab', name: 'Classic 3-tab', rows: 8, ticks: [16] },
      { id: 'dim', name: 'Dimensional', rows: 7, ticks: [11, 17, 8, 14, 20, 10] },
      { id: 'shake', name: 'Shake-look', rows: 10, ticks: [7, 12, 6, 9, 15, 8, 11] },
    ],
  },
  {
    id: 'metal',
    name: 'Standing-seam metal',
    description: 'Clean vertical lines and a modern profile.',
    tier: '$$',
    defaultPatternId: 'wide',
    patterns: [
      { id: 'wide', name: 'Wide seam', seams: 18 },
      { id: 'narrow', name: 'Narrow seam', seams: 10 },
      { id: 'batten', name: 'Board & batten', seams: 16, batten: true },
    ],
  },
  {
    id: 'tile',
    name: 'Clay tile',
    description: 'Spanish and Mediterranean character.',
    tier: '$$$',
    defaultPatternId: 's',
    patterns: [
      { id: 's', name: 'Spanish S', rows: 8, arcs: { w: 14, depth: 5 } },
      { id: 'barrel', name: 'Barrel', rows: 12, seams: 9 },
      { id: 'flat', name: 'Flat tile', rows: 8, ticks: [18] },
    ],
  },
  {
    id: 'slate',
    name: 'Synthetic slate',
    description: 'The look of natural slate, lighter weight.',
    tier: '$$$',
    defaultPatternId: 'uniform',
    patterns: [
      { id: 'uniform', name: 'Uniform', rows: 8, ticks: [12] },
      { id: 'random', name: 'Random width', rows: 8, ticks: [9, 15, 11, 7, 13, 18, 10] },
      { id: 'fish', name: 'Fishscale', rows: 7, arcs: { w: 11, depth: 5 } },
    ],
  },
]

export const COLORS: readonly Color[] = [
  { id: 'charcoal', name: 'Charcoal', hex: '#3A3D40' },
  { id: 'wood', name: 'Weathered Wood', hex: '#6E6455' },
  { id: 'slate', name: 'Slate Gray', hex: '#5E6B73' },
  { id: 'bark', name: 'Barkwood', hex: '#5A4535' },
  { id: 'pewter', name: 'Pewter', hex: '#8A8F94' },
  { id: 'tan', name: 'Desert Tan', hex: '#B59F7E' },
  { id: 'terra', name: 'Terracotta', hex: '#B55A3A' },
  { id: 'forest', name: 'Forest', hex: '#3F5546' },
]

export const TRIMS: readonly Trim[] = [
  { id: 'white', name: 'White', hex: '#F5F5F2' },
  { id: 'black', name: 'Black', hex: '#1E1F21' },
  { id: 'bronze', name: 'Bronze', hex: '#6B4F36' },
  { id: 'match', name: 'Match roof', hex: null },
]

const MATERIALS_BY_ID = Object.fromEntries(
  MATERIALS.map(m => [m.id, m]),
) as Record<MaterialId, Material>

export function getMaterial(id: MaterialId): Material {
  return MATERIALS_BY_ID[id]
}

export function getPattern(
  materialId: MaterialId,
  patternId: string,
): Pattern | undefined {
  return getMaterial(materialId).patterns.find(p => p.id === patternId)
}

export function isMaterialId(v: unknown): v is MaterialId {
  if (typeof v !== 'string') return false
  return MATERIALS.some(m => m.id === v)
}

export function isTrimId(v: unknown): v is TrimId {
  if (typeof v !== 'string') return false
  return TRIMS.some(t => t.id === v)
}

export function isColorId(v: unknown): v is ColorId {
  if (typeof v !== 'string') return false
  return COLORS.some(c => c.id === v)
}
