import { clsx } from 'clsx'
import type { ClothingCategory } from '@/types'

interface FilterOption {
  value: ClothingCategory | 'all'
  label: string
  emoji: string
}

const FILTERS: FilterOption[] = [
  { value: 'all', label: 'All', emoji: '✦' },
  { value: 'tops', label: 'Tops', emoji: '👕' },
  { value: 'bottoms', label: 'Bottoms', emoji: '👖' },
  { value: 'dresses', label: 'Dresses', emoji: '👗' },
  { value: 'outerwear', label: 'Outerwear', emoji: '🧥' },
  { value: 'shoes', label: 'Shoes', emoji: '👟' },
  { value: 'accessories', label: 'Accessories', emoji: '💍' },
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
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900',
              isActive
                ? 'bg-charcoal-900 text-cream-50'
                : 'bg-white text-charcoal-600 border border-cream-200 hover:border-charcoal-300 hover:text-charcoal-900'
            )}
          >
            <span className="text-sm leading-none">{filter.emoji}</span>
            {filter.label}
            <span
              className={clsx(
                'text-2xs tabular-nums px-1.5 py-0.5 rounded-full',
                isActive ? 'bg-white/20 text-cream-50' : 'bg-cream-200 text-charcoal-500'
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
