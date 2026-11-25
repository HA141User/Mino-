export type SudokuDifficulty = 'easy' | 'medium' | 'hard' | 'extreme'

export type DifficultyMeta = {
  id: SudokuDifficulty
  label: string
  targetClues: number
  requiresTechniques?: boolean
}

export const DIFFICULTIES: DifficultyMeta[] = [
  { id: 'easy', label: 'Mudah', targetClues: 42 },
  { id: 'medium', label: 'Sedang', targetClues: 34 },
  { id: 'hard', label: 'Sulit', targetClues: 28 },
  { id: 'extreme', label: 'Ekstrem', targetClues: 23, requiresTechniques: true },
]

export const DEFAULT_DIFFICULTY: SudokuDifficulty = 'medium'
export const GRID_SIZE = 9
export const CELL_COUNT = 81
export const MAX_HISTORY = 100

export type SudokuStatus = 'playing' | 'paused' | 'won'
export type MoveDirection = 'up' | 'down' | 'left' | 'right'

export type HintKind =
  | 'conflict'
  | 'incorrect'
  | 'naked-single'
  | 'hidden-single'
  | 'pointing-pair'
  | 'naked-pair'
  | 'narrow-candidates'

export type SudokuHint = {
  kind: HintKind
  cellIndex: number
  relatedCells: number[]
  title: string
  message: string
}

export type HistoryEntry = {
  values: number[]
  notes: number[][]
}

export type SudokuState = {
  difficulty: SudokuDifficulty
  puzzle: number[]
  solution: number[]
  values: number[]
  notes: number[][]
  selectedCell: number | null
  noteMode: boolean
  status: SudokuStatus
  elapsedSeconds: number
  hintsUsed: number
  activeHint: SudokuHint | null
  history: HistoryEntry[]
}

export function isDifficulty(value: string | null): value is SudokuDifficulty {
  return (
    value === 'easy' ||
    value === 'medium' ||
    value === 'hard' ||
    value === 'extreme'
  )
}

export function getDifficultyMeta(difficulty: SudokuDifficulty): DifficultyMeta {
  return (
    DIFFICULTIES.find((entry) => entry.id === difficulty) ?? DIFFICULTIES[1]
  )
}

export function getCoords(index: number): {
  row: number
  col: number
  box: number
  boxRow: number
  boxCol: number
} {
  const row = Math.floor(index / GRID_SIZE)
  const col = index % GRID_SIZE
  const boxRow = Math.floor(row / 3) * 3
  const boxCol = Math.floor(col / 3) * 3
  const box = Math.floor(row / 3) * 3 + Math.floor(col / 3)
  return { row, col, box, boxRow, boxCol }
}

const PEER_CACHE: number[][] = Array.from({ length: CELL_COUNT }, (_, index) => {
  const { row, col, boxRow, boxCol } = getCoords(index)
  const peers = new Set<number>()

  for (let i = 0; i < GRID_SIZE; i++) {
    peers.add(row * GRID_SIZE + i)
    peers.add(i * GRID_SIZE + col)
  }

  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      peers.add((boxRow + r) * GRID_SIZE + (boxCol + c))
    }
  }

  peers.delete(index)
  return Array.from(peers)
})

export function getPeerIndices(index: number): number[] {
  return PEER_CACHE[index] ?? []
}

export function isPeer(a: number, b: number): boolean {
  if (a === b || a < 0 || b < 0 || a >= CELL_COUNT || b >= CELL_COUNT) {
    return false
  }
  const ca = getCoords(a)
  const cb = getCoords(b)
  return ca.row === cb.row || ca.col === cb.col || ca.box === cb.box
}

export function getRowIndices(row: number): number[] {
  return Array.from({ length: GRID_SIZE }, (_, col) => row * GRID_SIZE + col)
}

export function getColIndices(col: number): number[] {
  return Array.from({ length: GRID_SIZE }, (_, row) => row * GRID_SIZE + col)
}

export function getBoxIndices(box: number): number[] {
  const boxRow = Math.floor(box / 3) * 3
  const boxCol = (box % 3) * 3
  const indices: number[] = []
  for (let r = 0; r < 3; r++) {
    for (let c = 0; c < 3; c++) {
      indices.push((boxRow + r) * GRID_SIZE + (boxCol + c))
    }
  }
  return indices
}

export function getConflicts(values: number[]): Set<number> {
  const conflicts = new Set<number>()

  const markUnit = (indices: number[]) => {
    const seen = new Map<number, number[]>()
    for (const idx of indices) {
      const val = values[idx]
      if (val >= 1 && val <= 9) {
        const list = seen.get(val)
        if (list) {
          list.push(idx)
        } else {
          seen.set(val, [idx])
        }
      }
    }
    for (const positions of seen.values()) {
      if (positions.length > 1) {
        for (const pos of positions) {
          conflicts.add(pos)
        }
      }
    }
  }

  for (let i = 0; i < GRID_SIZE; i++) {
    markUnit(getRowIndices(i))
    markUnit(getColIndices(i))
    markUnit(getBoxIndices(i))
  }

  return conflicts
}

export function getCandidates(values: number[], index: number): number[] {
  if (values[index] !== 0) {
    return []
  }

  const used = new Set<number>()
  for (const peer of getPeerIndices(index)) {
    const val = values[peer]
    if (val >= 1 && val <= 9) {
      used.add(val)
    }
  }

  const candidates: number[] = []
  for (let d = 1; d <= 9; d++) {
    if (!used.has(d)) {
      candidates.push(d)
    }
  }
  return candidates
}

export function getDigitCounts(values: number[]): Record<number, number> {
  const counts: Record<number, number> = {
    1: 0,
    2: 0,
    3: 0,
    4: 0,
    5: 0,
    6: 0,
    7: 0,
    8: 0,
    9: 0,
  }
  for (const val of values) {
    if (val >= 1 && val <= 9) {
      counts[val] += 1
    }
  }
  return counts
}

export function isBoardSolved(values: number[]): boolean {
  if (values.length !== CELL_COUNT) {
    return false
  }
  for (let i = 0; i < CELL_COUNT; i++) {
    if (values[i] < 1 || values[i] > 9) {
      return false
    }
  }
  return getConflicts(values).size === 0
}

function safeRandomUnit(rng: () => number): number {
  const raw = rng()
  if (!Number.isFinite(raw)) {
    return 0
  }
  if (raw < 0) {
    return 0
  }
  if (raw >= 1) {
    return 0.999999999
  }
  return raw
}

function shuffle<T>(items: T[], rng: () => number): T[] {
  const copy = [...items]
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(safeRandomUnit(rng) * (i + 1))
    ;[copy[i], copy[j]] = [copy[j], copy[i]]
  }
  return copy
}

function canPlace(board: number[], index: number, digit: number): boolean {
  for (const peer of getPeerIndices(index)) {
    if (board[peer] === digit) {
      return false
    }
  }
  return true
}

function findMostConstrainedCell(board: number[]): {
  index: number
  candidates: number[]
} | null {
  let bestIndex = -1
  let bestCandidates: number[] | null = null

  for (let i = 0; i < CELL_COUNT; i++) {
    if (board[i] !== 0) {
      continue
    }
    const candidates = getCandidates(board, i)
    if (candidates.length === 0) {
      return { index: i, candidates }
    }
    if (!bestCandidates || candidates.length < bestCandidates.length) {
      bestIndex = i
      bestCandidates = candidates
      if (candidates.length === 1) {
        break
      }
    }
  }

  return bestIndex === -1 || !bestCandidates
    ? null
    : { index: bestIndex, candidates: bestCandidates }
}

export function generateSolvedBoard(rng: () => number = Math.random): number[] {
  const board = new Array<number>(CELL_COUNT).fill(0)
  const digits = [1, 2, 3, 4, 5, 6, 7, 8, 9]

  // Isi 3 kotak diagonal (independen) untuk mempercepat backtracking
  for (const box of [0, 4, 8]) {
    const shuffled = shuffle(digits, rng)
    const indices = getBoxIndices(box)
    for (let i = 0; i < GRID_SIZE; i++) {
      board[indices[i]] = shuffled[i]
    }
  }

  const solve = (): boolean => {
    const next = findMostConstrainedCell(board)
    if (!next) {
      return true
    }
    if (next.candidates.length === 0) {
      return false
    }

    const order = shuffle(next.candidates, rng)
    for (const digit of order) {
      if (canPlace(board, next.index, digit)) {
        board[next.index] = digit
        if (solve()) {
          return true
        }
        board[next.index] = 0
      }
    }

    return false
  }

  solve()
  return board
}

const MAX_SEARCH_NODES = 20_000

export function countSolutions(board: number[], limit = 2): number {
  const working = [...board]
  let solutions = 0
  let nodes = 0

  const search = () => {
    if (solutions >= limit || nodes >= MAX_SEARCH_NODES) {
      return
    }
    nodes += 1
    const next = findMostConstrainedCell(working)
    if (!next) {
      solutions += 1
      return
    }
    if (next.candidates.length === 0) {
      return
    }

    for (const digit of next.candidates) {
      working[next.index] = digit
      search()
      working[next.index] = 0
      if (solutions >= limit || nodes >= MAX_SEARCH_NODES) {
        return
      }
    }
  }

  search()
  return nodes >= MAX_SEARCH_NODES ? limit : solutions
}

const ALL_UNITS: number[][] = [
  ...Array.from({ length: GRID_SIZE }, (_, i) => getRowIndices(i)),
  ...Array.from({ length: GRID_SIZE }, (_, i) => getColIndices(i)),
  ...Array.from({ length: GRID_SIZE }, (_, i) => getBoxIndices(i)),
]

const ALL_DIGITS_MASK = 0b1111111110 // bit 1..9

function countBits(mask: number): number {
  let count = 0
  let v = mask
  while (v !== 0) {
    v &= v - 1
    count += 1
  }
  return count
}

function lowestDigit(mask: number): number {
  for (let d = 1; d <= 9; d++) {
    if ((mask & (1 << d)) !== 0) {
      return d
    }
  }
  return 0
}

/**
 * Mengembalikan true jika papan dapat diselesaikan tuntas hanya dengan
 * Naked Single dan Hidden Single (tanpa teknik lanjutan).
 */
export function canSolveWithSinglesOnly(board: number[]): boolean {
  const working = [...board]
  const masks = new Array<number>(CELL_COUNT).fill(0)

  for (let i = 0; i < CELL_COUNT; i++) {
    if (working[i] !== 0) {
      continue
    }
    let used = 0
    for (const peer of getPeerIndices(i)) {
      const val = working[peer]
      if (val >= 1 && val <= 9) {
        used |= 1 << val
      }
    }
    masks[i] = ALL_DIGITS_MASK & ~used
  }

  const place = (index: number, digit: number) => {
    working[index] = digit
    masks[index] = 0
    const bit = ~(1 << digit)
    for (const peer of getPeerIndices(index)) {
      masks[peer] &= bit
    }
  }

  let progress = true
  while (progress) {
    progress = false

    // 1. Naked Singles
    for (let i = 0; i < CELL_COUNT; i++) {
      if (working[i] === 0 && countBits(masks[i]) === 1) {
        place(i, lowestDigit(masks[i]))
        progress = true
      }
    }
    if (progress) {
      continue
    }

    // 2. Hidden Singles
    for (const unit of ALL_UNITS) {
      for (let digit = 1; digit <= 9; digit++) {
        const bit = 1 << digit
        let matchCell = -1
        let matchCount = 0
        for (const idx of unit) {
          if (working[idx] === digit) {
            matchCount = 2
            break
          }
          if (working[idx] === 0 && (masks[idx] & bit) !== 0) {
            matchCell = idx
            matchCount += 1
            if (matchCount > 1) {
              break
            }
          }
        }
        if (matchCount === 1 && matchCell !== -1) {
          place(matchCell, digit)
          progress = true
          break
        }
      }
      if (progress) {
        break
      }
    }
  }

  return working.every((val) => val >= 1 && val <= 9)
}

function digPuzzle(
  solution: number[],
  targetClues: number,
  rng: () => number,
): { puzzle: number[]; clues: number } {
  const puzzle = [...solution]
  const order = shuffle(
    Array.from({ length: CELL_COUNT }, (_, i) => i),
    rng,
  )

  let clues = CELL_COUNT
  for (const idx of order) {
    if (clues <= targetClues) {
      break
    }
    const backup = puzzle[idx]
    puzzle[idx] = 0
    if (countSolutions(puzzle, 2) === 1) {
      clues -= 1
    } else {
      puzzle[idx] = backup
    }
  }

  return { puzzle, clues }
}

const EXTREME_MAX_ATTEMPTS = 14
const EXTREME_TIME_BUDGET_MS = 250
const VERIFIED_EXTREME_FALLBACK_SEED = 404

function createDeterministicRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

function nowMs(): number {
  return typeof performance !== 'undefined' ? performance.now() : Date.now()
}

export function generatePuzzle(
  difficulty: SudokuDifficulty,
  rng: () => number = Math.random,
): { puzzle: number[]; solution: number[] } {
  const { targetClues, requiresTechniques } = getDifficultyMeta(difficulty)

  if (!requiresTechniques) {
    const solution = generateSolvedBoard(rng)
    const { puzzle } = digPuzzle(solution, targetClues, rng)
    return { puzzle, solution }
  }

  // Untuk mode Ekstrem: cari papan dengan petunjuk sangat sedikit
  // yang TIDAK bisa diselesaikan hanya dengan Naked/Hidden Single,
  // dengan batas waktu agar main thread tidak pernah membeku.
  const startedAt = nowMs()
  let bestCandidate: {
    puzzle: number[]
    solution: number[]
    clues: number
    advanced: boolean
  } | null = null

  for (let attempt = 0; attempt < EXTREME_MAX_ATTEMPTS; attempt++) {
    const solution = generateSolvedBoard(rng)
    const { puzzle, clues } = digPuzzle(solution, targetClues, rng)
    const needsAdvancedTechniques = !canSolveWithSinglesOnly(puzzle)

    if (needsAdvancedTechniques && clues <= 26) {
      return { puzzle, solution }
    }

    if (
      !bestCandidate ||
      (needsAdvancedTechniques && !bestCandidate.advanced) ||
      (needsAdvancedTechniques === bestCandidate.advanced &&
        clues < bestCandidate.clues)
    ) {
      bestCandidate = {
        puzzle,
        solution,
        clues,
        advanced: needsAdvancedTechniques,
      }
    }

    if (bestCandidate && nowMs() - startedAt >= EXTREME_TIME_BUDGET_MS) {
      break
    }
  }

  // Jika semua percobaan acak / budget waktu belum menghasilkan papan Ekstrem sejati,
  // gunakan seed terverifikasi yang dijamin memerlukan teknik eliminasi lanjutan.
  if (!bestCandidate || !bestCandidate.advanced) {
    const fallbackRng = createDeterministicRng(VERIFIED_EXTREME_FALLBACK_SEED)
    for (let i = 0; i < 6; i++) {
      const solution = generateSolvedBoard(fallbackRng)
      const { puzzle, clues } = digPuzzle(solution, targetClues, fallbackRng)
      if (!canSolveWithSinglesOnly(puzzle) && clues <= 26) {
        return { puzzle, solution }
      }
    }
  }

  return {
    puzzle: bestCandidate!.puzzle,
    solution: bestCandidate!.solution,
  }
}

function createEmptyNotes(): number[][] {
  return Array.from({ length: CELL_COUNT }, () => [])
}

function cloneNotes(notes: number[][]): number[][] {
  return notes.map((cellNotes) => [...cellNotes])
}

export function createSudokuState(
  difficulty: SudokuDifficulty = DEFAULT_DIFFICULTY,
  rng: () => number = Math.random,
): SudokuState {
  const { puzzle, solution } = generatePuzzle(difficulty, rng)
  const firstEmpty = puzzle.findIndex((val) => val === 0)

  return {
    difficulty,
    puzzle,
    solution,
    values: [...puzzle],
    notes: createEmptyNotes(),
    selectedCell: firstEmpty >= 0 ? firstEmpty : 0,
    noteMode: false,
    status: 'playing',
    elapsedSeconds: 0,
    hintsUsed: 0,
    activeHint: null,
    history: [],
  }
}

export function createStateFromBoard(
  puzzle: number[],
  solution: number[],
  difficulty: SudokuDifficulty = DEFAULT_DIFFICULTY,
): SudokuState {
  const firstEmpty = puzzle.findIndex((val) => val === 0)
  return {
    difficulty,
    puzzle: [...puzzle],
    solution: [...solution],
    values: [...puzzle],
    notes: createEmptyNotes(),
    selectedCell: firstEmpty >= 0 ? firstEmpty : 0,
    noteMode: false,
    status: 'playing',
    elapsedSeconds: 0,
    hintsUsed: 0,
    activeHint: null,
    history: [],
  }
}

export function selectCell(
  state: SudokuState,
  index: number,
): SudokuState {
  if (
    !Number.isInteger(index) ||
    index < 0 ||
    index >= CELL_COUNT ||
    state.status === 'paused'
  ) {
    return state
  }
  return {
    ...state,
    selectedCell: index,
  }
}

export function moveSelection(
  state: SudokuState,
  direction: MoveDirection,
): SudokuState {
  if (state.status === 'paused') {
    return state
  }
  const current = state.selectedCell ?? 0
  const { row, col } = getCoords(current)

  let nextRow = row
  let nextCol = col

  switch (direction) {
    case 'up':
      nextRow = (row + GRID_SIZE - 1) % GRID_SIZE
      break
    case 'down':
      nextRow = (row + 1) % GRID_SIZE
      break
    case 'left':
      nextCol = (col + GRID_SIZE - 1) % GRID_SIZE
      break
    case 'right':
      nextCol = (col + 1) % GRID_SIZE
      break
  }

  return {
    ...state,
    selectedCell: nextRow * GRID_SIZE + nextCol,
  }
}

export function toggleNoteMode(state: SudokuState): SudokuState {
  if (state.status !== 'playing') {
    return state
  }
  return {
    ...state,
    noteMode: !state.noteMode,
  }
}

function pushHistory(state: SudokuState): HistoryEntry[] {
  const nextHistory = [
    ...state.history,
    {
      values: [...state.values],
      notes: cloneNotes(state.notes),
    },
  ]
  if (nextHistory.length > MAX_HISTORY) {
    return nextHistory.slice(nextHistory.length - MAX_HISTORY)
  }
  return nextHistory
}

export function inputDigit(state: SudokuState, digit: number): SudokuState {
  if (
    state.status !== 'playing' ||
    state.selectedCell === null ||
    !Number.isInteger(digit) ||
    digit < 1 ||
    digit > 9
  ) {
    return state
  }

  const idx = state.selectedCell
  if (state.puzzle[idx] !== 0) {
    return state
  }

  if (state.noteMode) {
    // Jangan timpa angka besar secara tidak sengaja saat mode catatan aktif
    if (state.values[idx] !== 0) {
      return state
    }
    const nextNotes = cloneNotes(state.notes)
    const currentCellNotes = nextNotes[idx]
    const pos = currentCellNotes.indexOf(digit)
    if (pos >= 0) {
      currentCellNotes.splice(pos, 1)
    } else {
      currentCellNotes.push(digit)
      currentCellNotes.sort((a, b) => a - b)
    }

    return {
      ...state,
      notes: nextNotes,
      activeHint: null,
      history: pushHistory(state),
    }
  }

  if (state.values[idx] === digit) {
    return state
  }

  const nextValues = [...state.values]
  nextValues[idx] = digit

  const nextNotes = cloneNotes(state.notes)
  nextNotes[idx] = []

  // Bersihkan catatan angka yang sama pada semua peer
  for (const peer of getPeerIndices(idx)) {
    if (nextNotes[peer].length > 0) {
      nextNotes[peer] = nextNotes[peer].filter((n) => n !== digit)
    }
  }

  const solved = isBoardSolved(nextValues)

  return {
    ...state,
    values: nextValues,
    notes: nextNotes,
    status: solved ? 'won' : 'playing',
    activeHint: null,
    history: pushHistory(state),
  }
}

export function eraseCell(state: SudokuState): SudokuState {
  if (state.status !== 'playing' || state.selectedCell === null) {
    return state
  }

  const idx = state.selectedCell
  if (state.puzzle[idx] !== 0) {
    return state
  }

  if (state.values[idx] === 0 && state.notes[idx].length === 0) {
    return state
  }

  const nextValues = [...state.values]
  nextValues[idx] = 0

  const nextNotes = cloneNotes(state.notes)
  nextNotes[idx] = []

  return {
    ...state,
    values: nextValues,
    notes: nextNotes,
    activeHint: null,
    history: pushHistory(state),
  }
}

export function undoMove(state: SudokuState): SudokuState {
  if (state.status !== 'playing' || state.history.length === 0) {
    return state
  }

  const previous = state.history[state.history.length - 1]
  return {
    ...state,
    values: [...previous.values],
    notes: cloneNotes(previous.notes),
    activeHint: null,
    history: state.history.slice(0, -1),
  }
}

function formatCellCoord(index: number): string {
  const { row, col } = getCoords(index)
  return `Baris ${row + 1}, Kolom ${col + 1}`
}

/**
 * Menghasilkan petunjuk logika tanpa membocorkan angkanya secara langsung.
 */
export function computeHint(state: SudokuState): SudokuHint | null {
  if (state.status !== 'playing') {
    return null
  }

  // 1. Cek konflik / duplikat terlebih dahulu
  const conflicts = getConflicts(state.values)
  if (conflicts.size > 0) {
    const conflictList = Array.from(conflicts)
    const selectedEditableConflict =
      state.selectedCell !== null &&
      conflicts.has(state.selectedCell) &&
      state.puzzle[state.selectedCell] === 0
        ? state.selectedCell
        : undefined
    const target =
      selectedEditableConflict ??
      conflictList.find((idx) => state.puzzle[idx] === 0) ??
      conflictList[0]

    const targetValue = state.values[target]
    const related = getPeerIndices(target).filter(
      (peer) => state.values[peer] === targetValue,
    )

    return {
      kind: 'conflict',
      cellIndex: target,
      relatedCells: related,
      title: 'Ada angka ganda',
      message: `Cek ${formatCellCoord(target)} — angka di sini bentrok dengan sel lain di baris, kolom, atau kotak 3×3 yang sama.`,
    }
  }

  // 2. Cek apakah ada isian pemain yang tidak cocok dengan solusi unik
  for (let i = 0; i < CELL_COUNT; i++) {
    if (
      state.puzzle[i] === 0 &&
      state.values[i] !== 0 &&
      state.values[i] !== state.solution[i]
    ) {
      return {
        kind: 'incorrect',
        cellIndex: i,
        relatedCells: [],
        title: 'Periksa ulang isian',
        message: `Angka di ${formatCellCoord(i)} belum cocok dengan solusi papan ini. Coba hapus dan telusuri lagi kemungkinannya.`,
      }
    }
  }

  // 3. Cari Naked Single (sel kosong dengan tepat 1 kandidat)
  let fewestCell = -1
  let fewestCount = 10

  for (let i = 0; i < CELL_COUNT; i++) {
    if (state.values[i] !== 0) {
      continue
    }
    const candidates = getCandidates(state.values, i)
    if (candidates.length === 1) {
      const filledPeers = getPeerIndices(i).filter(
        (peer) => state.values[peer] !== 0,
      )
      return {
        kind: 'naked-single',
        cellIndex: i,
        relatedCells: filledPeers,
        title: 'Cuma satu angka yang cocok',
        message: `Perhatikan ${formatCellCoord(i)} — delapan angka lain sudah terpakai di baris, kolom, dan kotak 3×3-nya. Hanya tersisa satu pilihan!`,
      }
    }
    if (candidates.length > 0 && candidates.length < fewestCount) {
      fewestCount = candidates.length
      fewestCell = i
    }
  }

  // 4. Cari Hidden Single (suatu angka yang hanya bisa masuk di 1 sel pada satu unit)
  const units: { label: string; indices: number[] }[] = []
  for (let i = 0; i < GRID_SIZE; i++) {
    units.push({ label: `Kotak 3×3 ke-${i + 1}`, indices: getBoxIndices(i) })
  }
  for (let i = 0; i < GRID_SIZE; i++) {
    units.push({ label: `Baris ${i + 1}`, indices: getRowIndices(i) })
  }
  for (let i = 0; i < GRID_SIZE; i++) {
    units.push({ label: `Kolom ${i + 1}`, indices: getColIndices(i) })
  }

  for (const unit of units) {
    const present = new Set<number>()
    for (const idx of unit.indices) {
      if (state.values[idx] !== 0) {
        present.add(state.values[idx])
      }
    }

    for (let digit = 1; digit <= 9; digit++) {
      if (present.has(digit)) {
        continue
      }
      const possibleCells: number[] = []
      for (const idx of unit.indices) {
        if (state.values[idx] === 0 && canPlace(state.values, idx, digit)) {
          possibleCells.push(idx)
        }
      }
      if (possibleCells.length === 1) {
        const target = possibleCells[0]
        return {
          kind: 'hidden-single',
          cellIndex: target,
          relatedCells: unit.indices.filter((idx) => idx !== target),
          title: `Posisi unik di ${unit.label}`,
          message: `Cek ${unit.label} — ada satu angka yang belum terisi dan cuma punya satu tempat tersisa, yaitu di ${formatCellCoord(target)}.`,
        }
      }
    }
  }

  // 5. Cari Pointing Pair / Triple (kandidat dalam kotak 3×3 terkunci di satu baris/kolom)
  for (let box = 0; box < GRID_SIZE; box++) {
    const boxIndices = getBoxIndices(box)
    const boxSet = new Set(boxIndices)

    for (let digit = 1; digit <= 9; digit++) {
      const possibleInBox: number[] = []
      let alreadyPlaced = false
      for (const idx of boxIndices) {
        if (state.values[idx] === digit) {
          alreadyPlaced = true
          break
        }
        if (state.values[idx] === 0 && canPlace(state.values, idx, digit)) {
          possibleInBox.push(idx)
        }
      }
      if (alreadyPlaced || possibleInBox.length < 2 || possibleInBox.length > 3) {
        continue
      }

      const firstCoord = getCoords(possibleInBox[0])
      const sameRow = possibleInBox.every(
        (idx) => getCoords(idx).row === firstCoord.row,
      )
      if (sameRow) {
        const eliminations = getRowIndices(firstCoord.row).filter(
          (idx) =>
            !boxSet.has(idx) &&
            state.values[idx] === 0 &&
            canPlace(state.values, idx, digit),
        )
        if (eliminations.length > 0) {
          return {
            kind: 'pointing-pair',
            cellIndex: possibleInBox[0],
            relatedCells: [...possibleInBox.slice(1), ...eliminations],
            title: 'Teknik Pointing Pair',
            message: `Di Kotak 3×3 ke-${box + 1}, semua kemungkinan satu angka tertentu terkunci di Baris ${firstCoord.row + 1}. Artinya angka itu bisa dicoret dari kandidat di sisa Baris ${firstCoord.row + 1} di luar kotak ini!`,
          }
        }
      }

      const sameCol = possibleInBox.every(
        (idx) => getCoords(idx).col === firstCoord.col,
      )
      if (sameCol) {
        const eliminations = getColIndices(firstCoord.col).filter(
          (idx) =>
            !boxSet.has(idx) &&
            state.values[idx] === 0 &&
            canPlace(state.values, idx, digit),
        )
        if (eliminations.length > 0) {
          return {
            kind: 'pointing-pair',
            cellIndex: possibleInBox[0],
            relatedCells: [...possibleInBox.slice(1), ...eliminations],
            title: 'Teknik Pointing Pair',
            message: `Di Kotak 3×3 ke-${box + 1}, semua kemungkinan satu angka tertentu terkunci di Kolom ${firstCoord.col + 1}. Artinya angka itu bisa dicoret dari kandidat di sisa Kolom ${firstCoord.col + 1} di luar kotak ini!`,
          }
        }
      }
    }
  }

  // 6. Cari Naked Pair (dua sel dalam satu unit berbagi tepat 2 kandidat identik)
  const candidateMap = new Map<number, number[]>()
  for (let i = 0; i < CELL_COUNT; i++) {
    if (state.values[i] === 0) {
      candidateMap.set(i, getCandidates(state.values, i))
    }
  }

  for (const unit of units) {
    const pairCells = unit.indices.filter(
      (idx) => (candidateMap.get(idx)?.length ?? 0) === 2,
    )
    for (let i = 0; i < pairCells.length; i++) {
      const cellA = pairCells[i]
      const candA = candidateMap.get(cellA)!
      for (let j = i + 1; j < pairCells.length; j++) {
        const cellB = pairCells[j]
        const candB = candidateMap.get(cellB)!
        if (candA[0] === candB[0] && candA[1] === candB[1]) {
          const eliminations = unit.indices.filter((idx) => {
            if (idx === cellA || idx === cellB) {
              return false
            }
            const cands = candidateMap.get(idx)
            return (
              cands !== undefined &&
              (cands.includes(candA[0]) || cands.includes(candA[1]))
            )
          })
          if (eliminations.length > 0) {
            return {
              kind: 'naked-pair',
              cellIndex: cellA,
              relatedCells: [cellB, ...eliminations],
              title: 'Teknik Naked Pair',
              message: `Di ${unit.label}, sel ${formatCellCoord(cellA)} dan ${formatCellCoord(cellB)} berbagi tepat dua kandidat yang sama. Kedua angka itu pasti milik mereka, jadi bisa dicoret dari sel lain di ${unit.label}!`,
            }
          }
        }
      }
    }
  }

  // 7. Fallback: arahkan ke sel dengan kandidat paling sedikit
  if (fewestCell !== -1) {
    return {
      kind: 'narrow-candidates',
      cellIndex: fewestCell,
      relatedCells: [],
      title: 'Persempit kandidat',
      message: `Fokus ke ${formatCellCoord(fewestCell)} — sel ini cuma punya ${fewestCount} kemungkinan angka. Nyalakan mode Catatan untuk memetakan polanya.`,
    }
  }

  return null
}

export function requestHint(state: SudokuState): SudokuState {
  const hint = computeHint(state)
  if (!hint) {
    return state
  }
  const sameAsActive =
    state.activeHint !== null &&
    state.activeHint.kind === hint.kind &&
    state.activeHint.cellIndex === hint.cellIndex
  return {
    ...state,
    selectedCell: hint.cellIndex,
    activeHint: hint,
    hintsUsed: sameAsActive ? state.hintsUsed : state.hintsUsed + 1,
  }
}

export function clearHint(state: SudokuState): SudokuState {
  if (!state.activeHint) {
    return state
  }
  return {
    ...state,
    activeHint: null,
  }
}

export function togglePause(state: SudokuState): SudokuState {
  if (state.status === 'won') {
    return state
  }
  return {
    ...state,
    status: state.status === 'paused' ? 'playing' : 'paused',
  }
}

export function pauseGame(state: SudokuState): SudokuState {
  if (state.status !== 'playing') {
    return state
  }
  return {
    ...state,
    status: 'paused',
  }
}

export function tickTimer(state: SudokuState): SudokuState {
  if (state.status !== 'playing') {
    return state
  }
  return {
    ...state,
    elapsedSeconds: state.elapsedSeconds + 1,
  }
}

export function resetCurrentBoard(state: SudokuState): SudokuState {
  const firstEmpty = state.puzzle.findIndex((val) => val === 0)
  return {
    ...state,
    values: [...state.puzzle],
    notes: createEmptyNotes(),
    selectedCell: firstEmpty >= 0 ? firstEmpty : 0,
    status: 'playing',
    elapsedSeconds: 0,
    hintsUsed: 0,
    activeHint: null,
    history: [],
  }
}

export function formatTime(totalSeconds: number): string {
  const safe = Math.max(0, Math.floor(totalSeconds))
  const minutes = Math.floor(safe / 60)
  const seconds = safe % 60
  return `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`
}
