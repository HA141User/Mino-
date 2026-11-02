import { lazy } from 'react'

export const gameRegistry = {
  snake: lazy(() =>
    import('./snake/SnakeGame').then((module) => ({
      default: module.SnakeGame,
    })),
  ),
}
