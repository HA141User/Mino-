import type { ComponentType } from 'react'
import type { Game, GameArtKey } from '../data/games'

function SnakeScene() {
  return (
    <g>
      <rect width="200" height="160" fill="var(--color-sage)" />
      <path
        d="M40 0V160M80 0V160M120 0V160M160 0V160M0 40H200M0 80H200M0 120H200"
        stroke="var(--color-ink)"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
      <g fill="var(--color-ink)">
        <rect x="28" y="96" width="16" height="16" rx="3" />
        <rect x="44" y="96" width="16" height="16" rx="3" />
        <rect x="60" y="96" width="16" height="16" rx="3" />
        <rect x="60" y="80" width="16" height="16" rx="3" />
        <rect x="60" y="64" width="16" height="16" rx="3" />
        <rect x="76" y="64" width="16" height="16" rx="3" />
        <rect x="92" y="64" width="16" height="16" rx="3" />
        <rect x="108" y="64" width="16" height="16" rx="3" />
        <rect x="108" y="80" width="16" height="16" rx="3" />
        <rect x="108" y="96" width="16" height="16" rx="3" />
        <rect x="124" y="94" width="20" height="20" rx="4" />
      </g>
      <circle cx="138" cy="102" r="2.5" fill="var(--color-sage)" />
      <circle
        cx="158"
        cy="50"
        r="8"
        fill="var(--color-clay)"
        stroke="var(--color-ink)"
        strokeWidth="2"
      />
    </g>
  )
}

function SudokuScene() {
  const digits = [
    { x: 64, y: 44, value: '5' },
    { x: 136, y: 44, value: '3' },
    { x: 100, y: 80, value: '7' },
    { x: 64, y: 116, value: '2' },
    { x: 136, y: 116, value: '8' },
  ]

  return (
    <g>
      <rect width="200" height="160" fill="var(--color-clay)" />
      <rect
        x="45"
        y="27"
        width="110"
        height="110"
        rx="2"
        fill="var(--color-surface)"
      />
      <rect
        x="81.5"
        y="63.5"
        width="37"
        height="37"
        fill="var(--color-sage)"
        opacity="0.9"
      />
      <g stroke="var(--color-ink)" strokeOpacity="0.16" strokeWidth="1">
        <path d="M81.5 27V137M118.5 27V137M45 63.5H155M45 100.5H155" />
      </g>
      <rect
        x="45"
        y="27"
        width="110"
        height="110"
        rx="2"
        fill="none"
        stroke="var(--color-ink)"
        strokeOpacity="0.5"
        strokeWidth="2"
      />
      <g
        fill="var(--color-ink)"
        fontFamily="IBM Plex Mono, monospace"
        fontSize="16"
        fontWeight="500"
        textAnchor="middle"
        dominantBaseline="central"
      >
        {digits.map((digit) => (
          <text key={digit.value} x={digit.x} y={digit.y}>
            {digit.value}
          </text>
        ))}
      </g>
      <circle cx="161" cy="118" r="4" fill="var(--color-ink)" />
    </g>
  )
}

function TicTacToeScene() {
  return (
    <g>
      <rect width="200" height="160" fill="var(--color-blue-gray)" />
      <g stroke="var(--color-ink)" strokeOpacity="0.3" strokeWidth="2">
        <path d="M82 24V136M118 24V136M46 60H154M46 98H154" />
      </g>
      <g
        stroke="var(--color-ink)"
        strokeWidth="5"
        strokeLinecap="round"
        fill="none"
      >
        <path d="M55 31L73 49M73 31L55 49" />
        <circle cx="100" cy="79" r="11" />
        <path d="M127 105L145 123M145 105L127 123" />
      </g>
      <rect x="46" y="24" width="12" height="12" rx="2" fill="var(--color-sage)" />
    </g>
  )
}

function FallbackScene() {
  return (
    <g>
      <rect width="200" height="160" fill="var(--color-lilac)" />
      <path
        d="M40 0V160M80 0V160M120 0V160M160 0V160M0 40H200M0 80H200M0 120H200"
        stroke="var(--color-ink)"
        strokeOpacity="0.08"
        strokeWidth="1"
      />
      <rect
        x="78"
        y="58"
        width="44"
        height="44"
        rx="5"
        fill="none"
        stroke="var(--color-ink)"
        strokeOpacity="0.5"
        strokeWidth="2"
      />
      <circle
        cx="100"
        cy="80"
        r="7"
        fill="var(--color-sage)"
        stroke="var(--color-ink)"
        strokeWidth="2"
      />
    </g>
  )
}

const scenes: Record<GameArtKey, ComponentType> = {
  snake: SnakeScene,
  sudoku: SudokuScene,
  'tic-tac-toe': TicTacToeScene,
}

export function GameArt({ game }: { game: Game }) {
  const Scene = scenes[game.thumbnail] ?? FallbackScene

  return (
    <svg
      className="game-art"
      viewBox="0 0 200 160"
      preserveAspectRatio="xMidYMid slice"
      role="presentation"
      aria-hidden="true"
    >
      <Scene />
    </svg>
  )
}
