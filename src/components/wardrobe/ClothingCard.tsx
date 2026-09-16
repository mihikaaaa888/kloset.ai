import { Heart } from 'lucide-react'
import { clsx } from 'clsx'
import type { ClothingItem } from '@/types'
import { colourNameToHex, isLightColour } from '@/lib/colourUtils'

const CATEGORY_EMOJI: Record<string, string> = {
  tops: '👕',
  bottoms: '👖',
  dresses: '👗',
  outerwear: '🧥',
  shoes: '👟',
  accessories: '💍',
}

const CATEGORY_LABEL: Record<string, string> = {
  tops: 'Top',
  bottoms: 'Bottom',
  dresses: 'Dress',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessories: 'Accessory',
}

interface ClothingCardProps {
  item: ClothingItem
  onClick: () => void
  onToggleFavourite: (e: React.MouseEvent) => void
}

export function ClothingCard({ item, onClick, onToggleFavourite }: ClothingCardProps) {
  const primaryColour = item.colour[0]
  const bgHex = primaryColour ? colourNameToHex(primaryColour) : '#EDE9E2'
  const isLight = isLightColour(bgHex)

  return (
    <div
      onClick={onClick}
      className="group relative rounded-3xl overflow-hidden bg-white shadow-card cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-medium"
    >
      {/* Image / Placeholder */}
      <div className="aspect-[3/4] relative overflow-hidden">
        {item.imageUrl ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <PlaceholderImage item={item} bgHex={bgHex} isLight={isLight} />
        )}

        {/* Favourite button */}
        <button
          onClick={onToggleFavourite}
          aria-label={item.isFavourite ? 'Remove from favourites' : 'Add to favourites'}
          className={clsx(
            'absolute top-3 right-3 w-8 h-8 rounded-full flex items-center justify-center',
            'transition-all duration-200',
            item.isFavourite
              ? 'bg-white shadow-soft text-rose-500'
              : 'bg-white/70 backdrop-blur-sm text-charcoal-400 opacity-0 group-hover:opacity-100 hover:text-rose-400'
          )}
        >
          <Heart
            size={14}
            className={item.isFavourite ? 'fill-rose-500' : ''}
          />
        </button>

        {/* Category pill overlay */}
        <div className="absolute bottom-3 left-3">
          <span className="text-2xs font-medium uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-charcoal-700">
            {CATEGORY_LABEL[item.category]}
          </span>
        </div>
      </div>

      {/* Card footer */}
      <div className="p-3 pb-4">
        <p className="text-sm font-medium text-charcoal-900 truncate">{item.name}</p>
        <div className="flex items-center gap-1.5 mt-1.5">
          {item.colour.slice(0, 4).map((c) => (
            <div
              key={c}
              title={c}
              className="w-3.5 h-3.5 rounded-full ring-1 ring-black/10 flex-shrink-0"
              style={{ backgroundColor: colourNameToHex(c) }}
            />
          ))}
          {item.colour.length > 4 && (
            <span className="text-2xs text-charcoal-400">+{item.colour.length - 4}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function PlaceholderImage({
  item,
  bgHex,
  isLight,
}: {
  item: ClothingItem
  bgHex: string
  isLight: boolean
}) {
  return (
    <div
      className="w-full h-full flex flex-col items-center justify-center gap-3"
      style={{ backgroundColor: bgHex }}
    >
      <span className="text-5xl select-none">{CATEGORY_EMOJI[item.category]}</span>
      <span
        className={clsx(
          'text-2xs font-medium uppercase tracking-widest opacity-50',
          isLight ? 'text-charcoal-700' : 'text-white'
        )}
      >
        {item.material || CATEGORY_LABEL[item.category]}
      </span>
    </div>
  )
}
