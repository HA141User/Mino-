export type GameCategory = 'arcade' | 'puzzle' | 'strategy'

export type GameArtKey = 'snake' | 'sudoku' | 'tic-tac-toe'

export type Game = {
  id: string
  slug: string
  title: string
  description: string
  category: GameCategory
  featured: boolean
  releaseDate: string
  thumbnail: GameArtKey
  path: string
}

export const categoryMeta: {
  value: GameCategory
  label: string
  description: string
}[] = [
  {
    value: 'arcade',
    label: 'Arcade',
    description: 'Game cepat dan fokus untuk jeda singkat.',
  },
  {
    value: 'puzzle',
    label: 'Puzzle',
    description: 'Pelankan tempo, perhatikan baik-baik, lalu pecahkan.',
  },
  {
    value: 'strategy',
    label: 'Strategi',
    description: 'Papan kecil, langkah yang matang.',
  },
]

export const games: Game[] = [
  {
    id: 'snake',
    slug: 'snake',
    title: 'Snake',
    description:
      'Pandu garis yang terus memanjang di atas grid, ambil apa yang bisa diambil, dan jangan menabrak dirimu sendiri.',
    category: 'arcade',
    featured: true,
    releaseDate: '2026-11-01',
    thumbnail: 'snake',
    path: '/games/snake',
  },
  {
    id: 'sudoku',
    slug: 'sudoku',
    title: 'Sudoku',
    description:
      'Duduk tenang dengan grid sembilan kali sembilan, lalu isi setiap baris, kolom, dan kotak dengan angka satu sampai sembilan.',
    category: 'puzzle',
    featured: true,
    releaseDate: '2026-10-28',
    thumbnail: 'sudoku',
    path: '/games/sudoku',
  },
  {
    id: 'tic-tac-toe',
    slug: 'tic-tac-toe',
    title: 'Tic-Tac-Toe',
    description:
      'Duel tiga sejajar yang cepat di atas grid sederhana. Mudah dipelajari, sulit ditinggalkan.',
    category: 'strategy',
    featured: false,
    releaseDate: '2026-10-20',
    thumbnail: 'tic-tac-toe',
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

export function getGameBySlug(slug: string | undefined): Game | undefined {
  return games.find((game) => game.slug === slug)
}
