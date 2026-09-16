import { Check } from 'lucide-react'
import { clsx } from 'clsx'
import { isLightColour } from '@/lib/colourUtils'

interface ColourSwatchProps {
  name: string
  hex: string
  selected: boolean
  onClick: () => void
}

export function ColourSwatch({ name, hex, selected, onClick }: ColourSwatchProps) {
  const light = isLightColour(hex)

  return (
    <button
      type="button"
      onClick={onClick}
      title={name}
      className={clsx(
        'relative w-12 h-12 rounded-2xl transition-all duration-200',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900 focus-visible:ring-offset-2',
        selected ? 'scale-110 shadow-medium ring-2 ring-charcoal-900 ring-offset-2' : 'hover:scale-105'
      )}
      style={{ backgroundColor: hex }}
    >
      {selected && (
        <span
          className={clsx(
            'absolute inset-0 flex items-center justify-center rounded-2xl',
            light ? 'text-charcoal-900' : 'text-white'
          )}
        >
          <Check size={14} strokeWidth={2.5} />
        </span>
      )}
    </button>
  )
}
