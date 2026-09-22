import { clsx } from 'clsx'
import type { ClothingCategory } from '@/types'

interface FilterOption {
  value: ClothingCategory | 'all'
  label: string
}

const FILTERS: FilterOption[] = [
  { value: 'all', label: 'All' },
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
]

interface CategoryFilterProps {
  active: ClothingCategory | 'all'
  counts: Record<string, number>
  onChange: (category: ClothingCategory | 'all') => void
}

export function CategoryFilter({ active, counts, onChange }: CategoryFilterProps) {
  return (
    <div className="flex gap-2 overflow-x-auto no-scrollbar py-1 -mx-1 px-1">
      {FILTERS.map((filter) => {
        const count = filter.value === 'all'
          ? Object.values(counts).reduce((a, b) => a + b, 0)
          : (counts[filter.value] ?? 0)
        const isActive = active === filter.value

        return (
          <button
            key={filter.value}
            onClick={() => onChange(filter.value)}
            className={clsx(
              'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap',
              'transition-all duration-200 flex-shrink-0',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-butter-yellow',
              isActive
                ? 'bg-dark-purple text-butter-yellow'
                : 'bg-white text-text-primary border border-text-primary/15 hover:border-text-primary/40 hover:text-text-primary'
            )}
          >
            {filter.label}
            <span
              className={clsx(
                'text-2xs tabular-nums px-1.5 py-0.5 rounded-full',
                isActive ? 'bg-white/20 text-butter-yellow/80' : 'bg-text-primary/8 text-text-muted'
              )}
            >
              {count}
            </span>
          </button>
        )
      })}
    </div>
  )
}
