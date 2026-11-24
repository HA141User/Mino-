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
  endFrequency?: number
  duration: number
  startTime?: number
  type?: OscillatorType
  gain?: number
}

function playTone({
  frequency,
  endFrequency,
  duration,
  startTime = 0,
  type = 'sine',
  gain = 0.12,
}: ToneOptions): void {
  const ctx = getAudioContext()
  if (!ctx) {
    return
  }

  try {
    const osc = ctx.createOscillator()
    const gainNode = ctx.createGain()

    const triggerAt = Math.max(
      ctx.currentTime + 0.005,
      ctx.currentTime + startTime,
    )

    osc.type = type
    osc.frequency.setValueAtTime(frequency, triggerAt)
    if (endFrequency !== undefined) {
      osc.frequency.linearRampToValueAtTime(endFrequency, triggerAt + duration)
    }

    gainNode.gain.setValueAtTime(gain, triggerAt)
    gainNode.gain.linearRampToValueAtTime(0.0001, triggerAt + duration)

    osc.connect(gainNode)
    gainNode.connect(ctx.destination)

    osc.start(triggerAt)
    osc.stop(triggerAt + duration)

    osc.onended = () => {
      try {
        osc.disconnect()
        gainNode.disconnect()
      } catch {
        // Abaikan jika sudah terputus
      }
    }
  } catch {
    // Abaikan jika konteks audio gagal dijalankan
  }
}

/** Ketukan hangat saat mengisi angka */
export function playPlaceDigitSound(): void {
  playTone({
    frequency: 480,
    endFrequency: 560,
    duration: 0.055,
    type: 'triangle',
    gain: 0.13,
  })
}

/** Detak pensil ringan saat menambah/menghapus catatan */
export function playNoteToggleSound(): void {
  playTone({
    frequency: 660,
    duration: 0.032,
    type: 'sine',
    gain: 0.08,
  })
}

/** Sapuan lembut saat menghapus angka atau undo */
export function playEraseSound(): void {
  playTone({
    frequency: 360,
    endFrequency: 240,
    duration: 0.06,
    type: 'sine',
    gain: 0.1,
  })
}

/** Nada rendah lembut saat terjadi konflik / angka ganda */
export function playConflictSound(): void {
  playTone({
    frequency: 210,
    duration: 0.06,
    startTime: 0,
    type: 'triangle',
    gain: 0.14,
  })
  playTone({
    frequency: 175,
    duration: 0.09,
    startTime: 0.065,
    type: 'triangle',
    gain: 0.14,
  })
}

/** Lonceng petunjuk logika */
export function playHintSound(): void {
  playTone({
    frequency: 659.25,
    duration: 0.06,
    startTime: 0,
    type: 'sine',
    gain: 0.11,
  })
  playTone({
    frequency: 987.77,
    duration: 0.1,
    startTime: 0.055,
    type: 'sine',
    gain: 0.12,
  })
}

/** Arpeggio hangat saat papan Sudoku selesai */
export function playWinSound(): void {
  const notes = [523.25, 659.25, 783.99, 1046.5]
  notes.forEach((frequency, index) => {
    playTone({
      frequency,
      duration: index === notes.length - 1 ? 0.18 : 0.07,
      startTime: index * 0.065,
      type: 'triangle',
      gain: 0.15,
    })
  })
}
