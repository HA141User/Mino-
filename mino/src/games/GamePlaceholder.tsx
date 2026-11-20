import { ArrowLeft } from 'lucide-react'
import { Link } from 'react-router-dom'
import { GameArt } from '../components/GameArt'
import type { Game } from '../data/games'

export function GamePlaceholder({ game }: { game: Game }) {
  return (
    <div className="game-stage">
      <div className="game-stage__frame">
        <GameArt game={game} />
      </div>
      <aside className="game-stage__panel" aria-labelledby="game-status-title">
        <p className="game-stage__eyebrow">Sedang disiapkan</p>
        <h2 id="game-status-title">Segera bisa dimainkan.</h2>
        <p className="game-stage__text">
          {game.title} sedang dikerjakan dengan antarmuka papan yang ringkas,
          dukungan keyboard dan layar sentuh, serta penyimpanan skor lokal.
        </p>
        <Link to="/games" className="button button--quiet">
          <ArrowLeft size={16} strokeWidth={1.75} aria-hidden="true" />
          <span>Kembali ke katalog</span>
        </Link>
      </aside>
    </div>
  )
}
