import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import App from '~/app.vue'

describe('app', () => {
  it('renders the product name', async () => {
    const wrapper = await mountSuspended(App)
    expect(wrapper.text()).toContain('Openly Roofing')
  })
})
