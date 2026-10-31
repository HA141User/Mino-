import { useMemo, useState } from 'react'
import type { Game, GameCategory } from '../data/games'
import { categoryMeta, getCategoryLabel } from '../data/games'

export type CategoryFilterValue = GameCategory | 'all'

export function useGameCatalog(
  games: Game[],
  initialCategory: CategoryFilterValue = 'all',
) {
  const [search, setSearch] = useState('')
  const [category, setCategory] = useState<CategoryFilterValue>(initialCategory)

  const query = search.trim().toLowerCase()

  const results = useMemo(() => {
    return games.filter((game) => {
      if (category !== 'all' && game.category !== category) {
        return false
      }

      if (!query) {
        return true
      }

      return [game.title, game.description, getCategoryLabel(game.category)].some(
        (value) => value.toLowerCase().includes(query),
      )
    })
  }, [games, category, query])

  const categories = useMemo(() => {
    return categoryMeta
      .map((entry) => ({
        ...entry,
        count: games.filter((game) => game.category === entry.value).length,
      }))
      .filter((entry) => entry.count > 0)
  }, [games])

  const clearFilters = () => {
    setSearch('')
    setCategory('all')
  }

  return {
    search,
    setSearch,
    category,
    setCategory,
    categories,
    results,
    clearFilters,
    isFiltered: query.length > 0 || category !== 'all',
  }
}
