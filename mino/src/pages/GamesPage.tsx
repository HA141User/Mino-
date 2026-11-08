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
      ? 'Koleksi Game'
      : `Game ${getCategoryLabel(activeCategory)}`

  const description =
    activeCategory === 'all'
      ? 'Semua mini game Mino yang siap lo mainin langsung di browser.'
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
          <p className="catalog__status" aria-live="polite">
            Menampilkan {results.length} dari {games.length} game.
          </p>
        ) : null}

        {results.length > 0 ? (
          <GameGrid games={results} />
        ) : (
          <EmptyState
            title="Game tidak ditemukan"
            description="Belum ada game yang cocok sama pencarian lo. Coba kata lain atau reset filter."
            actionLabel="Reset filter"
            onAction={handleClearFilters}
          />
        )}
      </section>
    </div>
  )
}
