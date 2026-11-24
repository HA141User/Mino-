export type GameCategory = 'arcade' | 'puzzle' | 'strategy'

export type GameArtKey = 'snake' | 'sudoku' | 'tic-tac-toe'

export type GameStatus = 'coming-soon' | 'playable'

export type Game = {
  id: string
  slug: string
  title: string
  description: string
  category: GameCategory
  featured: boolean
  releaseDate: string
  thumbnail: GameArtKey
  status: GameStatus
  path: string
}

export const categoryMeta: {
  value: GameCategory
  label: string
  description: string
}[] = [
  {
    value: 'arcade',
    label: 'Arkade',
    description: 'Refleks cepat untuk jeda singkat.',
  },
  {
    value: 'puzzle',
    label: 'Teka-teki',
    description: 'Latihan logika yang tenang dan terukur.',
  },
  {
    value: 'strategy',
    label: 'Strategi',
    description: 'Papan sederhana dengan adu taktik singkat.',
  },
]

export const games: Game[] = [
  {
    id: 'snake',
    slug: 'snake',
    title: 'Snake',
    description:
      'Ular klasik di papan tembus dinding. Kumpulkan makanan dan buah bonus emas tanpa menabrak tubuh sendiri.',
    category: 'arcade',
    featured: true,
    releaseDate: '2026-11-01',
    thumbnail: 'snake',
    status: 'playable',
    path: '/games/snake',
  },
  {
    id: 'sudoku',
    slug: 'sudoku',
    title: 'Sudoku',
    description:
      'Teka-teki angka 1–9. Isi setiap baris, kolom, dan kotak 3×3 tanpa angka yang berulang.',
    category: 'puzzle',
    featured: true,
    releaseDate: '2026-11-24',
    thumbnail: 'sudoku',
    status: 'playable',
    path: '/games/sudoku',
  },
  {
    id: 'tic-tac-toe',
    slug: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    description:
      'Tiga simbol sejajar di papan 3×3. Singkat, klasik, dan mudah diulang.',
    category: 'strategy',
    featured: false,
    releaseDate: '2026-10-20',
    thumbnail: 'tic-tac-toe',
    status: 'coming-soon',
    path: '/games/tic-tac-toe',
  },
]

export function isGameCategory(value: string | undefined): value is GameCategory {
  return categoryMeta.some((category) => category.value === value)
}

export function getCategoryLabel(category: GameCategory): string {
  return categoryMeta.find((entry) => entry.value === category)?.label ?? category
}

export function getCategoryDescription(category: GameCategory): string {
  return (
    categoryMeta.find((entry) => entry.value === category)?.description ?? ''
  )
}

export function getGameStatusLabel(status: GameStatus): string {
  return status === 'playable' ? 'Siap dimainkan' : 'Segera hadir'
}

export function getGameBySlug(slug: string | undefined): Game | undefined {
  return games.find((game) => game.slug === slug)
}
