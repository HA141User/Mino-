import { CategoryFilter } from '../components/CategoryFilter'
import { EmptyState } from '../components/EmptyState'
import { GameGrid } from '../components/GameGrid'
import { SearchBar } from '../components/SearchBar'
import { SectionHeading } from '../components/SectionHeading'
import { games } from '../data/games'
import { useGameCatalog } from '../hooks/useGameCatalog'

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

  return (
    <>
      <section className="hero container">
        <p className="hero__eyebrow">Sudut kecil di internet</p>
        <h1 className="hero__title">Santai sejenak.</h1>
        <p className="hero__lede">
          Game sederhana, dibuat dengan hati-hati. Siap kapan pun.
        </p>
        <p className="hero__footnote">
          {games.length} game sedang disiapkan
          <span aria-hidden="true">·</span>
          Tanpa akun
          <span aria-hidden="true">·</span>
          Tanpa gangguan
        </p>
      </section>

      <section className="catalog container" aria-labelledby="catalog-title">
        <SectionHeading
          id="catalog-title"
          title="Semua game"
          description={
            isFiltered
              ? `Menampilkan ${results.length} dari ${games.length} game.`
              : `${games.length} game, dan masih akan bertambah.`
          }
        />

        <div className="catalog__controls">
          <div className="catalog__search">
            <SearchBar value={search} onChange={setSearch} />
          </div>
          <CategoryFilter
            categories={categories}
            value={category}
            onChange={setCategory}
          />
        </div>

        {results.length > 0 ? (
          <GameGrid games={results} />
        ) : (
          <EmptyState
            title="Game tidak ditemukan"
            description="Coba kata lain, atau hapus filter dan mulai lagi."
            actionLabel="Hapus filter"
            onAction={clearFilters}
          />
        )}
      </section>
    </>
  )
}
