import { Link } from 'react-router-dom'

type LogoMarkProps = {
  monochrome?: boolean
  size?: number
  compact?: boolean
}

export function LogoMark({
  monochrome = false,
  size = 26,
  compact = false,
}: LogoMarkProps) {
  const isCompact = compact || size <= 20

  return (
    <svg
      className="brand__mark"
      viewBox="0 0 32 32"
      style={{ width: size, height: size }}
      role="presentation"
      aria-hidden="true"
    >
      <rect x="2" y="2" width="11" height="11" rx="2.5" fill="currentColor" />
      <rect x="19" y="2" width="11" height="11" rx="2.5" fill="currentColor" />
      <rect x="2" y="19" width="11" height="11" rx="2.5" fill="currentColor" />
      <circle
        cx="24.5"
        cy="24.5"
        r={isCompact ? 6 : 5.5}
        fill={monochrome ? 'currentColor' : 'var(--color-sage)'}
        stroke="currentColor"
        strokeWidth={isCompact ? 2.75 : 2}
      />
    </svg>
  )
}

type LogoProps = {
  variant?: 'primary' | 'monochrome'
  size?: number
  showWordmark?: boolean
  compact?: boolean
}

export function Logo({
  variant = 'primary',
  size = 26,
  showWordmark = true,
  compact = false,
}: LogoProps) {
  return (
    <Link to="/" className="brand" aria-label="Beranda Mino">
      <LogoMark
        monochrome={variant === 'monochrome'}
        size={size}
        compact={compact}
      />
      {showWordmark ? <span className="brand__word">mino</span> : null}
    </Link>
  )
}
