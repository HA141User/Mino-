const SOUND_STORAGE_KEY = 'mino:sound:muted'

export function isAudioSupported(): boolean {
  return (
    typeof window !== 'undefined' &&
    Boolean(
      window.AudioContext ||
        (window as unknown as { webkitAudioContext?: typeof AudioContext })
          .webkitAudioContext,
    )
  )
}

export function readStoredMute(): boolean {
  if (typeof window === 'undefined') {
    return false
  }
  try {
    return window.localStorage.getItem(SOUND_STORAGE_KEY) === 'true'
  } catch {
    return false
  }
}

export function writeStoredMute(muted: boolean): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(SOUND_STORAGE_KEY, String(muted))
  } catch {
    // Penyimpanan lokal bisa diblokir oleh peramban
  }
}

let sharedContext: AudioContext | null = null

function getAudioContext(): AudioContext | null {
  if (!isAudioSupported()) {
    return null
  }

  if (!sharedContext) {
    const AudioCtx =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext: typeof AudioContext })
        .webkitAudioContext
    sharedContext = new AudioCtx()
  }

  if (sharedContext.state === 'suspended') {
    sharedContext.resume().catch(() => {
      // Browser autoplay policy mengharuskan interaksi pengguna
    })
  }

  return sharedContext
}

export function unlockAudio(): void {
  const ctx = getAudioContext()
  if (ctx && ctx.state === 'suspended') {
    ctx.resume().catch(() => {})
  }
}

type ToneOptions = {
  frequency: number
  duration: number
  startTime?: number
  type?: OscillatorType
  gain?: number
}

function playTone({
  frequency,
  duration,
  startTime = 0,
  type = 'sine',
  gain = 0.15,
}: ToneOptions): void {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  try {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    const triggerAt = ctx.currentTime + startTime

    osc.type = type
    osc.frequency.setValueAtTime(frequency, triggerAt)

    gainNode.gain.setValueAtTime(gain, triggerAt)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, triggerAt + duration)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(triggerAt)
    osc.stop(triggerAt + duration)
  } catch {
    // Abaikan jika konteks audio gagal dijalankan
  }
}

/**
 * Suara makan apel: 2 nada ceria naik (C5 -> G5)
 */
export function playEatSound(): void {
  playTone({
    frequency: 523.25,
    duration: 0.05,
    startTime: 0,
    type: 'triangle',
    gain: 0.16,
  })
  playTone({
    frequency: 783.99,
    duration: 0.07,
    startTime: 0.045,
    type: 'triangle',
    gain: 0.18,
  })
}

/**
 * Suara hitung mundur detak (3, 2, 1)
 */
export function playCountdownTickSound(): void {
  playTone({ frequency: 440, duration: 0.06, type: 'sine', gain: 0.14 })
}

/**
 * Suara mulai bergerak saat hitung mundur selesai
 */
export function playCountdownGoSound(): void {
  playTone({ frequency: 880, duration: 0.14, type: 'triangle', gain: 0.2 })
}

/**
 * Suara akselerasi kecepatan (naik tiap 5 makanan)
 */
export function playSpeedUpSound(): void {
  playTone({
    frequency: 587.33,
    duration: 0.05,
    startTime: 0,
    type: 'triangle',
    gain: 0.14,
  })
  playTone({
    frequency: 739.99,
    duration: 0.05,
    startTime: 0.05,
    type: 'triangle',
    gain: 0.16,
  })
  playTone({
    frequency: 880.0,
    duration: 0.09,
    startTime: 0.1,
    type: 'triangle',
    gain: 0.18,
  })
}

/**
 * Suara tabrakan / game over: pitch drop tumpul
 */
export function playGameOverSound(): void {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  try {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    const now = ctx.currentTime
    const duration = 0.22

    osc.type = 'sawtooth'
    osc.frequency.setValueAtTime(220, now)
    osc.frequency.exponentialRampToValueAtTime(60, now + duration)

    gainNode.gain.setValueAtTime(0.2, now)
    gainNode.gain.exponentialRampToValueAtTime(0.0001, now + duration)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(now)
    osc.stop(now + duration)
  } catch {
    // Abaikan jika konteks audio gagal dijalankan
  }
}

