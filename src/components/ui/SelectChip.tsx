import { clsx } from 'clsx'

interface SelectChipProps {
  label: string
  selected: boolean
  onClick: () => void
  emoji?: string
  disabled?: boolean
}

export function SelectChip({ label, selected, onClick, emoji, disabled }: SelectChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={clsx(
        'inline-flex items-center gap-2 px-5 py-3 rounded-full text-sm font-medium',
        'border transition-all duration-200 select-none',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900 focus-visible:ring-offset-2',
        'disabled:opacity-40 disabled:cursor-not-allowed',
        selected
          ? 'bg-charcoal-900 text-cream-50 border-charcoal-900 shadow-soft'
          : 'bg-white text-charcoal-700 border-cream-300 hover:border-charcoal-400 hover:text-charcoal-900'
      )}
    >
      {emoji && <span className="text-base">{emoji}</span>}
      {label}
    </button>
  )
}
