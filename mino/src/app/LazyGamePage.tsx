import { lazy, Suspense } from 'react'
import { RouteFallback } from '../components/RouteFallback'

const GamePage = lazy(() =>
  import('../pages/GamePage').then((module) => ({ default: module.GamePage })),
)

export function LazyGamePage() {
  return (
    <Suspense fallback={<RouteFallback />}>
      <GamePage />
    </Suspense>
  )
}
