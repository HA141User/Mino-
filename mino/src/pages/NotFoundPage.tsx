import { Link } from 'react-router-dom'

export function NotFoundPage() {
  return (
    <div className="not-found container">
      <p className="page-eyebrow">404</p>
      <h1>Belum ada apa pun di sini.</h1>
      <p className="not-found__description">
        Halaman ini belum dibuat, atau game-nya masih disiapkan.
      </p>
      <Link to="/games" className="button">
        Kembali ke semua game
      </Link>
    </div>
  )
}
