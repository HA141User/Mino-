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
    description: 'Refleks kilat buat jeda santai. Langsung tancap gas!',
  },
  {
    value: 'puzzle',
    label: 'Teka-teki',
    description: 'Asah otak santai sambil nikmatin kopi.',
  },
  {
    value: 'strategy',
    label: 'Strategi',
    description: 'Papan simpel, adu taktik matang.',
  },
]

export const games: Game[] = [
  {
    id: 'snake',
    slug: 'snake',
    title: 'Snake',
    description:
      'Klasik ular rakus. Lahap apel, kejar buah bonus emas, dan awas jangan sampai gigit ekor sendiri!',
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
      'Asah otak tanpa ribet. Masukin angka 1–9, pantang ada yang kembar di satu baris atau kotak!',
    category: 'puzzle',
    featured: true,
    releaseDate: '2026-10-28',
    thumbnail: 'sudoku',
    status: 'coming-soon',
    path: '/games/sudoku',
  },
  {
    id: 'tic-tac-toe',
    slug: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    description:
      'Adu taktik 3 sejajar bareng kawan atau bot. Klasik, cepet, dan nagih!',
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
  return status === 'playable' ? 'Gas Main' : 'Segera Hadir'
}

export function getGameBySlug(slug: string | undefined): Game | undefined {
  return games.find((game) => game.slug === slug)
}
