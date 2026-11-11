import { createError } from 'h3'
import { isMaterialId, isTrimId, getPattern } from '../../shared/catalog'
import type { PriceInput } from './pricing'

export function validateMeasureInput(body: unknown): { address: string } {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { field: 'body' },
    })
  }

  const obj = body as Record<string, unknown>
  const address = obj.address

  if (typeof address !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid address',
      data: { field: 'address' },
    })
  }

  if (address.trim() === '') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Address cannot be blank',
      data: { field: 'address' },
    })
  }

  return { address }
}

export function validatePriceInput(body: unknown): PriceInput {
  if (!body || typeof body !== 'object' || Array.isArray(body)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Bad Request',
      data: { field: 'body' },
    })
  }

  const obj = body as Record<string, unknown>

  // Validate material
  const material = obj.material
  if (!isMaterialId(material)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid material',
      data: { field: 'material' },
    })
  }

  // Validate pattern
  const pattern = obj.pattern
  if (typeof pattern !== 'string') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid pattern',
      data: { field: 'pattern' },
    })
  }

  if (!getPattern(material, pattern)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid pattern',
      data: { field: 'pattern' },
    })
  }

  // Validate trim
  const trim = obj.trim
  if (!isTrimId(trim)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid trim',
      data: { field: 'trim' },
    })
  }

  // Validate roofAreaSqFt
  const roofAreaSqFt = obj.roofAreaSqFt
  if (typeof roofAreaSqFt !== 'number') {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid roof area',
      data: { field: 'roofAreaSqFt' },
    })
  }

  if (!Number.isFinite(roofAreaSqFt)) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid roof area',
      data: { field: 'roofAreaSqFt' },
    })
  }

  if (roofAreaSqFt <= 0 || roofAreaSqFt > 100000) {
    throw createError({
      statusCode: 400,
      statusMessage: 'Invalid roof area',
      data: { field: 'roofAreaSqFt' },
    })
  }

  return {
    roofAreaSqFt,
    material,
    pattern,
    trim,
  }
}
