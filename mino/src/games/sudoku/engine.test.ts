import { describe, expect, it } from 'vitest'
import {
  CELL_COUNT,
  canSolveWithSinglesOnly,
  computeHint,
  countSolutions,
  createStateFromBoard,
  createSudokuState,
  eraseCell,
  formatTime,
  generatePuzzle,
  generateSolvedBoard,
  getCandidates,
  getConflicts,
  getDigitCounts,
  getPeerIndices,
  inputDigit,
  isBoardSolved,
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

function createSeededRng(seed: number): () => number {
  let state = seed >>> 0
  return () => {
    state = (1664525 * state + 1013904223) >>> 0
    return state / 0x100000000
  }
}

const VALID_SOLUTION = [
  5, 3, 4, 6, 7, 8, 9, 1, 2,
  6, 7, 2, 1, 9, 5, 3, 4, 8,
  1, 9, 8, 3, 4, 2, 5, 6, 7,
  8, 5, 9, 7, 6, 1, 4, 2, 3,
  4, 2, 6, 8, 5, 3, 7, 9, 1,
  7, 1, 3, 9, 2, 4, 8, 5, 6,
  9, 6, 1, 5, 3, 7, 2, 8, 4,
  2, 8, 7, 4, 1, 9, 6, 3, 5,
  3, 4, 5, 2, 8, 6, 1, 7, 9,
]

describe('sudoku engine', () => {
  describe('generator & solver', () => {
    it('menghasilkan papan penuh yang valid tanpa konflik', () => {
      const board = generateSolvedBoard(createSeededRng(42))
      expect(board).toHaveLength(CELL_COUNT)
      expect(isBoardSolved(board)).toBe(true)
      expect(getConflicts(board).size).toBe(0)
    })

    it('menghasilkan puzzle dengan solusi tunggal di setiap tingkat kesulitan', () => {
      const easy = generatePuzzle('easy', createSeededRng(101))
      const medium = generatePuzzle('medium', createSeededRng(202))
      const hard = generatePuzzle('hard', createSeededRng(303))

      const countClues = (b: number[]) => b.filter((v) => v !== 0).length

      expect(isBoardSolved(easy.solution)).toBe(true)
      expect(countSolutions(easy.puzzle, 2)).toBe(1)
      expect(countClues(easy.puzzle)).toBeGreaterThanOrEqual(40)

      expect(isBoardSolved(medium.solution)).toBe(true)
      expect(countSolutions(medium.puzzle, 2)).toBe(1)
      expect(countClues(medium.puzzle)).toBeLessThan(countClues(easy.puzzle))

      expect(isBoardSolved(hard.solution)).toBe(true)
      expect(countSolutions(hard.puzzle, 2)).toBe(1)
      expect(countClues(hard.puzzle)).toBeLessThanOrEqual(countClues(medium.puzzle))
    })

    it('menghasilkan papan Ekstrem dengan solusi tunggal yang wajib teknik lanjutan', () => {
      const extreme = generatePuzzle('extreme', createSeededRng(404))
      const clues = extreme.puzzle.filter((v) => v !== 0).length

      expect(isBoardSolved(extreme.solution)).toBe(true)
      expect(countSolutions(extreme.puzzle, 2)).toBe(1)
      expect(clues).toBeLessThanOrEqual(26)
      expect(canSolveWithSinglesOnly(extreme.puzzle)).toBe(false)
    })
  })

  describe('peer, kandidat, dan deteksi konflik', () => {
    it('menghitung tepat 20 peer unik untuk setiap sel', () => {
      expect(getPeerIndices(0)).toHaveLength(20)
      expect(getPeerIndices(40)).toHaveLength(20)
      expect(isPeer(0, 1)).toBe(true)
      expect(isPeer(0, 9)).toBe(true)
      expect(isPeer(0, 20)).toBe(true)
      expect(isPeer(0, 80)).toBe(false)
      expect(isPeer(0, 0)).toBe(false)
    })

    it('mendeteksi duplikat di baris, kolom, dan kotak 3x3', () => {
      const board = new Array<number>(CELL_COUNT).fill(0)
      board[0] = 5
      board[5] = 5 // baris sama
      board[18] = 5 // kolom sama
      board[10] = 5 // kotak sama

      const conflicts = getConflicts(board)
      expect(conflicts.has(0)).toBe(true)
      expect(conflicts.has(5)).toBe(true)
      expect(conflicts.has(18)).toBe(true)
      expect(conflicts.has(10)).toBe(true)
      expect(conflicts.size).toBe(4)
    })

    it('menghitung kandidat yang tersisa dengan akurat', () => {
      const puzzle = [...VALID_SOLUTION]
      puzzle[0] = 0 // seharusnya 5
      expect(getCandidates(puzzle, 0)).toEqual([5])
    })

    it('menghitung jumlah kemunculan setiap angka 1-9', () => {
      const counts = getDigitCounts(VALID_SOLUTION)
      for (let d = 1; d <= 9; d++) {
        expect(counts[d]).toBe(9)
      }
    })
  })

  describe('interaksi sel, catatan, undo, dan hapus', () => {
    it('melindungi angka bawaan tetapi tetap mengizinkan navigasi ke sel bawaan', () => {
      const puzzle = [...VALID_SOLUTION]
      puzzle[0] = 0
      let state = createStateFromBoard(puzzle, VALID_SOLUTION, 'easy')

      // Sel 1 adalah angka bawaan (3)
      state = selectCell(state, 1)
      expect(state.selectedCell).toBe(1)

      const afterInput = inputDigit(state, 9)
      expect(afterInput.values[1]).toBe(3)
      expect(afterInput.history).toHaveLength(0)

      const afterErase = eraseCell(state)
      expect(afterErase.values[1]).toBe(3)
    })

    it('berpindah antar sel dengan wrap di keempat tepi', () => {
      const state = createStateFromBoard(VALID_SOLUTION, VALID_SOLUTION)
      expect(moveSelection(selectCell(state, 0), 'left').selectedCell).toBe(8)
      expect(moveSelection(selectCell(state, 8), 'right').selectedCell).toBe(0)
      expect(moveSelection(selectCell(state, 0), 'up').selectedCell).toBe(72)
      expect(moveSelection(selectCell(state, 72), 'down').selectedCell).toBe(0)
    })

    it('mendukung mode catatan 3x3 dan otomatis menghapus catatan peer saat angka diisi', () => {
      const puzzle = [...VALID_SOLUTION]
      puzzle[0] = 0 // solusi 5
      puzzle[1] = 0 // solusi 3 (peer di baris 0)
      let state = createStateFromBoard(puzzle, VALID_SOLUTION)

      state = toggleNoteMode(state)
      state = selectCell(state, 1)
      state = inputDigit(state, 5)
      state = inputDigit(state, 3)
      expect(state.notes[1]).toEqual([3, 5])

      // Matikan mode catatan dan isi angka 5 di sel 0
      state = toggleNoteMode(state)
      state = selectCell(state, 0)
      state = inputDigit(state, 5)

      expect(state.values[0]).toBe(5)
      // Catatan angka 5 di sel peer (1) otomatis dibersihkan
      expect(state.notes[1]).toEqual([3])
    })

    it('mendukung undo dan hapus sel secara berurutan', () => {
      const puzzle = [...VALID_SOLUTION]
      puzzle[0] = 0
      puzzle[1] = 0
      let state = createStateFromBoard(puzzle, VALID_SOLUTION)

      state = selectCell(state, 0)
      state = inputDigit(state, 5)
      expect(state.values[0]).toBe(5)

      state = eraseCell(state)
      expect(state.values[0]).toBe(0)

      state = undoMove(state)
      expect(state.values[0]).toBe(5)

      state = undoMove(state)
      expect(state.values[0]).toBe(0)
    })

    it('mengubah status ke won saat papan terisi lengkap tanpa konflik', () => {
      const puzzle = [...VALID_SOLUTION]
      puzzle[0] = 0 // solusi 5
      let state = createStateFromBoard(puzzle, VALID_SOLUTION)

      state = selectCell(state, 0)
      state = inputDigit(state, 5)
      expect(state.status).toBe('won')
    })
  })

  describe('sistem petunjuk logika (tanpa bocoran angka)', () => {
    it('memprioritaskan deteksi konflik ketika ada angka ganda', () => {
      const puzzle = [...VALID_SOLUTION]
      puzzle[0] = 0
      let state = createStateFromBoard(puzzle, VALID_SOLUTION)
      state = selectCell(state, 0)
      state = inputDigit(state, 3) // bentrok dengan sel 1 (3)

      const hint = computeHint(state)
      expect(hint?.kind).toBe('conflict')
      expect(hint?.cellIndex).toBe(0)
      expect(hint?.relatedCells).toContain(1)
    })

    it('menunjukkan sel yang tidak cocok dengan solusi jika belum ada konflik langsung', () => {
      const puzzle = [...VALID_SOLUTION]
      puzzle[0] = 0 // 5
      puzzle[1] = 0 // 3 (di baris 0 & kotak 0)
      puzzle[72] = 0 // 3 (di kolom 0)
      let state = createStateFromBoard(puzzle, VALID_SOLUTION)
      state = selectCell(state, 0)
      state = inputDigit(state, 3) // tidak bentrok karena 3 di baris/kolom/kotak kosong, tapi salah

      const hint = computeHint(state)
      expect(hint?.kind).toBe('incorrect')
      expect(hint?.cellIndex).toBe(0)
    })

    it('memberi petunjuk naked-single tanpa membocorkan angkanya', () => {
      const puzzle = [...VALID_SOLUTION]
      puzzle[0] = 0 // satu-satunya kandidat = 5
      const state = createStateFromBoard(puzzle, VALID_SOLUTION)

      const next = requestHint(state)
      expect(next.hintsUsed).toBe(1)
      expect(next.selectedCell).toBe(0)
      expect(next.activeHint?.kind).toBe('naked-single')
      // Pastikan teks petunjuk tidak membocorkan angka jawaban '5'
      expect(next.activeHint?.message).not.toContain('5')
    })

    it('mendeteksi teknik Pointing Pair atau Naked Pair pada papan tanpa single', () => {
      // Buat papan Ekstrem lalu selesaikan semua single terlebih dahulu agar tersisa teknik lanjutan
      const { puzzle, solution } = generatePuzzle('extreme', createSeededRng(404))
      let state = createStateFromBoard(puzzle, solution, 'extreme')

      let guard = 0
      while (guard < 81) {
        const hint = computeHint(state)
        if (!hint) break
        if (hint.kind === 'naked-single' || hint.kind === 'hidden-single') {
          state = selectCell(state, hint.cellIndex)
          state = inputDigit(state, solution[hint.cellIndex])
          guard += 1
        } else {
          break
        }
      }

      const advancedHint = computeHint(state)
      expect(advancedHint).not.toBeNull()
      expect(['pointing-pair', 'naked-pair', 'narrow-candidates']).toContain(
        advancedHint?.kind,
      )
    })

    it('mendeteksi Pointing Pair secara spesifik pada susunan terkunci', () => {
      // Di Kotak 0, angka 9 hanya bisa masuk di Baris 0 (sel 0 & 1),
      // sementara di Kotak 2 Baris 0 (sel 6, 7, 8) angka 9 masih bisa dicoret.
      const board = new Array<number>(CELL_COUNT).fill(0)
      board[12] = 9 // baris 1, kol 3 (menutup baris 1 di kotak 0)
      board[18] = 2 // baris 2, kol 0
      board[19] = 3 // baris 2, kol 1
      board[20] = 4 // baris 2, kol 2 (menutup baris 2 di kotak 0)
      board[2] = 1 // baris 0, kol 2 (menyisakan hanya sel 0 & 1 di kotak 0 untuk angka 9)

      const state = createStateFromBoard(board, VALID_SOLUTION, 'extreme')
      const hint = computeHint(state)
      expect(hint?.kind).toBe('pointing-pair')
      expect(hint?.title).toBe('Teknik Pointing Pair')
      expect(hint?.message).not.toContain('9')
    })

    it('mendeteksi Naked Pair secara spesifik pada satu baris', () => {
      // Di Baris 0: sel 0 dan sel 1 hanya punya kandidat {1, 2},
      // sementara sel 2 punya kandidat {1, 2, 3} -> pasangan {1, 2} bisa dicoret dari sel 2.
      const board = new Array<number>(CELL_COUNT).fill(0)
      // Isi sel 3..8 di Baris 0 dengan 4, 5, 6, 7, 8, 9 -> menyisakan kandidat {1, 2, 3} di sel 0, 1, 2
      board[3] = 4
      board[4] = 5
      board[5] = 6
      board[6] = 7
      board[7] = 8
      board[8] = 9
      // Taruh angka 3 di kolom 0 (sel 27) dan kolom 1 (sel 28) -> sel 0 & 1 tinggal {1, 2}
      // Tapi pastikan angka 3 di baris 0 tidak jadi hidden single di sel 2? Oh! Kalau 3 cuma bisa di sel 2,
      // itu Hidden Single! Supaya bukan hidden single, sisakan sel 2 dan 3 kosong dengan 3 & 4!
      board[3] = 0 // sekarang Baris 0 kosong di sel 0, 1, 2, 3 dengan sisa {1, 2, 3, 4}
      // Tutup 3 & 4 di kolom 0 (kotak 3 & 6) dan kolom 1 (kotak 6 & 3) tanpa konflik kotak
      board[27] = 3 // baris 3, kol 0 (kotak 3)
      board[63] = 4 // baris 7, kol 0 (kotak 6)
      board[37] = 4 // baris 4, kol 1 (kotak 3)
      board[55] = 3 // baris 6, kol 1 (kotak 6)
      // Sekarang di Baris 0:
      // - sel 0: kandidat {1, 2}
      // - sel 1: kandidat {1, 2}
      // - sel 2: kandidat {1, 2, 3, 4}
      // - sel 3: kandidat {1, 2, 3, 4}
      // Tidak ada naked single, hidden single, maupun pointing pair yang memblokir Naked Pair di Baris 0!
      const state = createStateFromBoard(board, VALID_SOLUTION, 'extreme')
      const hint = computeHint(state)
      expect(hint?.kind).toBe('naked-pair')
      expect(hint?.title).toBe('Teknik Naked Pair')
    })
  })

  describe('timer, jeda, dan reset', () => {
    it('menghitung waktu hanya saat status playing dan memformat MM:SS', () => {
      let state = createSudokuState('easy', createSeededRng(7))
      state = tickTimer(state)
      state = tickTimer(state)
      expect(state.elapsedSeconds).toBe(2)
      expect(formatTime(125)).toBe('02:05')

      state = pauseGame(state)
      expect(state.status).toBe('paused')
      expect(tickTimer(state).elapsedSeconds).toBe(2)

      state = togglePause(state)
      expect(state.status).toBe('playing')
    })

    it('mereset papan saat ini kembali ke kondisi awal puzzle', () => {
      const puzzle = [...VALID_SOLUTION]
      puzzle[0] = 0
      puzzle[1] = 0
      let state = createStateFromBoard(puzzle, VALID_SOLUTION)

      state = selectCell(state, 0)
      state = inputDigit(state, 5)
      state = tickTimer(state)
      state = requestHint(state)

      const reset = resetCurrentBoard(state)
      expect(reset.values).toEqual(puzzle)
      expect(reset.elapsedSeconds).toBe(0)
      expect(reset.hintsUsed).toBe(0)
      expect(reset.activeHint).toBeNull()
      expect(reset.history).toHaveLength(0)
    })
  })
})
