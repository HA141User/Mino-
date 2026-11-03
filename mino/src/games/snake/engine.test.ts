import { describe, expect, it } from 'vitest'
import {
  BOARD_SIZE,
  createInitialState,
  pauseGame,
  queueDirection,
  restartGame,
  spawnFood,
  startGame,
  step,
  togglePause,
} from './engine'
import type { Point, SnakeState } from './engine'

function stateWith(
  snake: Point[],
  overrides: Partial<SnakeState> = {},
): SnakeState {
  return {
    snake: snake.map((point) => ({ ...point })),
    food: { x: 19, y: 19 },
    direction: 'right',
    queuedDirection: 'right',
    score: 0,
    length: snake.length,
    status: 'running',
    ...overrides,
  }
}

function isOnSnake(snake: Point[], point: Point): boolean {
  return snake.some(
    (segment) => segment.x === point.x && segment.y === point.y,
  )
}

function head(state: SnakeState): Point {
  return state.snake[0]
}

describe('createInitialState', () => {
  it('memulai ular di tengah papan dengan status idle', () => {
    const state = createInitialState()

    expect(state.status).toBe('idle')
    expect(state.direction).toBe('right')
    expect(state.queuedDirection).toBe('right')
    expect(state.snake).toHaveLength(3)
    expect(state.length).toBe(3)
    expect(state.score).toBe(0)
    expect(isOnSnake(state.snake, state.food)).toBe(false)
  })

  it('menempatkan makanan di luar badan ular', () => {
    for (let attempt = 0; attempt < 20; attempt += 1) {
      const state = createInitialState()
      expect(isOnSnake(state.snake, state.food)).toBe(false)
    }
  })
})

describe('step: gerak dan tepi papan', () => {
  it('memakai arah antrean dan memperbarui arah aktif', () => {
    const state = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      { food: { x: 10, y: 10 }, queuedDirection: 'up' },
    )

    const next = step(state)

    expect(head(next)).toEqual({ x: 5, y: 4 })
    expect(next.direction).toBe('up')
    expect(next.queuedDirection).toBe('up')
  })

  it('keluar dari sisi kanan dan muncul di kiri', () => {
    const state = stateWith(
      [
        { x: BOARD_SIZE - 1, y: 10 },
        { x: 18, y: 10 },
        { x: 17, y: 10 },
      ],
      { food: { x: 5, y: 5 } },
    )

    expect(head(step(state))).toEqual({ x: 0, y: 10 })
  })

  it('keluar dari sisi kiri dan muncul di kanan', () => {
    const state = stateWith(
      [
        { x: 0, y: 10 },
        { x: 1, y: 10 },
        { x: 2, y: 10 },
      ],
      { direction: 'left', queuedDirection: 'left', food: { x: 5, y: 5 } },
    )

    expect(head(step(state))).toEqual({ x: BOARD_SIZE - 1, y: 10 })
  })

  it('keluar dari sisi atas dan muncul di bawah', () => {
    const state = stateWith(
      [
        { x: 5, y: 0 },
        { x: 5, y: 1 },
        { x: 5, y: 2 },
      ],
      { direction: 'up', queuedDirection: 'up', food: { x: 10, y: 10 } },
    )

    expect(head(step(state))).toEqual({ x: 5, y: BOARD_SIZE - 1 })
  })

  it('keluar dari sisi bawah dan muncul di atas', () => {
    const state = stateWith(
      [
        { x: 5, y: BOARD_SIZE - 1 },
        { x: 5, y: 18 },
        { x: 5, y: 17 },
      ],
      { direction: 'down', queuedDirection: 'down', food: { x: 10, y: 10 } },
    )

    expect(head(step(state))).toEqual({ x: 5, y: 0 })
  })
})

describe('step: makan dan tabrakan', () => {
  it('menambah panjang dan skor saat makan', () => {
    const state = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      { food: { x: 6, y: 5 } },
    )

    const next = step(state)

    expect(next.score).toBe(1)
    expect(next.length).toBe(4)
    expect(next.snake).toEqual([
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])
    expect(next.status).toBe('running')
    expect(isOnSnake(next.snake, next.food)).toBe(false)
  })

  it('mempertahankan panjang, skor, dan makanan saat tidak makan', () => {
    const state = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      { food: { x: 10, y: 10 } },
    )

    const next = step(state)

    expect(next.score).toBe(0)
    expect(next.length).toBe(3)
    expect(next.snake).toEqual([
      { x: 6, y: 5 },
      { x: 5, y: 5 },
      { x: 4, y: 5 },
    ])
    expect(next.food).toBe(state.food)
  })

  it('mengakhiri permainan saat kepala menabrak badan', () => {
    const state = stateWith(
      [
        { x: 5, y: 5 },
        { x: 5, y: 6 },
        { x: 4, y: 6 },
        { x: 4, y: 5 },
        { x: 4, y: 4 },
      ],
      {
        direction: 'down',
        queuedDirection: 'down',
        food: { x: 10, y: 10 },
      },
    )

    const next = step(state)

    expect(next.status).toBe('game-over')
    expect(next.snake).toEqual(state.snake)
    expect(next.score).toBe(0)
    expect(next.length).toBe(state.length)
  })

  it('mengizinkan gerak ke sel yang ditinggalkan ekor', () => {
    const state = stateWith(
      [
        { x: 5, y: 5 },
        { x: 6, y: 5 },
        { x: 6, y: 6 },
        { x: 5, y: 6 },
      ],
      {
        direction: 'down',
        queuedDirection: 'down',
        food: { x: 10, y: 10 },
      },
    )

    const next = step(state)

    expect(next.status).toBe('running')
    expect(head(next)).toEqual({ x: 5, y: 6 })
    expect(next.length).toBe(4)
  })

  it.each(['idle', 'paused', 'game-over'] as const)(
    'mengabaikan langkah saat status %s',
    (status) => {
      const state = stateWith(
        [
          { x: 5, y: 5 },
          { x: 4, y: 5 },
          { x: 3, y: 5 },
        ],
        { status },
      )

      expect(step(state)).toBe(state)
    },
  )
})

describe('queueDirection', () => {
  it('menolak arah berlawanan', () => {
    const state = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])

    expect(queueDirection(state, 'left').queuedDirection).toBe('right')
  })

  it('menerima arah tegak lurus', () => {
    const state = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])

    expect(queueDirection(state, 'up').queuedDirection).toBe('up')
  })

  it('mempertahankan antrean sah saat arah berlawanan ditekan', () => {
    const state = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])

    const queued = queueDirection(state, 'up')
    const blocked = queueDirection(queued, 'left')

    expect(blocked.queuedDirection).toBe('up')
  })

  it('mengabaikan perubahan arah saat permainan selesai', () => {
    const state = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      { status: 'game-over' },
    )

    expect(queueDirection(state, 'up')).toBe(state)
  })
})

describe('jeda', () => {
  it('hanya menjeda permainan yang sedang berjalan', () => {
    const running = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])
    const paused = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      { status: 'paused' },
    )
    const idle = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      { status: 'idle' },
    )

    expect(pauseGame(running).status).toBe('paused')
    expect(pauseGame(paused)).toBe(paused)
    expect(pauseGame(idle)).toBe(idle)
  })

  it('toggle jeda bekerja bolak-balik hanya saat berjalan atau jeda', () => {
    const running = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])
    const paused = togglePause(running)

    expect(paused.status).toBe('paused')
    expect(togglePause(paused).status).toBe('running')

    const idle = { ...running, status: 'idle' as const }
    const over = { ...running, status: 'game-over' as const }

    expect(togglePause(idle)).toBe(idle)
    expect(togglePause(over)).toBe(over)
  })
})

describe('start dan restart', () => {
  it('melanjutkan permainan tanpa mengubah papan saat start dari jeda', () => {
    const paused = stateWith(
      [
        { x: 7, y: 8 },
        { x: 6, y: 8 },
        { x: 5, y: 8 },
      ],
      { status: 'paused', score: 4, length: 7 },
    )

    const resumed = startGame(paused)

    expect(resumed.status).toBe('running')
    expect(resumed.snake).toEqual(paused.snake)
    expect(resumed.food).toEqual(paused.food)
    expect(resumed.score).toBe(4)
  })

  it('membuat permainan baru saat start dari idle', () => {
    const idle = createInitialState()
    const next = startGame(idle)

    expect(next.status).toBe('running')
    expect(next.score).toBe(0)
    expect(next.length).toBe(3)
    expect(next.snake).toHaveLength(3)
    expect(isOnSnake(next.snake, next.food)).toBe(false)
  })

  it('membuat permainan baru saat start dari game over', () => {
    const over = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      { status: 'game-over', score: 12, length: 15 },
    )

    const next = startGame(over)

    expect(next.status).toBe('running')
    expect(next.score).toBe(0)
    expect(next.length).toBe(3)
  })

  it('mengabaikan start saat permainan sudah berjalan', () => {
    const running = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])

    expect(startGame(running)).toBe(running)
  })

  it('restart selalu membuat permainan baru yang berjalan', () => {
    const next = restartGame()

    expect(next.status).toBe('running')
    expect(next.score).toBe(0)
    expect(next.length).toBe(3)
    expect(next.direction).toBe('right')
    expect(isOnSnake(next.snake, next.food)).toBe(false)
  })
})

describe('spawnFood', () => {
  it('memilih sel bebas sesuai nilai acak', () => {
    const snake = [{ x: 0, y: 0 }]

    expect(spawnFood(snake, () => 0)).toEqual({ x: 1, y: 0 })
    expect(spawnFood(snake, () => 0.999999)).toEqual({
      x: BOARD_SIZE - 1,
      y: BOARD_SIZE - 1,
    })
  })

  it('tidak pernah menimpa badan ular', () => {
    const snake = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
      { x: 2, y: 0 },
      { x: 2, y: 1 },
    ]

    for (const random of [0, 0.25, 0.5, 0.75, 0.999999]) {
      expect(isOnSnake(snake, spawnFood(snake, () => random))).toBe(false)
    }
  })

  it('jatuh kembali ke posisi kepala saat papan penuh (perilaku saat ini)', () => {
    const snake: Point[] = []

    for (let y = 0; y < BOARD_SIZE; y += 1) {
      for (let x = 0; x < BOARD_SIZE; x += 1) {
        snake.push({ x, y })
      }
    }

    expect(spawnFood(snake, () => 0)).toEqual({ x: 0, y: 0 })
  })
})
