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
          {game.title} sedang dibuat dengan teliti seperti bagian lain Mino. Ini
          yang bisa kamu harapkan saat game ini dibuka.
        </p>
        <ul className="game-stage__list">
          <li>Kontrol keyboard dan sentuh</li>
          <li>Skor, timer, dan mulai ulang cepat</li>
          <li>Tanpa akun</li>
        </ul>
      </aside>
    </div>
  )
}
