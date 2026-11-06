import { useEffect, useReducer, useRef, useState } from 'react'
import type { CSSProperties } from 'react'
import { Link } from 'react-router-dom'
import { Volume2, VolumeX } from 'lucide-react'
import {
  BOARD_SIZE,
  COUNTDOWN_STEP_MS,
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  SPEED_MAX_LEVEL,
  SPEED_STEP_FOODS,
  createInitialState,
  getDifficulty,
  getSpeedLevel,
  getTickMs,
  isDifficulty,
  pauseGame,
  queueDirection,
  restartGame,
  startGame,
  step,
  tickCountdown,
  togglePause,
} from './engine'
import type { Difficulty, Direction, Point, SnakeState } from './engine'
import {
  playCountdownGoSound,
  playCountdownTickSound,
  playEatSound,
  playGameOverSound,
  playSpeedUpSound,
  readStoredMute,
  unlockAudio,
  writeStoredMute,
} from './sound'
import './snake.css'

const DIFFICULTY_KEY = 'mino:snake:difficulty'
const LEGACY_BEST_SCORE_KEY = 'mino:snake:best'
const LEGACY_BEST_LENGTH_KEY = 'mino:snake:best-length'

function bestScoreKey(difficulty: Difficulty): string {
  return `mino:snake:${difficulty}:best`
}

function bestLengthKey(difficulty: Difficulty): string {
  return `mino:snake:${difficulty}:best-length`
}

function readStoredNumber(key: string, fallbackKey?: string): number {
  try {
    const stored =
      window.localStorage.getItem(key) ??
      (fallbackKey ? window.localStorage.getItem(fallbackKey) : null)
    const value = stored ? Number.parseInt(stored, 10) : 0
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

function writeStoredNumber(key: string, value: number) {
  try {
    window.localStorage.setItem(key, String(value))
  } catch {
    // Penyimpanan lokal bisa diblokir; rekor tetap tampil selama sesi.
  }
}

function readBestScore(difficulty: Difficulty): number {
  return readStoredNumber(
    bestScoreKey(difficulty),
    difficulty === DEFAULT_DIFFICULTY ? LEGACY_BEST_SCORE_KEY : undefined,
  )
}

function readBestLength(difficulty: Difficulty): number {
  return readStoredNumber(
    bestLengthKey(difficulty),
    difficulty === DEFAULT_DIFFICULTY ? LEGACY_BEST_LENGTH_KEY : undefined,
  )
}

function readDifficulty(): Difficulty {
  try {
    const stored = window.localStorage.getItem(DIFFICULTY_KEY)
    return isDifficulty(stored) ? stored : DEFAULT_DIFFICULTY
  } catch {
    return DEFAULT_DIFFICULTY
  }
}

type Action =
  | { type: 'start' }
  | { type: 'restart' }
  | { type: 'pause' }
  | { type: 'toggle-pause' }
  | { type: 'direction'; direction: Direction }
  | { type: 'countdown' }
  | { type: 'step' }
  | { type: 'set-difficulty'; difficulty: Difficulty }

type GameState = SnakeState & {
  difficulty: Difficulty
  bestScore: number
  bestLength: number
  newLengthRecord: boolean
}

function applyAction(state: GameState, action: Action): SnakeState {
  switch (action.type) {
    case 'start':
      return startGame(state)
    case 'restart':
      return restartGame()
    case 'pause':
      return pauseGame(state)
    case 'toggle-pause':
      return togglePause(state)
    case 'direction':
      return queueDirection(state, action.direction)
    case 'countdown':
      return tickCountdown(state)
    case 'step':
      return step(state)
    default:
      return state
  }
}

function withRecords(base: SnakeState, difficulty: Difficulty): GameState {
  return {
    ...base,
    difficulty,
    bestScore: readBestScore(difficulty),
    bestLength: Math.max(readBestLength(difficulty), base.length),
    newLengthRecord: false,
  }
}

function reducer(state: GameState, action: Action): GameState {
  if (action.type === 'set-difficulty') {
    const locked =
      state.status === 'running' ||
      state.status === 'paused' ||
      state.status === 'countdown'

    if (action.difficulty === state.difficulty || locked) {
      return state
    }

    return withRecords(createInitialState(), action.difficulty)
  }

  const next = applyAction(state, action)
  const isNewRun = action.type === 'start' || action.type === 'restart'

  return {
    ...next,
    difficulty: state.difficulty,
    bestScore: Math.max(state.bestScore, next.score),
    bestLength: Math.max(state.bestLength, next.length),
    newLengthRecord: isNewRun
      ? false
      : state.newLengthRecord || next.length > state.bestLength,
  }
}

function createGameState(): GameState {
  return withRecords(createInitialState(), readDifficulty())
}

const KEY_DIRECTIONS: Record<string, Direction> = {
  arrowup: 'up',
  arrowdown: 'down',
  arrowleft: 'left',
  arrowright: 'right',
  w: 'up',
  a: 'left',
  s: 'down',
  d: 'right',
}

function formatScore(score: number): string {
  return score.toString().padStart(2, '0')
}

const cellSize = 100 / BOARD_SIZE

function cellStyle(point: Point): CSSProperties {
  return {
    left: `${point.x * cellSize}%`,
    top: `${point.y * cellSize}%`,
    width: `${cellSize}%`,
    height: `${cellSize}%`,
  }
}

const boardStyle = { '--board-size': BOARD_SIZE } as CSSProperties

export function SnakeGame() {
  const [state, dispatch] = useReducer(reducer, undefined, createGameState)
  const [muted, setMuted] = useState(readStoredMute)
  const boardRef = useRef<HTMLDivElement>(null)
  const prevScoreRef = useRef(state.score)
  const prevStatusRef = useRef(state.status)
  const prevCountdownRef = useRef(state.countdown)

  const toggleMute = () => {
    unlockAudio()
    setMuted((prev) => {
      const next = !prev
      writeStoredMute(next)
      return next
    })
  }

  useEffect(() => {
    if (state.status === 'running' && state.score > prevScoreRef.current) {
      if (!muted) {
        const oldSpeed = getSpeedLevel(state.difficulty, prevScoreRef.current)
        const newSpeed = getSpeedLevel(state.difficulty, state.score)
        if (newSpeed > oldSpeed) {
          playSpeedUpSound()
        } else {
          playEatSound()
        }
      }
    }
    prevScoreRef.current = state.score
  }, [state.score, state.status, state.difficulty, muted])

  useEffect(() => {
    if (state.status === 'countdown') {
      if (
        state.countdown > 0 &&
        state.countdown !== prevCountdownRef.current
      ) {
        if (!muted) {
          playCountdownTickSound()
        }
      }
    } else if (
      prevStatusRef.current === 'countdown' &&
      state.status === 'running'
    ) {
      if (!muted) {
        playCountdownGoSound()
      }
    }
    prevCountdownRef.current = state.countdown
  }, [state.countdown, state.status, muted])

  useEffect(() => {
    if (
      state.status === 'game-over' &&
      prevStatusRef.current !== 'game-over'
    ) {
      if (!muted) {
        playGameOverSound()
      }
    }
    prevStatusRef.current = state.status
  }, [state.status, muted])

  useEffect(() => {
    if (state.status === 'countdown') {
      const timer = window.setInterval(
        () => dispatch({ type: 'countdown' }),
        COUNTDOWN_STEP_MS,
      )

      return () => window.clearInterval(timer)
    }

    if (state.status !== 'running') {
      return
    }

    const timer = window.setInterval(
      () => dispatch({ type: 'step' }),
      getTickMs(state.difficulty, state.score),
    )

    return () => window.clearInterval(timer)
  }, [state.status, state.difficulty, state.score])

  useEffect(() => {
    if (state.bestScore > 0) {
      writeStoredNumber(bestScoreKey(state.difficulty), state.bestScore)
    }
  }, [state.bestScore, state.difficulty])

  useEffect(() => {
    if (state.bestLength > 0) {
      writeStoredNumber(bestLengthKey(state.difficulty), state.bestLength)
    }
  }, [state.bestLength, state.difficulty])

  useEffect(() => {
    try {
      window.localStorage.setItem(DIFFICULTY_KEY, state.difficulty)
    } catch {
      // Pilihan mode tetap berlaku selama sesi.
    }
  }, [state.difficulty])

  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        dispatch({ type: 'pause' })
      }
    }

    const handleBlur = () => dispatch({ type: 'pause' })

    document.addEventListener('visibilitychange', handleVisibility)
    window.addEventListener('blur', handleBlur)

    return () => {
      document.removeEventListener('visibilitychange', handleVisibility)
      window.removeEventListener('blur', handleBlur)
    }
  }, [])

  useEffect(() => {
    const handleKeyDown = (event: globalThis.KeyboardEvent) => {
      if (event.defaultPrevented || event.repeat) {
        return
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      if (event.target instanceof HTMLElement) {
        if (
          event.target.closest(
            'input, textarea, select, [contenteditable="true"]',
          )
        ) {
          return
        }

        const interactive = event.target.closest(
          'a, button, [role="button"], summary',
        )

        if (interactive) {
          if (!event.target.closest('.snake-game')) {
            return
          }

          if (event.key === 'Enter' || event.key === ' ') {
            return
          }
        }
      }

      if (event.key === 'Enter') {
        event.preventDefault()
        unlockAudio()

        if (state.status === 'paused') {
          dispatch({ type: 'start' })
        } else if (state.status !== 'running') {
          dispatch({
            type: state.status === 'game-over' ? 'restart' : 'start',
          })
        }

        return
      }

      if (event.key === ' ' || event.key === 'Spacebar') {
        event.preventDefault()
        unlockAudio()

        if (state.status === 'idle' || state.status === 'game-over') {
          dispatch({
            type: state.status === 'game-over' ? 'restart' : 'start',
          })
        } else {
          dispatch({ type: 'toggle-pause' })
        }

        return
      }

      const direction = KEY_DIRECTIONS[event.key.toLowerCase()]

      if (!direction) {
        return
      }

      event.preventDefault()
      unlockAudio()

      if (state.status === 'idle') {
        if (direction === 'left') {
          return
        }
        dispatch({ type: 'start' })
      }

      dispatch({ type: 'direction', direction })
    }

    window.addEventListener('keydown', handleKeyDown)

    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [state.status])

  useEffect(() => {
    if (state.status === 'running') {
      boardRef.current?.focus({ preventScroll: true })
    }
  }, [state.status])

  const handlePanelAction = () => {
    unlockAudio()
    dispatch({ type: state.status === 'idle' ? 'start' : 'restart' })
  }

  const handlePanelPause = () => {
    unlockAudio()
    dispatch({ type: 'toggle-pause' })
  }

  const mode = getDifficulty(state.difficulty)
  const speedLevel = getSpeedLevel(state.difficulty, state.score)
  const canPause =
    state.status === 'countdown' ||
    state.status === 'running' ||
    state.status === 'paused'
  const modeLocked = canPause

  const announcement =
    state.status === 'game-over'
      ? `Permainan selesai. Skor ${state.score}. Panjang ${state.length}. Rekor panjang ${state.bestLength}. Mode ${mode.label}.`
      : state.status === 'paused'
        ? 'Permainan dijeda.'
        : state.status === 'countdown'
          ? `Bersiap. Mode ${mode.label}. Permainan segera dimulai.`
          : state.status === 'running'
            ? `Skor ${state.score}.`
            : 'Siap dimulai.'

  return (
    <div className="snake-game">
      <div className="snake-stage">
        <div className="snake-board-wrap">
          <div
            ref={boardRef}
            className="snake-board"
            style={boardStyle}
            tabIndex={0}
            role="group"
            aria-label="Papan Snake"
            aria-describedby="snake-instructions"
          >
            <div className="snake-board__grid" aria-hidden="true" />

            {state.snake.map((segment, index) => (
              <div
                key={`${segment.x}-${segment.y}-${index}`}
                className={
                  index === 0
                    ? 'snake-segment snake-segment--head'
                    : 'snake-segment'
                }
                style={cellStyle(segment)}
              />
            ))}

            <div
              className="snake-food"
              style={cellStyle(state.food)}
              aria-hidden="true"
            />

            {state.status !== 'running' ? (
              <div className="snake-overlay">
                {state.status === 'countdown' ? (
                  <>
                    <p className="snake-overlay__eyebrow">
                      Bersiap · {mode.label}
                    </p>
                    <p
                      key={state.countdown}
                      className="snake-countdown"
                      aria-hidden="true"
                    >
                      {state.countdown}
                    </p>
                    <p className="snake-overlay__text">
                      Ular mulai bergerak dalam {state.countdown} detik. Tekan
                      panah atau WASD untuk memilih arah awal.
                    </p>
                    <div className="snake-overlay__actions">
                      <button
                        type="button"
                        className="button button--quiet"
                        onClick={handlePanelPause}
                      >
                        Jeda
                      </button>
                    </div>
                  </>
                ) : null}

                {state.status === 'idle' ? (
                  <>
                    <p className="snake-overlay__eyebrow">Siap?</p>
                    <h2 className="snake-overlay__title">
                      Mulai dari satu blok.
                    </h2>
                    <p className="snake-overlay__text">
                      Mode {mode.label}. Tekan Enter, Spasi, atau tombol di
                      bawah. Arahkan dengan panah atau WASD.
                    </p>
                    <div className="snake-overlay__actions">
                      <button
                        type="button"
                        className="button"
                        onClick={() => dispatch({ type: 'start' })}
                      >
                        Mulai
                      </button>
                    </div>
                  </>
                ) : null}

                {state.status === 'paused' ? (
                  <>
                    <p className="snake-overlay__eyebrow">Jeda</p>
                    <h2 className="snake-overlay__title">
                      Istirahat sebentar.
                    </h2>
                    <p className="snake-overlay__text">
                      Tekan Spasi atau tombol di bawah untuk melanjutkan.
                    </p>
                    <div className="snake-overlay__actions">
                      <button
                        type="button"
                        className="button"
                        onClick={() => dispatch({ type: 'start' })}
                      >
                        Lanjutkan
                      </button>
                    </div>
                  </>
                ) : null}

                {state.status === 'game-over' ? (
                  <>
                    <p className="snake-overlay__eyebrow">
                      Selesai · {mode.label}
                    </p>
                    <h2 className="snake-overlay__title">
                      Skor {state.score}.
                    </h2>
                    <p className="snake-overlay__text">
                      {state.newLengthRecord
                        ? `Rekor panjang baru: ${state.length} blok! `
                        : ''}
                      Panjang akhir {state.length} blok. Rekor panjang{' '}
                      {state.bestLength} blok. Tekan Enter untuk mencoba lagi.
                    </p>
                    <div className="snake-overlay__actions">
                      <button
                        type="button"
                        className="button"
                        onClick={() => dispatch({ type: 'restart' })}
                      >
                        Main lagi
                      </button>
                      <Link to="/games" className="button button--quiet">
                        Menu utama
                      </Link>
                    </div>
                  </>
                ) : null}
              </div>
            ) : null}
          </div>

          <p className="visually-hidden" aria-live="polite">
            {announcement}
          </p>
        </div>

        <aside
          className="snake-panel"
          aria-label="Status dan kontrol permainan"
        >
          <div className="snake-modes">
            <div className="snake-modes__header">
              <div className="snake-modes__title-wrap">
                <h2 id="snake-modes-title">Mode</h2>
                <span className="snake-modes__hint">
                  {modeLocked
                    ? 'Terkunci saat main'
                    : mode.description}
                </span>
              </div>
              <button
                type="button"
                className={
                  muted
                    ? 'snake-sound-toggle is-muted'
                    : 'snake-sound-toggle'
                }
                aria-label={muted ? 'Aktifkan suara' : 'Bisukan suara'}
                title={muted ? 'Aktifkan suara' : 'Bisukan suara'}
                onClick={toggleMute}
              >
                {muted ? (
                  <VolumeX size={14} aria-hidden="true" />
                ) : (
                  <Volume2 size={14} aria-hidden="true" />
                )}
                <span>{muted ? 'Bisu' : 'Suara'}</span>
              </button>
            </div>
            <div
              className="snake-modes__options"
              role="group"
              aria-labelledby="snake-modes-title"
            >
              {DIFFICULTIES.map((difficulty) => {
                const active = difficulty.id === state.difficulty

                return (
                  <button
                    key={difficulty.id}
                    type="button"
                    className={
                      active ? 'snake-mode is-active' : 'snake-mode'
                    }
                    aria-pressed={active}
                    disabled={modeLocked}
                    onClick={() =>
                      dispatch({
                        type: 'set-difficulty',
                        difficulty: difficulty.id,
                      })
                    }
                  >
                    {difficulty.label}
                  </button>
                )
              })}
            </div>
          </div>

          <div className="snake-scores-group">
            <dl className="snake-scores">
              <div>
                <dt className="snake-scores__label">Skor</dt>
                <dd className="snake-scores__value">
                  {formatScore(state.score)}
                </dd>
              </div>
              <div>
                <dt className="snake-scores__label">Terbaik</dt>
                <dd className="snake-scores__value">
                  {formatScore(state.bestScore)}
                </dd>
              </div>
            </dl>

            <div className="snake-substats">
              <div className="snake-substat">
                <span className="snake-substat__label">Panjang</span>
                <span className="snake-substat__value">{state.length}</span>
              </div>
              <span className="snake-substat__divider" aria-hidden="true">
                ·
              </span>
              <div className="snake-substat">
                <span className="snake-substat__label">Rekor</span>
                <span className="snake-substat__value">{state.bestLength}</span>
              </div>
            </div>
          </div>

          <div className="snake-speed">
            <div className="snake-speed__header">
              <span className="snake-scores__label">Kecepatan</span>
              <span className="snake-speed__level">
                Tingkat {speedLevel}/{SPEED_MAX_LEVEL}
              </span>
            </div>
            <div
              className="snake-speed__meter"
              role="meter"
              aria-label="Tingkat kecepatan"
              aria-valuemin={1}
              aria-valuemax={SPEED_MAX_LEVEL}
              aria-valuenow={speedLevel}
              aria-valuetext={`Tingkat ${speedLevel} dari ${SPEED_MAX_LEVEL}`}
              style={{ '--speed-levels': SPEED_MAX_LEVEL } as CSSProperties}
            >
              {Array.from({ length: SPEED_MAX_LEVEL }, (_, index) => (
                <span
                  key={index}
                  className={
                    index < speedLevel
                      ? 'snake-speed__cell is-on'
                      : 'snake-speed__cell'
                  }
                />
              ))}
            </div>
            <p className="snake-speed__hint">
              Naik tiap {SPEED_STEP_FOODS} makanan.
            </p>
          </div>

          <div className="snake-actions">
            {canPause ? (
              <button
                type="button"
                className="button button--quiet"
                onClick={handlePanelPause}
              >
                {state.status === 'paused' ? 'Lanjutkan' : 'Jeda'}
              </button>
            ) : null}
            <button
              type="button"
              className={
                state.status === 'idle'
                  ? 'button'
                  : 'button button--quiet'
              }
              onClick={handlePanelAction}
            >
              {state.status === 'idle' ? 'Mulai' : 'Mulai ulang'}
            </button>
          </div>
        </aside>
      </div>

      <section className="snake-guide" aria-labelledby="snake-guide-title">
        <div className="snake-guide__card">
          <div className="snake-guide__header">
            <h2 id="snake-guide-title" className="snake-guide__title">
              Cara main
            </h2>
            <span className="snake-guide__badge">Kontrol keyboard</span>
          </div>

          <ul className="snake-controls" id="snake-instructions">
            <li>
              <span className="snake-keys">
                <kbd>↑</kbd>
                <kbd>↓</kbd>
                <kbd>←</kbd>
                <kbd>→</kbd>
              </span>
              <span>atau</span>
              <span className="snake-keys">
                <kbd>W</kbd>
                <kbd>A</kbd>
                <kbd>S</kbd>
                <kbd>D</kbd>
              </span>
              <span className="snake-controls__desc">untuk bergerak</span>
            </li>
            <li>
              <kbd>Spasi</kbd>
              <span className="snake-controls__desc">jeda atau lanjut</span>
            </li>
            <li>
              <kbd>Enter</kbd>
              <span className="snake-controls__desc">mulai atau ulang</span>
            </li>
          </ul>
        </div>

        <div className="snake-guide__card">
          <div className="snake-guide__header">
            <h2 className="snake-guide__title">Mekanik papan</h2>
            <span className="snake-guide__badge">Aturan permainan</span>
          </div>

          <p className="snake-hint">
            <strong>Papan tembus:</strong> keluar dari satu sisi dinding, ular
            akan muncul di sisi yang berlawanan. Permainan berakhir jika kepala
            ular menabrak tubuh sendiri.
          </p>
          <p className="snake-hint snake-hint--subtle">
            Rekor skor dan panjang disimpan otomatis di peramban untuk mode{' '}
            {mode.label.toLowerCase()}.
          </p>
        </div>
      </section>
    </div>
  )
}
