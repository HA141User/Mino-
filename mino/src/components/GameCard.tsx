import { ArrowUpRight } from 'lucide-react'
import { Link } from 'react-router-dom'
import type { Game } from '../data/games'
import { getCategoryLabel, getGameStatusLabel } from '../data/games'
import { GameArt } from './GameArt'

export function GameCard({ game }: { game: Game }) {
  return (
    <Link to={game.path} className="game-card">
      <div className="game-card__art">
        <GameArt game={game} />
      </div>
      <div className="game-card__body">
        <div>
          <h3 className="game-card__title">{game.title}</h3>
          <p className="game-card__meta">
            {getCategoryLabel(game.category)}
            <span aria-hidden="true"> · </span>
            {getGameStatusLabel(game.status)}
          </p>
        </div>
        <span className="game-card__action" aria-hidden="true">
          <ArrowUpRight size={16} strokeWidth={1.75} />
        </span>
      </div>
    </Link>
  )
}
