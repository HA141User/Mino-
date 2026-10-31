import type { Game } from '../data/games'
import { GameCard } from './GameCard'

export function GameGrid({ games }: { games: Game[] }) {
  return (
    <ul className="game-grid">
      {games.map((game) => (
        <li key={game.id} className="game-grid__item">
          <GameCard game={game} />
        </li>
      ))}
    </ul>
  )
}
