export const BOARD_SIZE = 20

export const COUNTDOWN_START = 3
export const COUNTDOWN_STEP_MS = 700
export const SPEED_STEP_FOODS = 5
export const SPEED_MAX_LEVEL = 5
export const INPUT_BUFFER_LIMIT = 2

export type Difficulty = 'santai' | 'normal' | 'cepat'

export type DifficultyConfig = {
  id: Difficulty
  label: string
  tickMs: number
  stepMs: number
  minTickMs: number
  description: string
}

export const DIFFICULTIES: DifficultyConfig[] = [
  {
    id: 'santai',
    label: 'Santai',
    tickMs: 180,
    stepMs: 6,
    minTickMs: 100,
    description: 'Langkah lebih lambat untuk pemanasan.',
  },
  {
    id: 'normal',
    label: 'Normal',
    tickMs: 140,
    stepMs: 6,
    minTickMs: 80,
    description: 'Ritme standar permainan.',
  },
  {
    id: 'cepat',
    label: 'Cepat',
    tickMs: 100,
    stepMs: 5,
    minTickMs: 70,
    description: 'Langkah cepat, ruang salah kecil.',
  },
]

export const DEFAULT_DIFFICULTY: Difficulty = 'normal'

export function getDifficulty(id: Difficulty): DifficultyConfig {
  return (
    DIFFICULTIES.find((difficulty) => difficulty.id === id) ?? DIFFICULTIES[1]
  )
}

export function isDifficulty(value: unknown): value is Difficulty {
  return DIFFICULTIES.some((difficulty) => difficulty.id === value)
}

export function getTickMs(difficulty: Difficulty, foods: number): number {
  const config = getDifficulty(difficulty)
  const levels = Math.floor(Math.max(foods, 0) / SPEED_STEP_FOODS)

  return Math.max(config.minTickMs, config.tickMs - levels * config.stepMs)
}

export function getSpeedLevel(difficulty: Difficulty, foods: number): number {
  const config = getDifficulty(difficulty)
  const range = config.tickMs - config.minTickMs

  if (range <= 0) {
    return SPEED_MAX_LEVEL
  }

  const current = getTickMs(difficulty, foods)
  const progress = (config.tickMs - current) / range
  const level = 1 + Math.floor(progress * SPEED_MAX_LEVEL)

  return Math.min(SPEED_MAX_LEVEL, Math.max(1, level))
}

export type Point = {
  x: number
  y: number
}

export type Direction = 'up' | 'down' | 'left' | 'right'

export type SnakeStatus =
  | 'idle'
  | 'countdown'
  | 'running'
  | 'paused'
  | 'game-over'

export type SnakeState = {
  snake: Point[]
  food: Point
  direction: Direction
  queuedDirection: Direction
  directionQueue: Direction[]
  score: number
  length: number
  countdown: number
  status: SnakeStatus
}

const DIRECTION_VECTORS: Record<Direction, Point> = {
  up: { x: 0, y: -1 },
  down: { x: 0, y: 1 },
  left: { x: -1, y: 0 },
  right: { x: 1, y: 0 },
}

const OPPOSITE: Record<Direction, Direction> = {
  up: 'down',
  down: 'up',
  left: 'right',
  right: 'left',
}

const INITIAL_SNAKE: Point[] = [
  { x: 8, y: 10 },
  { x: 7, y: 10 },
  { x: 6, y: 10 },
]

function pointKey(point: Point): string {
  return `${point.x},${point.y}`
}

export function spawnFood(snake: Point[], random = Math.random): Point {
  const occupied = new Set(snake.map(pointKey))
  const free: Point[] = []

  for (let y = 0; y < BOARD_SIZE; y += 1) {
    for (let x = 0; x < BOARD_SIZE; x += 1) {
      if (!occupied.has(`${x},${y}`)) {
        free.push({ x, y })
      }
    }
  }

  if (free.length === 0) {
    return { ...snake[0] }
  }

  return free[Math.floor(random() * free.length)]
}

export function createInitialState(): SnakeState {
  const snake = INITIAL_SNAKE.map((point) => ({ ...point }))

  return {
    snake,
    food: spawnFood(snake),
    direction: 'right',
    queuedDirection: 'right',
    directionQueue: [],
    score: 0,
    length: snake.length,
    countdown: COUNTDOWN_START,
    status: 'idle',
  }
}

export function startGame(state: SnakeState): SnakeState {
  if (state.status === 'running' || state.status === 'countdown') {
    return state
  }

  if (state.status === 'paused') {
    return {
      ...state,
      status: state.countdown > 0 ? 'countdown' : 'running',
    }
  }

  return { ...createInitialState(), status: 'countdown' }
}

export function restartGame(): SnakeState {
  return { ...createInitialState(), status: 'countdown' }
}

export function pauseGame(state: SnakeState): SnakeState {
  return state.status === 'running' || state.status === 'countdown'
    ? { ...state, status: 'paused' }
    : state
}

export function togglePause(state: SnakeState): SnakeState {
  if (state.status === 'running' || state.status === 'countdown') {
    return { ...state, status: 'paused' }
  }

  if (state.status === 'paused') {
    return {
      ...state,
      status: state.countdown > 0 ? 'countdown' : 'running',
    }
  }

  return state
}

export function tickCountdown(state: SnakeState): SnakeState {
  if (state.status !== 'countdown' || state.countdown <= 0) {
    return state
  }

  const countdown = state.countdown - 1

  return {
    ...state,
    countdown,
    status: countdown === 0 ? 'running' : 'countdown',
  }
}

export function queueDirection(
  state: SnakeState,
  direction: Direction,
): SnakeState {
  if (state.status === 'game-over') {
    return state
  }

  // Saat idle atau countdown: ular belum bergerak, pemain mengatur arah awal
  if (state.status === 'idle' || state.status === 'countdown') {
    if (OPPOSITE[state.direction] === direction) {
      return state
    }

    return {
      ...state,
      directionQueue: [direction],
      queuedDirection: direction,
    }
  }

  // Saat running atau paused: gunakan buffer antrean hingga 2 giliran
  const queue =
    state.directionQueue && state.directionQueue.length > 0
      ? state.directionQueue
      : state.queuedDirection !== state.direction
        ? [state.queuedDirection]
        : []

  if (queue.length >= INPUT_BUFFER_LIMIT) {
    const firstDirection = queue[0]
    // Jika input baru valid terhadap giliran pertama (tegak lurus terhadap giliran pertama),
    // izinkan menggantikan giliran kedua.
    if (
      direction === firstDirection ||
      OPPOSITE[firstDirection] === direction ||
      direction === queue[1]
    ) {
      return state
    }

    const nextQueue = [firstDirection, direction]
    return {
      ...state,
      directionQueue: nextQueue,
      queuedDirection: nextQueue[0],
    }
  }

  const lastDirection =
    queue.length > 0 ? queue[queue.length - 1] : state.direction

  if (direction === lastDirection || OPPOSITE[lastDirection] === direction) {
    return state
  }

  const nextQueue = [...queue, direction]
  return {
    ...state,
    directionQueue: nextQueue,
    queuedDirection: nextQueue[0],
  }
}

export function step(state: SnakeState): SnakeState {
  if (state.status !== 'running') {
    return state
  }

  const queue =
    state.directionQueue && state.directionQueue.length > 0
      ? state.directionQueue
      : [state.queuedDirection]

  const nextDirection = queue[0]
  const vector = DIRECTION_VECTORS[nextDirection]
  const head = state.snake[0]
  const nextHead: Point = {
    x: (head.x + vector.x + BOARD_SIZE) % BOARD_SIZE,
    y: (head.y + vector.y + BOARD_SIZE) % BOARD_SIZE,
  }

  const willEat = nextHead.x === state.food.x && nextHead.y === state.food.y
  const body = willEat ? state.snake : state.snake.slice(0, -1)
  const hitsSelf = body.some(
    (segment) => segment.x === nextHead.x && segment.y === nextHead.y,
  )

  const remainingQueue = queue.slice(1)
  const nextQueuedDirection = remainingQueue[0] ?? nextDirection

  if (hitsSelf) {
    return {
      ...state,
      direction: nextDirection,
      queuedDirection: nextQueuedDirection,
      directionQueue: remainingQueue,
      status: 'game-over',
    }
  }

  const snake = willEat
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, -1)]

  return {
    snake,
    food: willEat ? spawnFood(snake) : state.food,
    direction: nextDirection,
    queuedDirection: nextQueuedDirection,
    directionQueue: remainingQueue,
    score: willEat ? state.score + 1 : state.score,
    length: snake.length,
    countdown: 0,
    status: 'running',
  }
}
