export const BOARD_SIZE = 20
export const TICK_MS = 140

export type Point = {
  x: number
  y: number
}

export type Direction = 'up' | 'down' | 'left' | 'right'

export type SnakeStatus = 'idle' | 'running' | 'paused' | 'game-over'

export type SnakeState = {
  snake: Point[]
  food: Point
  direction: Direction
  queuedDirection: Direction
  score: number
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
    score: 0,
    status: 'idle',
  }
}

export function startGame(state: SnakeState): SnakeState {
  if (state.status === 'running') {
    return state
  }

  if (state.status === 'paused') {
    return { ...state, status: 'running' }
  }

  return { ...createInitialState(), status: 'running' }
}

export function restartGame(): SnakeState {
  return { ...createInitialState(), status: 'running' }
}

export function pauseGame(state: SnakeState): SnakeState {
  return state.status === 'running' ? { ...state, status: 'paused' } : state
}

export function togglePause(state: SnakeState): SnakeState {
  if (state.status === 'running') {
    return { ...state, status: 'paused' }
  }

  if (state.status === 'paused') {
    return { ...state, status: 'running' }
  }

  return state
}

export function queueDirection(
  state: SnakeState,
  direction: Direction,
): SnakeState {
  if (state.status === 'game-over') {
    return state
  }

  if (OPPOSITE[state.direction] === direction) {
    return state
  }

  return { ...state, queuedDirection: direction }
}

export function step(state: SnakeState): SnakeState {
  if (state.status !== 'running') {
    return state
  }

  const vector = DIRECTION_VECTORS[state.queuedDirection]
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

  if (hitsSelf) {
    return { ...state, direction: state.queuedDirection, status: 'game-over' }
  }

  const snake = willEat
    ? [nextHead, ...state.snake]
    : [nextHead, ...state.snake.slice(0, -1)]

  return {
    snake,
    food: willEat ? spawnFood(snake) : state.food,
    direction: state.queuedDirection,
    queuedDirection: state.queuedDirection,
    score: willEat ? state.score + 1 : state.score,
    status: 'running',
  }
}
