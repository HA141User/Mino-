import { useState } from 'react'
import { ArrowRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CategoryFilter } from '../components/CategoryFilter'
import { EmptyState } from '../components/EmptyState'
import { GameGrid } from '../components/GameGrid'
import { SearchBar } from '../components/SearchBar'
import { SectionHeading } from '../components/SectionHeading'
import { games } from '../data/games'
import { useGameCatalog } from '../hooks/useGameCatalog'

function readBestScore(): number {
  if (typeof window === 'undefined') {
    return 0
  }
  try {
    const normal = window.localStorage.getItem('mino:snake:normal:best')
    const legacy = window.localStorage.getItem('mino:snake:best')
    const val = Number.parseInt(normal || legacy || '0', 10)
    return Number.isFinite(val) && val > 0 ? val : 0
  } catch {
    return 0
  }
}

export function HomePage() {
  const {
    search,
    setSearch,
    category,
    setCategory,
    categories,
    results,
    clearFilters,
    isFiltered,
  } = useGameCatalog(games)

  const [bestScore] = useState(readBestScore)
  const playableGame = games.find((game) => game.status === 'playable')

  return (
    <>
      <section className="hero container">
        <div className="hero__content">
          <p className="hero__eyebrow">Portal game ringan</p>
          <h1 className="hero__title">Santai sejenak, langsung main.</h1>
          <p className="hero__lede">
            Koleksi game web sederhana tanpa iklan, tanpa akun, dan siap
            dimainkan langsung di peramban.
          </p>
          <div className="hero__search">
            <SearchBar
              value={search}
              onChange={setSearch}
              placeholder="Cari game (Snake, Sudoku, Tic-Tac-Toe)..."
            />
          </div>
          {playableGame ? (
            <div className="hero__quick">
              <Link to={playableGame.path} className="hero__quick-link">
                <span>Langsung main: {playableGame.title}</span>
                <ArrowRight size={15} aria-hidden="true" />
              </Link>
              {bestScore > 0 ? (
                <span className="hero__quick-record">
                  Rekor terbaik: {bestScore}
                </span>
              ) : null}
            </div>
          ) : null}
        </div>
      </section>

      <section
        id="katalog"
        className="catalog container"
        aria-labelledby="catalog-title"
      >
        <SectionHeading
          id="catalog-title"
          title="Koleksi Game"
          description="Pilih game yang ingin kamu mainkan."
        />

        <div className="catalog__controls">
          <CategoryFilter
            categories={categories}
            value={category}
            onChange={setCategory}
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
            description="Belum ada yang cocok dengan pencarian itu. Coba kata lain atau reset filter."
            actionLabel="Reset filter"
            onAction={clearFilters}
          />
        )}
      </section>
    </>
  )
}
