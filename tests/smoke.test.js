import { describe, it, expect } from 'vitest'

describe('smoke', () => {
  it('jsdom activo: document existe', () => {
    expect(document).toBeDefined()
  })
})
