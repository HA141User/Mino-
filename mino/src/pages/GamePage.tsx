import { Link, useParams } from 'react-router-dom'
import { GameGrid } from '../components/GameGrid'
import { SectionHeading } from '../components/SectionHeading'
import { games, getCategoryLabel, getGameBySlug } from '../data/games'
import { GamePlaceholder } from '../games/GamePlaceholder'
import { NotFoundPage } from './NotFoundPage'

export function GamePage() {
  const { slug } = useParams()
  const game = getGameBySlug(slug)

  if (!game) {
    return <NotFoundPage />
  }

  const related = games.filter((entry) => entry.slug !== game.slug).slice(0, 3)

  return (
    <div className="game-page container">
      <nav className="breadcrumb" aria-label="Jalur navigasi">
        <Link to="/games">Game</Link>
        <span aria-hidden="true">/</span>
        <span aria-current="page">{game.title}</span>
      </nav>

      <header className="game-header">
        <p className="page-eyebrow">{getCategoryLabel(game.category)}</p>
        <h1>{game.title}</h1>
        <p className="game-header__description">{game.description}</p>
      </header>

      <GamePlaceholder game={game} />

      {related.length > 0 ? (
        <section className="game-related" aria-labelledby="related-title">
          <SectionHeading
            id="related-title"
            title="Game lain"
            description="Beberapa hal lain yang bisa ditunggu."
          />
          <GameGrid games={related} />
        </section>
      ) : null}
    </div>
  )
}
