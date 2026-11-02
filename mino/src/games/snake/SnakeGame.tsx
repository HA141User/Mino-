import { useEffect, useReducer, useRef } from 'react'
import type { CSSProperties, KeyboardEvent } from 'react'
import { Link } from 'react-router-dom'
import {
  BOARD_SIZE,
  TICK_MS,
  createInitialState,
  pauseGame,
  queueDirection,
  restartGame,
  startGame,
  step,
  togglePause,
} from './engine'
import type { Direction, Point, SnakeState } from './engine'
import './snake.css'

const BEST_SCORE_KEY = 'mino:snake:best'
const BEST_LENGTH_KEY = 'mino:snake:best-length'

type Action =
  | { type: 'start' }
  | { type: 'restart' }
  | { type: 'pause' }
  | { type: 'toggle-pause' }
  | { type: 'direction'; direction: Direction }
  | { type: 'step' }

type GameState = SnakeState & {
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
    case 'step':
      return step(state)
    default:
      return state
  }
}

function reducer(state: GameState, action: Action): GameState {
  const next = applyAction(state, action)
  const isNewRun = action.type === 'start' || action.type === 'restart'

  return {
    ...next,
    bestScore: Math.max(state.bestScore, next.score),
    bestLength: Math.max(state.bestLength, next.length),
    newLengthRecord: isNewRun
      ? false
      : state.newLengthRecord || next.length > state.bestLength,
  }
}

function createGameState(): GameState {
  const base = createInitialState()

  return {
    ...base,
    bestScore: readBestScore(),
    bestLength: Math.max(readBestLength(), base.length),
    newLengthRecord: false,
  }
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

function readBestScore(): number {
  try {
    const stored = window.localStorage.getItem(BEST_SCORE_KEY)
    const value = stored ? Number.parseInt(stored, 10) : 0
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

function writeBestScore(score: number) {
  try {
    window.localStorage.setItem(BEST_SCORE_KEY, String(score))
  } catch {
    // Penyimpanan lokal bisa diblokir; skor tetap tampil selama sesi.
  }
}

function readBestLength(): number {
  try {
    const stored = window.localStorage.getItem(BEST_LENGTH_KEY)
    const value = stored ? Number.parseInt(stored, 10) : 0
    return Number.isFinite(value) && value > 0 ? value : 0
  } catch {
    return 0
  }
}

function writeBestLength(length: number) {
  try {
    window.localStorage.setItem(BEST_LENGTH_KEY, String(length))
  } catch {
    // Penyimpanan lokal bisa diblokir; rekor tetap tampil selama sesi.
  }
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
  const boardRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (state.status !== 'running') {
      return
    }

    const timer = window.setInterval(() => dispatch({ type: 'step' }), TICK_MS)

    return () => window.clearInterval(timer)
  }, [state.status])

  useEffect(() => {
    if (state.bestScore > 0) {
      writeBestScore(state.bestScore)
    }
  }, [state.bestScore])

  useEffect(() => {
    if (state.bestLength > 0) {
      writeBestLength(state.bestLength)
    }
  }, [state.bestLength])

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
    if (state.status === 'running') {
      boardRef.current?.focus({ preventScroll: true })
    }
  }, [state.status])

  const handleKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
    if (
      event.target instanceof HTMLElement &&
      event.target.closest('button, a')
    ) {
      return
    }

    if (event.key === 'Enter') {
      event.preventDefault()
      if (state.status === 'paused') {
        dispatch({ type: 'start' })
      } else if (state.status !== 'running') {
        dispatch({ type: state.status === 'game-over' ? 'restart' : 'start' })
      }
      return
    }

    if (event.key === ' ' || event.key === 'Spacebar') {
      event.preventDefault()
      if (state.status === 'idle' || state.status === 'game-over') {
        dispatch({ type: state.status === 'game-over' ? 'restart' : 'start' })
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

    if (state.status === 'idle') {
      dispatch({ type: 'start' })
    }

    dispatch({ type: 'direction', direction })
  }

  const handlePanelAction = () => {
    dispatch({ type: state.status === 'idle' ? 'start' : 'restart' })
  }

  const handlePanelPause = () => {
    dispatch({ type: 'toggle-pause' })
  }

  const announcement =
    state.status === 'game-over'
      ? `Permainan selesai. Skor ${state.score}. Makanan ${state.score}. Panjang ${state.length}. Rekor panjang ${state.bestLength}.`
      : state.status === 'paused'
        ? 'Permainan dijeda.'
        : state.status === 'running'
          ? `Skor ${state.score}.`
          : 'Siap dimulai.'

  return (
    <div className="snake-game" onKeyDown={handleKeyDown}>
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
                {state.status === 'idle' ? (
                  <>
                    <p className="snake-overlay__eyebrow">Siap?</p>
                    <h2 className="snake-overlay__title">
                      Mulai dari satu blok.
                    </h2>
                    <p className="snake-overlay__text">
                      Tekan Enter, Spasi, atau tombol di bawah. Arahkan dengan
                      panah atau WASD.
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
                    <p className="snake-overlay__eyebrow">Selesai</p>
                    <h2 className="snake-overlay__title">
                      Skor {state.score}.
                    </h2>
                    <p className="snake-overlay__text">
                      {state.newLengthRecord
                        ? `Rekor panjang baru: ${state.length} blok! `
                        : ''}
                      Makan {state.score} makanan dengan panjang {state.length}{' '}
                      blok. Rekor panjang {state.bestLength} blok. Tekan Enter
                      untuk mencoba lagi.
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

        <aside className="snake-panel" aria-labelledby="snake-panel-title">
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
            <div>
              <dt className="snake-scores__label">Makanan</dt>
              <dd className="snake-scores__value">
                {formatScore(state.score)}
              </dd>
            </div>
          </dl>

          <dl className="snake-scores snake-scores--record">
            <div>
              <dt className="snake-scores__label">Panjang</dt>
              <dd className="snake-scores__value">{state.length}</dd>
            </div>
            <div>
              <dt className="snake-scores__label">Rekor panjang</dt>
              <dd className="snake-scores__value">{state.bestLength}</dd>
            </div>
          </dl>

          <h2 id="snake-panel-title">Cara main</h2>
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
              <span>untuk bergerak</span>
            </li>
            <li>
              <kbd>Spasi</kbd>
              <span>jeda atau lanjut</span>
            </li>
            <li>
              <kbd>Enter</kbd>
              <span>mulai atau ulang</span>
            </li>
          </ul>

          <p className="snake-hint">
            Papan tembus: keluar dari satu sisi, muncul di sisi lain. Menabrak
            badan sendiri mengakhiri permainan.
          </p>

          <div className="snake-actions">
            {state.status === 'running' || state.status === 'paused' ? (
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
              className="button button--quiet"
              onClick={handlePanelAction}
            >
              {state.status === 'idle' ? 'Mulai' : 'Mulai ulang'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  )
}
