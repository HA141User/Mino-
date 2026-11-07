import { describe, expect, it } from 'vitest'
import {
  BOARD_SIZE,
  BONUS_FOOD_DURATION_TICKS,
  BONUS_FOOD_INTERVAL,
  BONUS_FOOD_POINTS,
  COUNTDOWN_START,
  DIFFICULTIES,
  createInitialState,
  getDifficulty,
  getSpeedLevel,
  getTickMs,
  isDifficulty,
  pauseGame,
  queueDirection,
  restartGame,
  spawnBonusFood,
  spawnFood,
  startGame,
  step,
  tickCountdown,
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
    bonusFood: null,
    direction: 'right',
    queuedDirection: 'right',
    directionQueue: [],
    score: 0,
    foodsEaten: 0,
    length: snake.length,
    countdown: 0,
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
    expect(state.countdown).toBe(COUNTDOWN_START)
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

  it('memunculkan buah bonus berwaktu setiap 5 makanan reguler (+1) dimakan', () => {
    const state = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      {
        score: 10,
        foodsEaten: BONUS_FOOD_INTERVAL - 1,
        food: { x: 6, y: 5 },
      },
    )

    const next = step(state)

    expect(next.foodsEaten).toBe(BONUS_FOOD_INTERVAL)
    expect(next.score).toBe(11)
    expect(next.bonusFood).not.toBeNull()
    expect(next.bonusFood?.timer).toBe(BONUS_FOOD_DURATION_TICKS)
    expect(next.bonusFood?.maxTimer).toBe(BONUS_FOOD_DURATION_TICKS)
    expect(next.bonusFood?.points).toBe(BONUS_FOOD_POINTS)
    expect(isOnSnake(next.snake, next.bonusFood!)).toBe(false)
    expect(
      next.bonusFood?.x === next.food.x && next.bonusFood?.y === next.food.y,
    ).toBe(false)
  })

  it('memakan buah bonus menambah skor +3 tetapi tidak menambah hitungan makanan reguler', () => {
    const state = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      {
        score: 5,
        foodsEaten: 5,
        bonusFood: { x: 6, y: 5, timer: 20, maxTimer: 30, points: 3 },
      },
    )

    const next = step(state)

    expect(next.score).toBe(8)
    expect(next.foodsEaten).toBe(5)
    expect(next.bonusFood).toBeNull()

    // Makan makanan reguler ke-6
    const afterFood6 = step({ ...next, food: { x: 7, y: 5 } })
    expect(afterFood6.foodsEaten).toBe(6)
    expect(afterFood6.score).toBe(9)
    expect(afterFood6.bonusFood).toBeNull()

    // Makan makanan reguler ke-7 (skor menjadi 10 yang merupakan kelipatan 5, tetapi belum 5 makanan reguler)
    const afterFood7 = step({ ...afterFood6, food: { x: 8, y: 5 } })
    expect(afterFood7.foodsEaten).toBe(7)
    expect(afterFood7.score).toBe(10)
    expect(afterFood7.bonusFood).toBeNull()
  })

  it('mengurangi timer buah bonus tiap langkah dan menghilangkannya saat habis', () => {
    const state = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      {
        bonusFood: { x: 10, y: 10, timer: 2, maxTimer: 30, points: 3 },
      },
    )

    const step1 = step(state)
    expect(step1.bonusFood?.timer).toBe(1)

    const step2 = step(step1)
    expect(step2.bonusFood).toBeNull()
  })

  it('memberikan poin ekstra (+3) dan menambah panjang saat memakan buah bonus', () => {
    const state = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      {
        score: 2,
        length: 3,
        bonusFood: { x: 6, y: 5, timer: 20, maxTimer: 30, points: 3 },
      },
    )

    const next = step(state)

    expect(next.score).toBe(5)
    expect(next.length).toBe(4)
    expect(next.bonusFood).toBeNull()
    expect(head(next)).toEqual({ x: 6, y: 5 })
  })

  it('spawnBonusFood menempatkan buah di luar badan ular dan makanan reguler', () => {
    const snake: Point[] = [
      { x: 0, y: 0 },
      { x: 1, y: 0 },
    ]
    const food: Point = { x: 2, y: 0 }

    const bonus = spawnBonusFood(snake, food)
    expect(bonus).not.toBeNull()
    expect(isOnSnake(snake, bonus!)).toBe(false)
    expect(bonus?.x === food.x && bonus?.y === food.y).toBe(false)
  })

  it.each(['idle', 'countdown', 'paused', 'game-over'] as const)(
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

  it('menampung dua belokan berturut-turut dalam antrean input buffer 2 langkah', () => {
    const state = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])

    const withFirst = queueDirection(state, 'up')
    const withSecond = queueDirection(withFirst, 'left')

    expect(withSecond.directionQueue).toEqual(['up', 'left'])
    expect(withSecond.queuedDirection).toBe('up')

    const step1 = step(withSecond)
    expect(step1.direction).toBe('up')
    expect(step1.directionQueue).toEqual(['left'])
    expect(step1.queuedDirection).toBe('left')
    expect(head(step1)).toEqual({ x: 5, y: 4 })

    const step2 = step(step1)
    expect(step2.direction).toBe('left')
    expect(step2.directionQueue).toEqual([])
    expect(step2.queuedDirection).toBe('left')
    expect(head(step2)).toEqual({ x: 4, y: 4 })
  })

  it('menolak arah yang berlawanan dengan belokan terakhir di antrean', () => {
    const state = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])

    const withFirst = queueDirection(state, 'up')
    const blocked = queueDirection(withFirst, 'down')

    expect(blocked.directionQueue).toEqual(['up'])
  })

  it('menggantikan belokan kedua jika giliran ketiga valid terhadap giliran pertama', () => {
    const state = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])

    const q1 = queueDirection(state, 'up')
    const q2 = queueDirection(q1, 'left')
    const q3 = queueDirection(q2, 'right')

    expect(q3.directionQueue).toEqual(['up', 'right'])
  })

  it('mengabaikan input yang identik dengan giliran terakhir', () => {
    const state = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])

    const q1 = queueDirection(state, 'up')
    const q2 = queueDirection(q1, 'up')

    expect(q2.directionQueue).toEqual(['up'])
  })

  it('memungkinkan pemilihan arah awal saat hitung mundur dan menolak arah leher', () => {
    const counting = stateWith(
      [
        { x: 8, y: 10 },
        { x: 7, y: 10 },
        { x: 6, y: 10 },
      ],
      { status: 'countdown', countdown: 3 },
    )

    const changed = queueDirection(counting, 'down')
    expect(changed.queuedDirection).toBe('down')
    expect(changed.directionQueue).toEqual(['down'])

    const invalid = queueDirection(counting, 'left')
    expect(invalid.queuedDirection).toBe('right')
    expect(invalid.directionQueue).toEqual([])
  })
})

describe('jeda', () => {
  it('menjeda permainan yang sedang berjalan atau hitung mundur', () => {
    const running = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])
    const counting = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      { status: 'countdown', countdown: 2 },
    )
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
    expect(pauseGame(counting).status).toBe('paused')
    expect(pauseGame(counting).countdown).toBe(2)
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

  it('melanjutkan hitung mundur dari angka terakhir saat dijeda', () => {
    const counting = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      { status: 'countdown', countdown: 2 },
    )

    const paused = togglePause(counting)
    const resumed = togglePause(paused)

    expect(paused.status).toBe('paused')
    expect(resumed.status).toBe('countdown')
    expect(resumed.countdown).toBe(2)
  })
})

describe('hitung mundur', () => {
  it('menghitung 3, 2, 1 lalu mulai berjalan', () => {
    let state: SnakeState = {
      ...stateWith([
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ]),
      status: 'countdown',
      countdown: COUNTDOWN_START,
    }

    for (let remaining = COUNTDOWN_START - 1; remaining > 0; remaining -= 1) {
      state = tickCountdown(state)
      expect(state.status).toBe('countdown')
      expect(state.countdown).toBe(remaining)
    }

    state = tickCountdown(state)

    expect(state.status).toBe('running')
    expect(state.countdown).toBe(0)
  })

  it('mengabaikan hitung mundur saat status bukan countdown', () => {
    const running = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])

    expect(tickCountdown(running)).toBe(running)
  })
})

describe('mode kesulitan', () => {
  it('menyediakan tiga mode dengan langkah makin cepat', () => {
    expect(DIFFICULTIES.map((mode) => mode.id)).toEqual([
      'santai',
      'normal',
      'cepat',
    ])
    expect(getDifficulty('santai').tickMs).toBeGreaterThan(
      getDifficulty('normal').tickMs,
    )
    expect(getDifficulty('normal').tickMs).toBeGreaterThan(
      getDifficulty('cepat').tickMs,
    )
  })

  it('memvalidasi id mode dari penyimpanan', () => {
    expect(isDifficulty('cepat')).toBe(true)
    expect(isDifficulty('normal')).toBe(true)
    expect(isDifficulty('kilat')).toBe(false)
    expect(isDifficulty(null)).toBe(false)
  })

  it('jatuh ke mode normal untuk id yang tidak dikenal', () => {
    expect(getDifficulty('kilat' as never).id).toBe('normal')
  })
})

describe('akselerasi bertahap', () => {
  it('mempercepat langkah setiap 5 makanan sesuai mode', () => {
    expect(getTickMs('santai', 0)).toBe(180)
    expect(getTickMs('santai', 5)).toBe(174)
    expect(getTickMs('normal', 0)).toBe(140)
    expect(getTickMs('normal', 5)).toBe(134)
    expect(getTickMs('normal', 10)).toBe(128)
    expect(getTickMs('cepat', 5)).toBe(95)
  })

  it('berhenti di batas bawah tiap mode', () => {
    expect(getTickMs('santai', 500)).toBe(100)
    expect(getTickMs('normal', 500)).toBe(80)
    expect(getTickMs('cepat', 500)).toBe(70)
  })

  it('tidak pernah lebih lambat dari kecepatan awal dan tidak turun', () => {
    for (const mode of DIFFICULTIES) {
      let previous = mode.tickMs

      for (let foods = 0; foods <= 200; foods += 5) {
        const tick = getTickMs(mode.id, foods)

        expect(tick).toBeLessThanOrEqual(previous)
        expect(tick).toBeGreaterThanOrEqual(mode.minTickMs)
        previous = tick
      }
    }
  })

  it('mengabaikan skor negatif dan mulai dari tingkat 1', () => {
    expect(getTickMs('normal', -10)).toBe(140)
    expect(getSpeedLevel('normal', -5)).toBe(1)
    expect(getSpeedLevel('normal', 0)).toBe(1)
  })

  it('menaikkan tingkat kecepatan hingga maksimum 5', () => {
    expect(getSpeedLevel('normal', 10)).toBe(2)
    expect(getSpeedLevel('normal', 20)).toBe(3)
    expect(getSpeedLevel('normal', 30)).toBe(4)
    expect(getSpeedLevel('normal', 40)).toBe(5)
    expect(getSpeedLevel('normal', 999)).toBe(5)
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

  it('membuat permainan baru dengan hitung mundur saat start dari idle', () => {
    const idle = createInitialState()
    const next = startGame(idle)

    expect(next.status).toBe('countdown')
    expect(next.countdown).toBe(COUNTDOWN_START)
    expect(next.score).toBe(0)
    expect(next.length).toBe(3)
    expect(next.snake).toHaveLength(3)
    expect(isOnSnake(next.snake, next.food)).toBe(false)
  })

  it('membuat permainan baru dengan hitung mundur saat start dari game over', () => {
    const over = stateWith(
      [
        { x: 5, y: 5 },
        { x: 4, y: 5 },
        { x: 3, y: 5 },
      ],
      { status: 'game-over', score: 12, length: 15, countdown: 0 },
    )

    const next = startGame(over)

    expect(next.status).toBe('countdown')
    expect(next.countdown).toBe(COUNTDOWN_START)
    expect(next.score).toBe(0)
    expect(next.length).toBe(3)
  })

  it('mengabaikan start saat permainan sudah berjalan atau hitung mundur', () => {
    const running = stateWith([
      { x: 5, y: 5 },
      { x: 4, y: 5 },
      { x: 3, y: 5 },
    ])
    const counting = { ...running, status: 'countdown' as const, countdown: 2 }

    expect(startGame(running)).toBe(running)
    expect(startGame(counting)).toBe(counting)
  })

  it('restart selalu membuat permainan baru dengan hitung mundur', () => {
    const next = restartGame()

    expect(next.status).toBe('countdown')
    expect(next.countdown).toBe(COUNTDOWN_START)
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
