import { Search } from 'lucide-react'

type SearchBarProps = {
  value: string
  onChange: (value: string) => void
  id?: string
  placeholder?: string
}

export function SearchBar({
  value,
  onChange,
  id = 'game-search',
  placeholder = 'Cari game',
}: SearchBarProps) {
  return (
    <div className="search">
      <label className="visually-hidden" htmlFor={id}>
        Cari game
      </label>
      <Search
        className="search__icon"
        size={18}
        strokeWidth={1.75}
        aria-hidden="true"
      />
      <input
        id={id}
        className="search__input"
        type="search"
        value={value}
        placeholder={placeholder}
        autoComplete="off"
        onChange={(event) => onChange(event.target.value)}
      />
    </div>
  )
}
