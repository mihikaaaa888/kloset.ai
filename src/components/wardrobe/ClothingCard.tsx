import { Heart } from 'lucide-react'
import { HangerIcon } from '@/components/ui/HangerIcon'
import { clsx } from 'clsx'
import type { ClothingItem } from '@/types'
import { colourNameToHex, isLightColour } from '@/lib/colourUtils'
import { useItemImage } from '@/hooks/useItemImage'

const CATEGORY_LABEL: Record<string, string> = {
  tops: 'Top',
  bottoms: 'Bottom',
  dresses: 'Dress',
  outerwear: 'Outerwear',
  shoes: 'Shoes',
  accessories: 'Accessory',
}

// SVG silhouettes used as no-image placeholders — one per category.
const CATEGORY_ICON: Record<string, React.ReactNode> = {
  tops: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.35}>
      <path d="M16 8L6 16l6 4v18h24V20l6-4-10-8c0 0-2 6-8 6s-8-6-8-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  bottoms: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.35}>
      <path d="M10 10h28l-4 28h-8l-2-14-2 14h-8L10 10z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  dresses: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.35}>
      <path d="M18 6l-8 12 6 2-6 22h28l-6-22 6-2L30 6c0 0-2 6-6 6s-6-6-6-6z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  outerwear: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.35}>
      <path d="M14 6L4 16l8 4v20h24V20l8-4L34 6l-4 2-6 6-6-6-4-2z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  shoes: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.35}>
      <path d="M8 32c0 0 4-14 12-16l4-8 12 4-4 8s6 2 8 12H8z" stroke="currentColor" strokeWidth="2" strokeLinejoin="round"/>
    </svg>
  ),
  accessories: (
    <svg width="48" height="48" viewBox="0 0 48 48" fill="none" opacity={0.35}>
      <circle cx="24" cy="24" r="14" stroke="currentColor" strokeWidth="2"/>
      <circle cx="24" cy="24" r="6" stroke="currentColor" strokeWidth="2"/>
    </svg>
  ),
}

interface ClothingCardProps {
  item: ClothingItem
  onClick: () => void
  onToggleFavourite: (e: React.MouseEvent) => void
  onStyleThis?: (e: React.MouseEvent) => void
}

export function ClothingCard({ item, onClick, onToggleFavourite, onStyleThis }: ClothingCardProps) {
  const imageUrl = useItemImage(item)
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
        {imageUrl ? (
          <img
            src={imageUrl}
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
              : 'bg-white/70 backdrop-blur-sm text-text-muted opacity-0 group-hover:opacity-100 hover:text-rose-400'
          )}
        >
          <Heart size={14} className={item.isFavourite ? 'fill-rose-500' : ''} />
        </button>

        {/* Bottom bar */}
        <div className="absolute bottom-0 left-0 right-0 flex items-end justify-between p-3">
          <span className="text-2xs font-medium uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-text-primary">
            {CATEGORY_LABEL[item.category]}
          </span>
          {onStyleThis && (
            <button
              onClick={onStyleThis}
              aria-label="Style this item"
              className="flex items-center gap-1 px-2.5 py-1 rounded-full bg-dark-purple text-butter-yellow text-2xs font-medium opacity-0 group-hover:opacity-100 transition-all duration-200 hover:bg-deep-purple"
            >
              <HangerIcon size={10} />
              Style this
            </button>
          )}
        </div>
      </div>

      {/* Card footer */}
      <div className="p-3 pb-4">
        <p className="text-sm font-medium text-text-primary truncate">{item.name}</p>
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
            <span className="text-2xs text-text-muted">+{item.colour.length - 4}</span>
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
      className="w-full h-full flex items-center justify-center"
      style={{ backgroundColor: bgHex }}
    >
      <div className={isLight ? 'text-text-primary' : 'text-white'}>
        {CATEGORY_ICON[item.category]}
      </div>
    </div>
  )
}
