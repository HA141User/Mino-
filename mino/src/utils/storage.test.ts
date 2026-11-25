import { afterEach, describe, expect, it } from 'vitest'
import { parseBoundedPositiveInt, readStoredBoundedInt } from './storage'

describe('storage validation helpers', () => {
  const originalWindow = globalThis.window

  afterEach(() => {
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow
    } else {
      delete (globalThis as { window?: unknown }).window
    }
  })

  it('menerima integer positif valid dalam batas dan menolak string kotor/ekstrem', () => {
    expect(parseBoundedPositiveInt('42', 256)).toBe(42)
    expect(parseBoundedPositiveInt(' 256 ', 256)).toBe(256)
    expect(parseBoundedPositiveInt('0', 256)).toBeNull()
    expect(parseBoundedPositiveInt('0', 256, 0)).toBe(0)
    expect(parseBoundedPositiveInt('-5', 256)).toBeNull()
    expect(parseBoundedPositiveInt('257', 256)).toBeNull()
    expect(parseBoundedPositiveInt('42abc', 256)).toBeNull()
    expect(parseBoundedPositiveInt('999999999999999999', 100_000)).toBeNull()
    expect(parseBoundedPositiveInt('1e5', 100_000)).toBeNull()
    expect(parseBoundedPositiveInt(null, 256)).toBeNull()
  })

  it('fallback ke legacy key jika nilai utama korup atau kosong', () => {
    const store = new Map<string, string>([
      ['primary', '999999abc'],
      ['legacy', '18'],
    ])
    globalThis.window = {
      localStorage: {
        getItem: (key: string) => store.get(key) ?? null,
      },
    } as unknown as Window & typeof globalThis

    expect(readStoredBoundedInt('primary', 100_000, 'legacy')).toBe(18)
  })
})
