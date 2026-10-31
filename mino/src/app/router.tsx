import { createBrowserRouter } from 'react-router-dom'
import { AppLayout } from '../components/AppLayout'
import { AboutPage } from '../pages/AboutPage'
import { GamesPage } from '../pages/GamesPage'
import { HomePage } from '../pages/HomePage'
import { NotFoundPage } from '../pages/NotFoundPage'
import { LazyGamePage } from './LazyGamePage'

export const router = createBrowserRouter([
  {
    element: <AppLayout />,
    children: [
      {
        index: true,
        element: <HomePage />,
      },
      {
        path: 'games',
        element: <GamesPage />,
      },
      {
        path: 'games/arcade',
        element: <GamesPage category="arcade" />,
      },
      {
        path: 'games/puzzle',
        element: <GamesPage category="puzzle" />,
      },
      {
        path: 'games/strategy',
        element: <GamesPage category="strategy" />,
      },
      {
        path: 'games/:slug',
        element: <LazyGamePage />,
      },
      {
        path: 'about',
        element: <AboutPage />,
      },
      {
        path: '*',
        element: <NotFoundPage />,
      },
    ],
  },
])
