import { afterEach, describe, expect, it } from 'vitest'
import {
  isAudioSupported,
  playCountdownGoSound,
  playCountdownTickSound,
  playEatSound,
  playGameOverSound,
  playSpeedUpSound,
  readStoredMute,
  unlockAudio,
  writeStoredMute,
} from './sound'

describe('sound module', () => {
  const originalWindow = globalThis.window

  afterEach(() => {
    if (originalWindow !== undefined) {
      globalThis.window = originalWindow
    } else {
      delete (globalThis as { window?: unknown }).window
    }
  })

  it('mengembalikan false saat window tidak tersedia di Node.js', () => {
    delete (globalThis as { window?: unknown }).window
    expect(readStoredMute()).toBe(false)
    expect(isAudioSupported()).toBe(false)
    expect(() => writeStoredMute(true)).not.toThrow()
  })

  it('menyimpan dan membaca status bisu di lingkungan browser', () => {
    const store = new Map<string, string>()
    const mockStorage = {
      getItem: (key: string) => store.get(key) ?? null,
      setItem: (key: string, val: string) => store.set(key, val),
      clear: () => store.clear(),
    }

    globalThis.window = {
      localStorage: mockStorage,
    } as unknown as Window & typeof globalThis

    expect(readStoredMute()).toBe(false)

    writeStoredMute(true)
    expect(readStoredMute()).toBe(true)

    writeStoredMute(false)
    expect(readStoredMute()).toBe(false)
  })

  it('menjalankan trigger suara dengan aman tanpa error saat AudioContext tidak ada', () => {
    expect(() => {
      unlockAudio()
      playEatSound()
      playCountdownTickSound()
      playCountdownGoSound()
      playSpeedUpSound()
      playGameOverSound()
    }).not.toThrow()
  })
})
