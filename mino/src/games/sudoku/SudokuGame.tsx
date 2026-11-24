import { useCallback, useEffect, useMemo, useReducer, useRef, useState } from 'react'
import { Link } from 'react-router-dom'
import {
  Eraser,
  Lightbulb,
  Pause,
  Pencil,
  Play,
  RotateCcw,
  RefreshCw,
  Undo2,
  Volume2,
  VolumeX,
  X,
} from 'lucide-react'
import {
  CELL_COUNT,
  DEFAULT_DIFFICULTY,
  DIFFICULTIES,
  clearHint,
  createSudokuState,
  eraseCell,
  formatTime,
  getConflicts,
  getCoords,
  getDifficultyMeta,
  getDigitCounts,
  inputDigit,
  isDifficulty,
  isPeer,
  moveSelection,
  pauseGame,
  requestHint,
  resetCurrentBoard,
  selectCell,
  tickTimer,
  toggleNoteMode,
  togglePause,
  undoMove,
} from './engine'
import type { MoveDirection, SudokuDifficulty, SudokuState } from './engine'
import {
  playConflictSound,
  playEraseSound,
  playHintSound,
  playNoteToggleSound,
  playPlaceDigitSound,
  playWinSound,
  readStoredMute,
  unlockAudio,
  writeStoredMute,
} from './sound'
import './sudoku.css'

const DIFFICULTY_STORAGE_KEY = 'mino:sudoku:difficulty'

function bestTimeKey(difficulty: SudokuDifficulty): string {
  return `mino:sudoku:${difficulty}:best-time`
}

function readStoredDifficulty(): SudokuDifficulty {
  if (typeof window === 'undefined') {
    return DEFAULT_DIFFICULTY
  }
  try {
    const stored = window.localStorage.getItem(DIFFICULTY_STORAGE_KEY)
    return isDifficulty(stored) ? stored : DEFAULT_DIFFICULTY
  } catch {
    return DEFAULT_DIFFICULTY
  }
}

function readBestTime(difficulty: SudokuDifficulty): number | null {
  if (typeof window === 'undefined') {
    return null
  }
  try {
    const stored = window.localStorage.getItem(bestTimeKey(difficulty))
    if (!stored) {
      return null
    }
    const parsed = Number.parseInt(stored, 10)
    return Number.isFinite(parsed) && parsed > 0 ? parsed : null
  } catch {
    return null
  }
}

function writeBestTime(difficulty: SudokuDifficulty, seconds: number): void {
  if (typeof window === 'undefined') {
    return
  }
  try {
    window.localStorage.setItem(bestTimeKey(difficulty), String(seconds))
  } catch {
    // Penyimpanan lokal bisa diblokir oleh peramban
  }
}

type Action =
  | { type: 'select'; index: number }
  | { type: 'move'; direction: MoveDirection }
  | { type: 'input'; digit: number }
  | { type: 'erase' }
  | { type: 'undo' }
  | { type: 'toggle-note' }
  | { type: 'hint' }
  | { type: 'clear-hint' }
  | { type: 'toggle-pause' }
  | { type: 'pause' }
  | { type: 'tick' }
  | { type: 'reset-board' }
  | { type: 'new-game'; difficulty?: SudokuDifficulty }

type GameState = SudokuState & {
  bestTime: number | null
  isNewRecord: boolean
}

function createInitialGameState(difficulty: SudokuDifficulty): GameState {
  return {
    ...createSudokuState(difficulty),
    bestTime: readBestTime(difficulty),
    isNewRecord: false,
  }
}

function reducer(state: GameState, action: Action): GameState {
  switch (action.type) {
    case 'select':
      return { ...state, ...selectCell(state, action.index) }
    case 'move':
      return { ...state, ...moveSelection(state, action.direction) }
    case 'input': {
      const next = inputDigit(state, action.digit)
      if (next.status === 'won' && state.status !== 'won') {
        const beatRecord =
          state.bestTime === null || next.elapsedSeconds < state.bestTime
        const nextBest = beatRecord ? next.elapsedSeconds : state.bestTime
        return {
          ...next,
          bestTime: nextBest,
          isNewRecord: beatRecord,
        }
      }
      return {
        ...next,
        bestTime: state.bestTime,
        isNewRecord: state.isNewRecord,
      }
    }
    case 'erase':
      return { ...state, ...eraseCell(state) }
    case 'undo':
      return { ...state, ...undoMove(state) }
    case 'toggle-note':
      return { ...state, ...toggleNoteMode(state) }
    case 'hint':
      return { ...state, ...requestHint(state) }
    case 'clear-hint':
      return { ...state, ...clearHint(state) }
    case 'toggle-pause':
      return { ...state, ...togglePause(state) }
    case 'pause':
      return { ...state, ...pauseGame(state) }
    case 'tick':
      return { ...state, ...tickTimer(state) }
    case 'reset-board':
      return {
        ...resetCurrentBoard(state),
        bestTime: state.bestTime,
        isNewRecord: false,
      }
    case 'new-game': {
      const targetDifficulty = action.difficulty ?? state.difficulty
      return createInitialGameState(targetDifficulty)
    }
    default:
      return state
  }
}

const DIGITS = [1, 2, 3, 4, 5, 6, 7, 8, 9] as const

export function SudokuGame() {
  const [state, dispatch] = useReducer(
    reducer,
    undefined,
    () => createInitialGameState(readStoredDifficulty()),
  )
  const [muted, setMuted] = useState<boolean>(() => readStoredMute())
  const [announcement, setAnnouncement] = useState('')
  const mutedRef = useRef(muted)
  const prevStatusRef = useRef(state.status)

  useEffect(() => {
    mutedRef.current = muted
  }, [muted])

  // Simpan pilihan kesulitan
  useEffect(() => {
    try {
      window.localStorage.setItem(DIFFICULTY_STORAGE_KEY, state.difficulty)
    } catch {
      // Abaikan jika localStorage diblokir
    }
  }, [state.difficulty])

  // Simpan rekor waktu terbaik saat menang
  useEffect(() => {
    if (state.status === 'won' && state.isNewRecord && state.bestTime !== null) {
      writeBestTime(state.difficulty, state.bestTime)
    }
  }, [state.status, state.isNewRecord, state.bestTime, state.difficulty])

  // Efek suara & pengumuman status saat menang atau jeda
  useEffect(() => {
    const prev = prevStatusRef.current
    prevStatusRef.current = state.status

    if (prev !== 'won' && state.status === 'won') {
      if (!mutedRef.current) {
        playWinSound()
      }
      setAnnouncement(
        `Selamat! Papan Sudoku ${getDifficultyMeta(state.difficulty).label} selesai dalam ${formatTime(state.elapsedSeconds)}.`,
      )
    } else if (prev === 'playing' && state.status === 'paused') {
      setAnnouncement('Permainan dijeda.')
    } else if (prev === 'paused' && state.status === 'playing') {
      setAnnouncement('Permainan dilanjutkan.')
    }
  }, [state.status, state.difficulty, state.elapsedSeconds])

  // Timer 1 detik saat bermain
  useEffect(() => {
    if (state.status !== 'playing') {
      return undefined
    }
    const interval = window.setInterval(() => {
      dispatch({ type: 'tick' })
    }, 1000)
    return () => window.clearInterval(interval)
  }, [state.status])

  // Auto-pause saat tab browser disembunyikan
  useEffect(() => {
    const handleVisibility = () => {
      if (document.hidden) {
        dispatch({ type: 'pause' })
      }
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () =>
      document.removeEventListener('visibilitychange', handleVisibility)
  }, [])

  const conflicts = useMemo(() => getConflicts(state.values), [state.values])
  const digitCounts = useMemo(
    () => getDigitCounts(state.values),
    [state.values],
  )
  const filledCount = useMemo(
    () => state.values.filter((val) => val !== 0).length,
    [state.values],
  )

  const selectedValue =
    state.selectedCell !== null ? state.values[state.selectedCell] : 0
  const hintRelatedSet = useMemo(
    () => new Set(state.activeHint?.relatedCells ?? []),
    [state.activeHint],
  )

  const handleDigitInput = useCallback(
    (digit: number) => {
      unlockAudio()
      if (state.status !== 'playing' || state.selectedCell === null) {
        return
      }
      const idx = state.selectedCell
      if (state.puzzle[idx] !== 0) {
        return
      }

      if (state.noteMode) {
        if (state.values[idx] === 0 && !mutedRef.current) {
          playNoteToggleSound()
        }
        dispatch({ type: 'input', digit })
        return
      }

      if (state.values[idx] === digit) {
        return
      }

      const previewValues = [...state.values]
      previewValues[idx] = digit
      const nextConflicts = getConflicts(previewValues)
      const hasConflict = nextConflicts.has(idx)

      if (!mutedRef.current) {
        if (hasConflict) {
          playConflictSound()
        } else {
          playPlaceDigitSound()
        }
      }

      dispatch({ type: 'input', digit })
    },
    [state.status, state.selectedCell, state.puzzle, state.noteMode, state.values],
  )

  const handleErase = useCallback(() => {
    unlockAudio()
    if (state.status !== 'playing' || state.selectedCell === null) {
      return
    }
    const idx = state.selectedCell
    if (
      state.puzzle[idx] === 0 &&
      (state.values[idx] !== 0 || state.notes[idx].length > 0)
    ) {
      if (!mutedRef.current) {
        playEraseSound()
      }
      dispatch({ type: 'erase' })
    }
  }, [state.status, state.selectedCell, state.puzzle, state.values, state.notes])

  const handleUndo = useCallback(() => {
    unlockAudio()
    if (state.status !== 'playing' || state.history.length === 0) {
      return
    }
    if (!mutedRef.current) {
      playEraseSound()
    }
    dispatch({ type: 'undo' })
  }, [state.status, state.history.length])

  const handleHint = useCallback(() => {
    unlockAudio()
    if (state.status !== 'playing') {
      return
    }
    if (!mutedRef.current) {
      playHintSound()
    }
    dispatch({ type: 'hint' })
  }, [state.status])

  const handleToggleNote = useCallback(() => {
    unlockAudio()
    if (state.status !== 'playing') {
      return
    }
    if (!mutedRef.current) {
      playNoteToggleSound()
    }
    dispatch({ type: 'toggle-note' })
  }, [state.status])

  const handleToggleMute = useCallback(() => {
    unlockAudio()
    setMuted((prev) => {
      const next = !prev
      writeStoredMute(next)
      return next
    })
  }, [])

  // Kontrol keyboard global
  useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLElement | null
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.tagName === 'SELECT' ||
          target.isContentEditable)
      ) {
        return
      }

      // Ctrl+Z / Cmd+Z untuk Undo
      if (
        (event.ctrlKey || event.metaKey) &&
        !event.altKey &&
        event.key.toLowerCase() === 'z'
      ) {
        event.preventDefault()
        handleUndo()
        return
      }

      if (event.ctrlKey || event.metaKey || event.altKey) {
        return
      }

      const key = event.key
      const lower = key.toLowerCase()

      if (key === 'ArrowUp' || lower === 'w') {
        event.preventDefault()
        dispatch({ type: 'move', direction: 'up' })
        return
      }
      if (key === 'ArrowDown' || lower === 's') {
        event.preventDefault()
        dispatch({ type: 'move', direction: 'down' })
        return
      }
      if (key === 'ArrowLeft' || lower === 'a') {
        event.preventDefault()
        dispatch({ type: 'move', direction: 'left' })
        return
      }
      if (key === 'ArrowRight' || lower === 'd') {
        event.preventDefault()
        dispatch({ type: 'move', direction: 'right' })
        return
      }

      if (key >= '1' && key <= '9') {
        event.preventDefault()
        handleDigitInput(Number.parseInt(key, 10))
        return
      }

      if (key === 'Backspace' || key === 'Delete' || key === '0') {
        event.preventDefault()
        handleErase()
        return
      }

      if (lower === 'n') {
        event.preventDefault()
        handleToggleNote()
        return
      }

      if (lower === 'z') {
        event.preventDefault()
        handleUndo()
        return
      }

      if (lower === 'h') {
        event.preventDefault()
        handleHint()
        return
      }

      if (key === ' ' || lower === 'p') {
        // Jangan bajak Spasi saat fokus sedang berada di tombol atau tautan
        if (
          key === ' ' &&
          target &&
          (target.tagName === 'BUTTON' || target.tagName === 'A')
        ) {
          return
        }
        event.preventDefault()
        unlockAudio()
        dispatch({ type: 'toggle-pause' })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [handleDigitInput, handleErase, handleHint, handleToggleNote, handleUndo])

  const difficultyMeta = getDifficultyMeta(state.difficulty)
  const isPaused = state.status === 'paused'
  const isWon = state.status === 'won'
  const canEditSelected =
    state.status === 'playing' &&
    state.selectedCell !== null &&
    state.puzzle[state.selectedCell] === 0

  return (
    <div className="sudoku-game">
      <p className="visually-hidden" aria-live="polite" aria-atomic="true">
        {announcement}
      </p>

      {/* Mobile Compact HUD */}
      <div className="sudoku-mobile-hud" aria-label="Ringkasan status Sudoku">
        <div className="sudoku-mobile-hud__item">
          <span className="sudoku-mobile-hud__label">Mode</span>
          <span className="sudoku-mobile-hud__value">{difficultyMeta.label}</span>
        </div>
        <div className="sudoku-mobile-hud__item">
          <span className="sudoku-mobile-hud__label">Waktu</span>
          <span className="sudoku-mobile-hud__value sudoku-mono">
            {formatTime(state.elapsedSeconds)}
          </span>
        </div>
        <div className="sudoku-mobile-hud__item">
          <span className="sudoku-mobile-hud__label">Terisi</span>
          <span className="sudoku-mobile-hud__value sudoku-mono">
            {filledCount}/{CELL_COUNT}
          </span>
        </div>
        <button
          type="button"
          className="sudoku-icon-btn"
          onClick={handleToggleMute}
          aria-label={muted ? 'Nyalakan suara' : 'Bisukan suara'}
          aria-pressed={muted}
        >
          {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
        </button>
      </div>

      <div className="sudoku-stage">
        {/* Area Papan Utama */}
        <div className="sudoku-board-col">
          <div
            className={`sudoku-board-frame${isWon ? ' sudoku-board-frame--won' : ''}`}
          >
            <div
              className="sudoku-board"
              role="grid"
              aria-label={`Papan Sudoku 9 kali 9, mode ${difficultyMeta.label}`}
              aria-describedby="sudoku-instructions"
            >
              {Array.from({ length: CELL_COUNT }, (_, idx) => {
                const { row, col } = getCoords(idx)
                const value = state.values[idx]
                const isGiven = state.puzzle[idx] !== 0
                const cellNotes = state.notes[idx]
                const isSelected = state.selectedCell === idx
                const isPeerCell =
                  state.selectedCell !== null &&
                  !isSelected &&
                  isPeer(state.selectedCell, idx)
                const isSameDigit =
                  selectedValue !== 0 &&
                  value === selectedValue &&
                  !isSelected
                const isConflict = conflicts.has(idx)
                const isHintTarget = state.activeHint?.cellIndex === idx
                const isHintRelated = hintRelatedSet.has(idx)

                const classNames = ['sudoku-cell']
                if (isGiven) classNames.push('sudoku-cell--given')
                if (isSelected) classNames.push('sudoku-cell--selected')
                if (isPeerCell) classNames.push('sudoku-cell--peer')
                if (isSameDigit) classNames.push('sudoku-cell--same')
                if (isConflict) classNames.push('sudoku-cell--conflict')
                if (isHintTarget) classNames.push('sudoku-cell--hint-target')
                if (isHintRelated) classNames.push('sudoku-cell--hint-related')
                if (col === 2 || col === 5)
                  classNames.push('sudoku-cell--box-right')
                if (row === 2 || row === 5)
                  classNames.push('sudoku-cell--box-bottom')

                const cellStatusParts = [`Baris ${row + 1}, Kolom ${col + 1}`]
                if (isPaused) {
                  cellStatusParts.push('disembunyikan saat jeda')
                } else if (value !== 0) {
                  cellStatusParts.push(
                    isGiven ? `angka bawaan ${value}` : `terisi ${value}`,
                  )
                  if (isConflict) {
                    cellStatusParts.push('konflik ganda')
                  }
                } else if (cellNotes.length > 0) {
                  cellStatusParts.push(`catatan ${cellNotes.join(', ')}`)
                } else {
                  cellStatusParts.push('kosong')
                }

                return (
                  <button
                    key={idx}
                    type="button"
                    role="gridcell"
                    className={classNames.join(' ')}
                    aria-label={cellStatusParts.join(', ')}
                    aria-selected={isSelected}
                    aria-invalid={isConflict || undefined}
                    disabled={isPaused}
                    onClick={() => {
                      unlockAudio()
                      dispatch({ type: 'select', index: idx })
                    }}
                  >
                    {!isPaused && value !== 0 ? (
                      <span className="sudoku-cell__value">{value}</span>
                    ) : null}

                    {!isPaused && value === 0 && cellNotes.length > 0 ? (
                      <span className="sudoku-cell__notes" aria-hidden="true">
                        {DIGITS.map((d) => {
                          const hasNote = cellNotes.includes(d)
                          const matchesSelected =
                            hasNote && selectedValue === d
                          return (
                            <span
                              key={d}
                              className={`sudoku-cell__note${matchesSelected ? ' sudoku-cell__note--match' : ''}`}
                            >
                              {hasNote ? d : ''}
                            </span>
                          )
                        })}
                      </span>
                    ) : null}

                    {!isPaused && isConflict ? (
                      <span
                        className="sudoku-cell__conflict-dot"
                        aria-hidden="true"
                      />
                    ) : null}
                  </button>
                )
              })}
            </div>

            {isPaused ? (
              <div className="sudoku-overlay" role="dialog" aria-label="Permainan dijeda">
                <p className="sudoku-overlay__eyebrow">Jeda</p>
                <h2 className="sudoku-overlay__title">Istirahat sebentar.</h2>
                <p className="sudoku-overlay__text">
                  Angka disembunyikan sementara supaya waktunya tetap adil.
                </p>
                <div className="sudoku-overlay__actions">
                  <button
                    type="button"
                    className="button"
                    onClick={() => {
                      unlockAudio()
                      dispatch({ type: 'toggle-pause' })
                    }}
                  >
                    <Play size={16} aria-hidden="true" />
                    Lanjutkan
                  </button>
                </div>
              </div>
            ) : null}

            {isWon ? (
              <div
                className="sudoku-overlay sudoku-overlay--won"
                role="dialog"
                aria-label="Papan Sudoku selesai"
              >
                <p className="sudoku-overlay__eyebrow">
                  {state.isNewRecord
                    ? `Rekor baru · ${difficultyMeta.label}`
                    : `Selesai · ${difficultyMeta.label}`}
                </p>
                <h2 className="sudoku-overlay__title">Papan tuntas!</h2>
                <p className="sudoku-overlay__text">
                  Selesai dalam{' '}
                  <strong className="sudoku-mono">
                    {formatTime(state.elapsedSeconds)}
                  </strong>
                  {state.hintsUsed > 0
                    ? ` dengan ${state.hintsUsed} petunjuk.`
                    : ' tanpa satu pun petunjuk. Mantap!'}
                </p>
                <div className="sudoku-overlay__actions">
                  <button
                    type="button"
                    className="button"
                    onClick={() => {
                      unlockAudio()
                      dispatch({ type: 'new-game' })
                    }}
                  >
                    Main lagi
                  </button>
                  <Link to="/games" className="button button--quiet">
                    Menu utama
                  </Link>
                </div>
              </div>
            ) : null}
          </div>

          {/* Banner Petunjuk Logika */}
          {state.activeHint ? (
            <div
              className={`sudoku-hint-banner sudoku-hint-banner--${state.activeHint.kind}`}
              role="status"
              aria-live="polite"
            >
              <div className="sudoku-hint-banner__icon" aria-hidden="true">
                <Lightbulb size={18} />
              </div>
              <div className="sudoku-hint-banner__body">
                <p className="sudoku-hint-banner__title">
                  {state.activeHint.title}
                </p>
                <p className="sudoku-hint-banner__text">
                  {state.activeHint.message}
                </p>
              </div>
              <button
                type="button"
                className="sudoku-hint-banner__close"
                aria-label="Tutup petunjuk"
                onClick={() => dispatch({ type: 'clear-hint' })}
              >
                <X size={16} />
              </button>
            </div>
          ) : null}
        </div>

        {/* Panel Samping (HUD + Numpad + Kontrol) */}
        <aside className="sudoku-panel" aria-label="Kontrol dan status Sudoku">
          <div className="sudoku-panel__top">
            <div
              className="sudoku-difficulty"
              role="group"
              aria-label="Tingkat kesulitan"
            >
              {DIFFICULTIES.map((diff) => {
                const active = state.difficulty === diff.id
                const isExtreme = diff.id === 'extreme'
                return (
                  <button
                    key={diff.id}
                    type="button"
                    className={`sudoku-difficulty__btn${active ? ' sudoku-difficulty__btn--active' : ''}${isExtreme ? ' sudoku-difficulty__btn--extreme' : ''}`}
                    aria-pressed={active}
                    onClick={() => {
                      unlockAudio()
                      if (diff.id !== state.difficulty) {
                        dispatch({ type: 'new-game', difficulty: diff.id })
                        setAnnouncement(`Mode diganti ke ${diff.label}.`)
                      }
                    }}
                  >
                    {diff.label}
                  </button>
                )
              })}
            </div>

            <button
              type="button"
              className="sudoku-icon-btn sudoku-panel__mute"
              onClick={handleToggleMute}
              aria-label={muted ? 'Nyalakan suara' : 'Bisukan suara'}
              aria-pressed={muted}
              title={muted ? 'Nyalakan suara' : 'Bisukan suara'}
            >
              {muted ? <VolumeX size={16} /> : <Volume2 size={16} />}
            </button>
          </div>

          <div className="sudoku-stats">
            <div className="sudoku-stat">
              <span className="sudoku-stat__label">Waktu</span>
              <span className="sudoku-stat__value sudoku-mono">
                {formatTime(state.elapsedSeconds)}
              </span>
            </div>
            <div className="sudoku-stat">
              <span className="sudoku-stat__label">Terbaik</span>
              <span className="sudoku-stat__value sudoku-mono">
                {state.bestTime !== null ? formatTime(state.bestTime) : '—'}
              </span>
            </div>
          </div>

          <div className="sudoku-substats">
            <span>
              Terisi{' '}
              <strong className="sudoku-mono">
                {filledCount}/{CELL_COUNT}
              </strong>
            </span>
            <span>
              Petunjuk <strong className="sudoku-mono">{state.hintsUsed}</strong>
            </span>
          </div>

          {/* Numpad 1-9 */}
          <div className="sudoku-numpad" role="group" aria-label="Papan angka 1 sampai 9">
            {DIGITS.map((digit) => {
              const count = digitCounts[digit]
              const remaining = Math.max(0, 9 - count)
              const completed = count >= 9
              return (
                <button
                  key={digit}
                  type="button"
                  className={`sudoku-numpad__btn${completed ? ' sudoku-numpad__btn--done' : ''}${state.noteMode ? ' sudoku-numpad__btn--note' : ''}`}
                  disabled={!canEditSelected}
                  onClick={() => handleDigitInput(digit)}
                  aria-label={
                    state.noteMode
                      ? `Catatan angka ${digit}, sisa ${remaining}`
                      : `Isi angka ${digit}, sisa ${remaining}`
                  }
                >
                  <span className="sudoku-numpad__digit">{digit}</span>
                  <span className="sudoku-numpad__rem" aria-hidden="true">
                    {remaining}
                  </span>
                </button>
              )
            })}
          </div>

          {/* Alat Bantu Utama */}
          <div className="sudoku-tools" role="group" aria-label="Alat bantu papan">
            <button
              type="button"
              className="sudoku-tool-btn"
              onClick={handleUndo}
              disabled={state.status !== 'playing' || state.history.length === 0}
            >
              <Undo2 size={16} aria-hidden="true" />
              <span>Undo</span>
            </button>

            <button
              type="button"
              className="sudoku-tool-btn"
              onClick={handleErase}
              disabled={!canEditSelected}
            >
              <Eraser size={16} aria-hidden="true" />
              <span>Hapus</span>
            </button>

            <button
              type="button"
              className={`sudoku-tool-btn${state.noteMode ? ' sudoku-tool-btn--active' : ''}`}
              aria-pressed={state.noteMode}
              onClick={handleToggleNote}
              disabled={state.status !== 'playing'}
            >
              <Pencil size={16} aria-hidden="true" />
              <span>Catatan {state.noteMode ? 'ON' : 'OFF'}</span>
            </button>

            <button
              type="button"
              className="sudoku-tool-btn sudoku-tool-btn--hint"
              onClick={handleHint}
              disabled={state.status !== 'playing'}
            >
              <Lightbulb size={16} aria-hidden="true" />
              <span>Petunjuk</span>
            </button>
          </div>

          {/* Aksi Sesi */}
          <div className="sudoku-actions">
            <button
              type="button"
              className="button button--quiet sudoku-actions__btn"
              onClick={() => {
                unlockAudio()
                dispatch({ type: 'toggle-pause' })
              }}
              disabled={isWon}
            >
              {isPaused ? (
                <>
                  <Play size={15} aria-hidden="true" />
                  Lanjut
                </>
              ) : (
                <>
                  <Pause size={15} aria-hidden="true" />
                  Jeda
                </>
              )}
            </button>

            <button
              type="button"
              className="button button--quiet sudoku-actions__btn"
              onClick={() => {
                unlockAudio()
                dispatch({ type: 'reset-board' })
                setAnnouncement('Papan direset ke kondisi awal.')
              }}
              title="Ulangi papan yang sama dari awal"
            >
              <RotateCcw size={15} aria-hidden="true" />
              Ulangi
            </button>

            <button
              type="button"
              className="button sudoku-actions__btn sudoku-actions__btn--full"
              onClick={() => {
                unlockAudio()
                dispatch({ type: 'new-game' })
                setAnnouncement(`Papan baru mode ${difficultyMeta.label} dimulai.`)
              }}
            >
              <RefreshCw size={15} aria-hidden="true" />
              Papan baru
            </button>
          </div>
        </aside>
      </div>

      {/* Panduan Bawah (Split Context) */}
      <section
        id="sudoku-instructions"
        className="sudoku-guide"
        aria-label="Panduan bermain Sudoku"
      >
        <div className="sudoku-guide__card">
          <h2 className="sudoku-guide__title">Kontrol permainan</h2>
          <ul className="sudoku-guide__list">
            <li>
              <kbd>↑</kbd> <kbd>↓</kbd> <kbd>←</kbd> <kbd>→</kbd> atau{' '}
              <kbd>WASD</kbd> — pindah sel (bisa pilih angka bawaan untuk sorot angka sama)
            </li>
            <li>
              <kbd>1</kbd>–<kbd>9</kbd> — isi angka atau catatan ·{' '}
              <kbd>Backspace</kbd> — hapus sel
            </li>
            <li>
              <kbd>N</kbd> — toggle mode Catatan · <kbd>Z</kbd> — Undo ·{' '}
              <kbd>H</kbd> — Petunjuk · <kbd>Spasi</kbd> — Jeda
            </li>
          </ul>
        </div>

        <div className="sudoku-guide__card">
          <h2 className="sudoku-guide__title">Aturan &amp; petunjuk</h2>
          <ul className="sudoku-guide__list">
            <li>
              Isi angka 1–9 sehingga setiap baris, kolom, dan kotak 3×3 tidak
              memiliki angka ganda.
            </li>
            <li>
              Angka yang bentrok langsung ditandai merah dan bisa diperbaiki
              kapan saja tanpa batas nyawa.
            </li>
            <li>
              Tombol <strong>Petunjuk</strong> memberi arah logika (termasuk
              teknik <em>Pointing Pair</em> &amp; <em>Naked Pair</em> di mode
              Ekstrem) tanpa membocorkan angka jawabannya.
            </li>
          </ul>
        </div>
      </section>
    </div>
  )
}
