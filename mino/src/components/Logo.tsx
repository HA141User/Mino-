import { Link } from 'react-router-dom'

export function Logo() {
  return (
    <Link to="/" className="brand" aria-label="Beranda Mino">
      <svg
        className="brand__mark"
        viewBox="0 0 32 32"
        role="presentation"
        aria-hidden="true"
      >
        <rect x="2" y="2" width="11" height="11" rx="2.5" fill="currentColor" />
        <rect x="19" y="2" width="11" height="11" rx="2.5" fill="currentColor" />
        <rect x="2" y="19" width="11" height="11" rx="2.5" fill="currentColor" />
        <circle
          className="brand__dot"
          cx="24.5"
          cy="24.5"
          r="5.5"
          strokeWidth="2"
        />
      </svg>
      <span className="brand__word">mino</span>
    </Link>
  )
}
