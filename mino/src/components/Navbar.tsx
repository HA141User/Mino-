import { NavLink } from 'react-router-dom'
import { Logo } from './Logo'

export function Navbar() {
  return (
    <header className="site-header">
      <div className="navbar container">
        <Logo />
        <nav aria-label="Navigasi utama">
          <ul className="navbar__links">
            <li>
              <NavLink
                to="/games"
                className={({ isActive }) =>
                  isActive ? 'navbar__link is-active' : 'navbar__link'
                }
              >
                Game
              </NavLink>
            </li>
            <li>
              <NavLink
                to="/about"
                className={({ isActive }) =>
                  isActive ? 'navbar__link is-active' : 'navbar__link'
                }
              >
                Tentang
              </NavLink>
            </li>
          </ul>
        </nav>
      </div>
    </header>
  )
}
