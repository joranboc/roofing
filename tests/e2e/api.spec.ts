import { expect, test } from '@playwright/test'

test.describe('POST /api/measure', () => {
  test('valid address returns roof area', async ({ request }) => {
    const response = await request.post('/api/measure', {
      data: { address: '1 Market St, San Francisco' },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body).toHaveProperty('roofAreaSqFt')
    expect(typeof body.roofAreaSqFt).toBe('number')
    expect(body.roofAreaSqFt % 100).toBe(0)
    expect(body.roofAreaSqFt).toBeGreaterThanOrEqual(1400)
    expect(body.roofAreaSqFt).toBeLessThanOrEqual(3400)
  })

  test('calling twice returns identical body', async ({ request }) => {
    const call1 = await request.post('/api/measure', {
      data: { address: '1 Market St, San Francisco' },
    })
    const body1 = await call1.json()

    const call2 = await request.post('/api/measure', {
      data: { address: '1 Market St, San Francisco' },
    })
    const body2 = await call2.json()

    expect(body1).toEqual(body2)
  })

  test('address with extra spaces and different case returns same area', async ({ request }) => {
    const trimmedResponse = await request.post('/api/measure', {
      data: { address: '1 market st, san francisco' },
    })
    const trimmedBody = await trimmedResponse.json()

    const spacedResponse = await request.post('/api/measure', {
      data: { address: '  1 MARKET ST, SAN FRANCISCO  ' },
    })
    const spacedBody = await spacedResponse.json()

    expect(trimmedBody.roofAreaSqFt).toBe(spacedBody.roofAreaSqFt)
  })

  test('blank address returns 400 with field address', async ({ request }) => {
    const response = await request.post('/api/measure', {
      data: { address: '' },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data).toHaveProperty('field')
    expect(body.data.field).toBe('address')
  })

  test('whitespace-only address returns 400 with field address', async ({ request }) => {
    const response = await request.post('/api/measure', {
      data: { address: '   ' },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data.field).toBe('address')
  })

  test('missing address returns 400 with field address', async ({ request }) => {
    const response = await request.post('/api/measure', {
      data: {},
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data.field).toBe('address')
  })

  test('empty object returns 400 with field address', async ({ request }) => {
    const response = await request.post('/api/measure', {
      data: {},
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data.field).toBe('address')
  })

  test('non-string address returns 400 with field address', async ({ request }) => {
    const response = await request.post('/api/measure', {
      data: { address: 123 },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data.field).toBe('address')
  })

  test('request with no JSON body returns 400', async ({ request }) => {
    const response = await request.post('/api/measure', {
      data: '',
    })
    expect(response.status()).toBe(400)
  })
})

test.describe('POST /api/price', () => {
  test('valid price request returns total', async ({ request }) => {
    const response = await request.post('/api/price', {
      data: {
        roofAreaSqFt: 2000,
        material: 'shingle',
        pattern: 'dim',
        trim: 'white',
      },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.total).toBe(12000)
    expect(body.currency).toBe('USD')
  })

  test('another valid price request returns correct total', async ({ request }) => {
    const response = await request.post('/api/price', {
      data: {
        roofAreaSqFt: 2000,
        material: 'metal',
        pattern: 'wide',
        trim: 'bronze',
      },
    })
    expect(response.status()).toBe(200)
    const body = await response.json()
    expect(body.total).toBe(22900)
    expect(body.currency).toBe('USD')
  })

  test('calling twice returns identical response', async ({ request }) => {
    const call1 = await request.post('/api/price', {
      data: {
        roofAreaSqFt: 2000,
        material: 'shingle',
        pattern: 'dim',
        trim: 'white',
      },
    })
    const body1 = await call1.json()

    const call2 = await request.post('/api/price', {
      data: {
        roofAreaSqFt: 2000,
        material: 'shingle',
        pattern: 'dim',
        trim: 'white',
      },
    })
    const body2 = await call2.json()

    expect(body1).toEqual(body2)
  })

  test('unknown material returns 400 with field material', async ({ request }) => {
    const response = await request.post('/api/price', {
      data: {
        roofAreaSqFt: 2000,
        material: 'unknown',
        pattern: 'dim',
        trim: 'white',
      },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data.field).toBe('material')
  })

  test('pattern from another material returns 400 with field pattern', async ({ request }) => {
    const response = await request.post('/api/price', {
      data: {
        roofAreaSqFt: 2000,
        material: 'shingle',
        pattern: 'wide',
        trim: 'white',
      },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data.field).toBe('pattern')
  })

  test('unknown trim returns 400 with field trim', async ({ request }) => {
    const response = await request.post('/api/price', {
      data: {
        roofAreaSqFt: 2000,
        material: 'shingle',
        pattern: 'dim',
        trim: 'unknown',
      },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data.field).toBe('trim')
  })

  test('roofAreaSqFt = 0 returns 400 with field roofAreaSqFt', async ({ request }) => {
    const response = await request.post('/api/price', {
      data: {
        roofAreaSqFt: 0,
        material: 'shingle',
        pattern: 'dim',
        trim: 'white',
      },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data.field).toBe('roofAreaSqFt')
  })

  test('roofAreaSqFt = -5 returns 400 with field roofAreaSqFt', async ({ request }) => {
    const response = await request.post('/api/price', {
      data: {
        roofAreaSqFt: -5,
        material: 'shingle',
        pattern: 'dim',
        trim: 'white',
      },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data.field).toBe('roofAreaSqFt')
  })

  test('roofAreaSqFt as string returns 400 with field roofAreaSqFt', async ({ request }) => {
    const response = await request.post('/api/price', {
      data: {
        roofAreaSqFt: '2000',
        material: 'shingle',
        pattern: 'dim',
        trim: 'white',
      },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data.field).toBe('roofAreaSqFt')
  })

  test('roofAreaSqFt = 100001 returns 400 with field roofAreaSqFt', async ({ request }) => {
    const response = await request.post('/api/price', {
      data: {
        roofAreaSqFt: 100001,
        material: 'shingle',
        pattern: 'dim',
        trim: 'white',
      },
    })
    expect(response.status()).toBe(400)
    const body = await response.json()
    expect(body.data.field).toBe('roofAreaSqFt')
  })
})
