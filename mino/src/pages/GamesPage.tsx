import { useEffect } from 'react'
import { useNavigate } from 'react-router-dom'
import { CategoryFilter } from '../components/CategoryFilter'
import { EmptyState } from '../components/EmptyState'
import { GameGrid } from '../components/GameGrid'
import { SearchBar } from '../components/SearchBar'
import type { GameCategory } from '../data/games'
import {
  games,
  getCategoryDescription,
  getCategoryLabel,
} from '../data/games'
import type { CategoryFilterValue } from '../hooks/useGameCatalog'
import { useGameCatalog } from '../hooks/useGameCatalog'

type GamesPageProps = {
  category?: GameCategory
}

export function GamesPage({ category: routeCategory }: GamesPageProps) {
  const navigate = useNavigate()
  const activeCategory: CategoryFilterValue = routeCategory ?? 'all'

  const {
    search,
    setSearch,
    category,
    setCategory,
    categories,
    results,
    clearFilters,
    isFiltered,
  } = useGameCatalog(games, activeCategory)

  useEffect(() => {
    setCategory(activeCategory)
  }, [activeCategory, setCategory])

  const title =
    activeCategory === 'all'
      ? 'Semua game'
      : `Game ${getCategoryLabel(activeCategory)}`

  const description =
    activeCategory === 'all'
      ? 'Semua game dalam koleksi, di satu tempat.'
      : getCategoryDescription(activeCategory)

  const handleCategoryChange = (value: CategoryFilterValue) => {
    navigate(value === 'all' ? '/games' : `/games/${value}`)
  }

  const handleClearFilters = () => {
    clearFilters()
    if (activeCategory !== 'all') {
      navigate('/games')
    }
  }

  return (
    <div className="page container">
      <header className="page-head">
        <p className="page-eyebrow">Katalog</p>
        <h1>{title}</h1>
        <p className="page-head__description">{description}</p>
      </header>

      <section className="catalog" aria-labelledby="games-list-title">
        <h2 id="games-list-title" className="visually-hidden">
          Daftar game
        </h2>

        <div className="catalog__controls">
          <div className="catalog__search">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <CategoryFilter
            categories={categories}
            value={category}
            onChange={handleCategoryChange}
          />
        </div>

        {isFiltered ? (
          <p className="catalog__status">
            {results.length} game ditemukan
          </p>
        ) : null}

        {results.length > 0 ? (
          <GameGrid games={results} />
        ) : (
          <EmptyState
            title="Game tidak ditemukan"
            description="Belum ada yang cocok dengan pencarian itu. Coba kata lain atau atur ulang filter."
            actionLabel="Hapus filter"
            onAction={handleClearFilters}
          />
        )}
      </section>
    </div>
  )
}
