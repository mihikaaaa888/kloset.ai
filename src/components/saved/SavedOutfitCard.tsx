import { Trash2, Heart } from 'lucide-react'
import { clsx } from 'clsx'
import { colourNameToHex, isLightColour } from '@/lib/colourUtils'
import { useItemImage } from '@/hooks/useItemImage'
import type { Outfit, ClothingItem } from '@/types'

interface ResolvedOutfitItem {
  itemId: string
  role: string
  item: ClothingItem | null
}

interface SavedOutfitCardProps {
  outfit: Outfit
  resolvedItems: ResolvedOutfitItem[]
  onClick: () => void
  onUnsave: (e: React.MouseEvent) => void
}

const OCCASION_LABEL: Record<string, string> = {
  work: 'Work', casual: 'Casual', 'date-night': 'Date Night', formal: 'Formal',
  weekend: 'Weekend', travel: 'Travel', 'special-event': 'Special Event', gym: 'Gym',
}

const CATEGORY_EMOJI: Record<string, string> = {
  tops: '👕', bottoms: '👖', dresses: '👗', outerwear: '🧥', shoes: '👟', accessories: '💍',
}

export function SavedOutfitCard({ outfit, resolvedItems, onClick, onUnsave }: SavedOutfitCardProps) {
  const mosaicSlots = [...resolvedItems].slice(0, 4)
  while (mosaicSlots.length < 4) mosaicSlots.push({ itemId: '', role: '', item: null })

  const savedDate = outfit.savedAt
    ? new Date(outfit.savedAt).toLocaleDateString('en-GB', { day: 'numeric', month: 'short' })
    : null

  return (
    <div
      onClick={onClick}
      className="group relative rounded-3xl overflow-hidden bg-white shadow-card cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-medium"
    >
      {/* Mosaic */}
      <div className="grid grid-cols-2 aspect-[4/3]">
        {mosaicSlots.map((slot, i) => (
          <MosaicCell
            key={slot.itemId || `empty-${i}`}
            item={slot.item}
            role={slot.role}
          />
        ))}
      </div>

      {/* Unsave button */}
      <button
        onClick={onUnsave}
        aria-label="Remove outfit"
        className="absolute top-3 right-3 w-8 h-8 rounded-full bg-white/80 backdrop-blur-sm flex items-center justify-center text-rose-400 opacity-0 group-hover:opacity-100 hover:bg-white hover:text-rose-600 transition-all duration-200 shadow-soft"
      >
        <Trash2 size={13} />
      </button>

      {/* Info */}
      <div className="p-4">
        <div className="flex items-start justify-between gap-2">
          <h3 className="font-serif text-base font-medium text-charcoal-900 leading-snug line-clamp-2">
            {outfit.name}
          </h3>
          <Heart size={12} className="text-rose-400 fill-rose-400 flex-shrink-0 mt-0.5" />
        </div>
        <div className="flex items-center gap-2 mt-2 flex-wrap">
          <span className="text-2xs font-medium uppercase tracking-widest px-2 py-0.5 rounded-full bg-charcoal-900 text-cream-50">
            {OCCASION_LABEL[outfit.occasion] ?? outfit.occasion}
          </span>
          {outfit.mood && (
            <span className="text-2xs text-charcoal-400 capitalize">{outfit.mood}</span>
          )}
          {savedDate && (
            <span className="text-2xs text-charcoal-300 ml-auto">{savedDate}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function MosaicCell({ item, role }: { item: ClothingItem | null; role: string }) {
  const imageUrl = useItemImage(item)

  if (!item) {
    return <div className="bg-cream-200" />
  }

  const primaryColour = item.colour[0]
  const bgHex = primaryColour ? colourNameToHex(primaryColour) : '#EDE9E2'
  const isLight = isLightColour(bgHex)

  return (
    <div
      className="relative flex items-center justify-center overflow-hidden"
      style={{ backgroundColor: bgHex }}
    >
      {imageUrl ? (
        <img src={imageUrl} alt={item.name} className="w-full h-full object-cover" />
      ) : (
        <span
          className={clsx(
            'text-2xl select-none',
            isLight ? 'opacity-60' : 'opacity-80'
          )}
        >
          {CATEGORY_EMOJI[item.category] ?? '👗'}
        </span>
      )}
      {/* Role tag */}
      <span
        className={clsx(
          'absolute bottom-1.5 left-1.5 text-2xs font-medium uppercase tracking-widest px-1.5 py-0.5 rounded-full',
          'bg-black/20 backdrop-blur-sm',
          isLight ? 'text-charcoal-700' : 'text-white/90'
        )}
      >
        {role}
      </span>
    </div>
  )
}
