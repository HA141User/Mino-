import type { GameCategory } from '../data/games'
import type { CategoryFilterValue } from '../hooks/useGameCatalog'

type CategoryOption = {
  value: GameCategory
  label: string
  count: number
}

type CategoryFilterProps = {
  categories: CategoryOption[]
  value: CategoryFilterValue
  onChange: (value: CategoryFilterValue) => void
}

export function CategoryFilter({
  categories,
  value,
  onChange,
}: CategoryFilterProps) {
  const total = categories.reduce((sum, category) => sum + category.count, 0)

  const options: { value: CategoryFilterValue; label: string; count: number }[] =
    [{ value: 'all', label: 'Semua game', count: total }, ...categories]

  return (
    <div
      className="filter"
      role="group"
      aria-label="Saring game berdasarkan kategori"
    >
      {options.map((option) => (
        <button
          key={option.value}
          type="button"
          className="filter__button"
          aria-pressed={value === option.value}
          onClick={() => onChange(option.value)}
        >
          {option.label}
          <span className="filter__count">{option.count}</span>
        </button>
      ))}
    </div>
  )
}
