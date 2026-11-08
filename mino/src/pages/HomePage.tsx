import { useState } from 'react'
import { ArrowRight, Trophy } from 'lucide-react'
import { Link } from 'react-router-dom'
import { CategoryFilter } from '../components/CategoryFilter'
import { EmptyState } from '../components/EmptyState'
import { GameArt } from '../components/GameArt'
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
  const featuredGame = games.find((game) => game.id === 'snake') ?? games[0]

  return (
    <>
      <section className="hero container">
        <div className="hero__grid">
          <div className="hero__content">
            <p className="hero__eyebrow">Arkade Santai No-Ribet</p>
            <h1 className="hero__title">Rehat bentar, gas push high score.</h1>
            <p className="hero__lede">
              Koleksi mini game retro yang ringan, tanpa iklan, dan langsung
              tancap gas di peramban lo.
            </p>
            <div className="hero__search">
              <SearchBar
                value={search}
                onChange={setSearch}
                placeholder="Cari game (Snake, Sudoku, dll)..."
              />
            </div>
            <p className="hero__footnote">
              <span> Langsung Main</span>
              <span aria-hidden="true">·</span>
              <span> Tanpa Login</span>
              <span aria-hidden="true">·</span>
              <span> Gratis</span>
            </p>
          </div>

          <div className="hero__spotlight">
            <div className="hero__spotlight-card">
              <div className="hero__spotlight-header">
                <span className="hero__spotlight-badge"> Game Pilihan</span>
                {bestScore > 0 ? (
                  <span className="hero__spotlight-record">
                    <Trophy size={13} aria-hidden="true" />
                    <span>Rekor: {bestScore} pts</span>
                  </span>
                ) : (
                  <span className="hero__spotlight-tag">Retro Arkade</span>
                )}
              </div>

              <div className="hero__spotlight-art">
                <GameArt game={featuredGame} />
              </div>

              <div className="hero__spotlight-body">
                <div>
                  <h2 className="hero__spotlight-title">{featuredGame.title}</h2>
                  <p className="hero__spotlight-desc">
                    {featuredGame.description}
                  </p>
                </div>

                <Link
                  to={featuredGame.path}
                  className="button hero__spotlight-btn"
                >
                  <span>Gas Main Sekarang</span>
                  <ArrowRight size={16} aria-hidden="true" />
                </Link>
              </div>
            </div>
          </div>
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
          description="Pilih game favorit lo dan mulai tanding."
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
