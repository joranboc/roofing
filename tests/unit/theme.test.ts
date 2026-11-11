import { mountSuspended } from '@nuxt/test-utils/runtime'
import { describe, expect, it } from 'vitest'
import { readFileSync } from 'fs'
import { resolve } from 'path'

describe('theme', () => {
  it('contains all color tokens in main.css', () => {
    const cssPath = resolve(__dirname, '../../app/assets/css/main.css')
    const cssContent = readFileSync(cssPath, 'utf-8')

    const colorTokens = [
      '--color-accent',
      '--color-ink',
      '--color-muted',
      '--color-line',
      '--color-field',
      '--color-selected',
      '--color-danger',
    ]

    colorTokens.forEach((token) => {
      expect(cssContent).toContain(token)
    })
  })

  it('contains font tokens in main.css', () => {
    const cssPath = resolve(__dirname, '../../app/assets/css/main.css')
    const cssContent = readFileSync(cssPath, 'utf-8')

    const fontTokens = ['--font-sans', '--font-display']

    fontTokens.forEach((token) => {
      expect(cssContent).toContain(token)
    })
  })

  it('renders component with theme classes', async () => {
    const TestComponent = {
      template: '<div class="text-ink bg-selected border-line font-display">Theme Test</div>',
    }

    const wrapper = await mountSuspended(TestComponent)

    expect(wrapper.classes()).toContain('text-ink')
    expect(wrapper.classes()).toContain('bg-selected')
    expect(wrapper.classes()).toContain('border-line')
    expect(wrapper.classes()).toContain('font-display')
    expect(wrapper.text()).toContain('Theme Test')
  })
})
