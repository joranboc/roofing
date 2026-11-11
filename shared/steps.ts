export type StepId = 'address' | 'style' | 'color' | 'design' | 'solar' | 'review' | 'done'

export interface Step {
  id: StepId
  label: string
  path: string
  cta: string
}

export const STEPS: readonly Step[] = [
  {
    id: 'address',
    label: 'Address',
    path: '/',
    cta: 'See my real price',
  },
  {
    id: 'style',
    label: 'Style',
    path: '/configure/style',
    cta: 'Continue to color',
  },
  {
    id: 'color',
    label: 'Color',
    path: '/configure/color',
    cta: 'Continue to design',
  },
  {
    id: 'design',
    label: 'Design',
    path: '/configure/design',
    cta: 'Continue to solar',
  },
  {
    id: 'solar',
    label: 'Solar',
    path: '/configure/solar',
    cta: 'Review my roof',
  },
  {
    id: 'review',
    label: 'Review',
    path: '/configure/review',
    cta: 'See my real price',
  },
  {
    id: 'done',
    label: 'Done',
    path: '/configure/done',
    cta: 'Reserve my install date',
  },
]

export const STEPPER_STEPS: readonly Step[] = STEPS.filter(
  step => ['style', 'color', 'design', 'solar', 'review'].includes(step.id),
)

const STEPS_BY_ID = Object.fromEntries(
  STEPS.map(s => [s.id, s]),
) as Record<StepId, Step>

export function getStep(id: StepId): Step {
  return STEPS_BY_ID[id]
}

export function nextStep(id: StepId): StepId | undefined {
  const index = STEPS.findIndex(s => s.id === id)
  if (index === -1 || index === STEPS.length - 1) {
    return undefined
  }
  const next = STEPS[index + 1]
  return next?.id
}

export function prevStep(id: StepId): StepId | undefined {
  const index = STEPS.findIndex(s => s.id === id)
  if (index <= 0) {
    return undefined
  }
  const prev = STEPS[index - 1]
  return prev?.id
}

export function stepFromPath(path: string): StepId | undefined {
  // Remove query string and hash first
  let cleanPath = path
  const queryIndex = path.indexOf('?')
  if (queryIndex !== -1) {
    cleanPath = path.substring(0, queryIndex)
  }
  const hashIndex = cleanPath.indexOf('#')
  if (hashIndex !== -1) {
    cleanPath = cleanPath.substring(0, hashIndex)
  }

  // Remove trailing slash if present (but preserve root '/')
  let normalized = cleanPath
  if (normalized !== '/' && normalized.endsWith('/')) {
    normalized = normalized.slice(0, -1)
  }

  const step = STEPS.find(s => s.path === normalized)
  if (step) {
    return step.id
  }
  return undefined
}

export function stepNumber(id: StepId): number | undefined {
  const index = STEPPER_STEPS.findIndex(s => s.id === id)
  if (index < 0) {
    return undefined
  }
  return index + 1
}
