import { Link } from 'react-router-dom'
import { Logo } from './Logo'

export function Footer() {
  return (
    <footer className="site-footer">
      <div className="container">
        <div className="site-footer__inner">
          <div className="site-footer__brand">
            <Logo />
            <p className="site-footer__tagline">
              Game sederhana, dibuat dengan hati-hati.
            </p>
          </div>
          <nav aria-label="Navigasi kaki halaman">
            <ul className="site-footer__nav">
              <li>
                <Link to="/games">Game</Link>
              </li>
              <li>
                <Link to="/about">Tentang</Link>
              </li>
            </ul>
          </nav>
        </div>
        <div className="site-footer__bottom">
          <span>© {new Date().getFullYear()} Mino</span>
          <span>Dibuat dengan React dan Vite</span>
        </div>
      </div>
    </footer>
  )
}
