import { useState } from 'react'
import { Plus, Check } from 'lucide-react'
import { colourNameToHex, isLightColour } from '@/lib/colourUtils'
import { CategoryGlyph } from '@/components/wardrobe/categoryVisuals'
import { formatINR } from '@/lib/shopping'
import type { CatalogItem } from '@/types'

interface ShopItemCardProps {
  item: CatalogItem
  mode: 'buy' | 'rent'
  inWardrobe: boolean
  onAdd: () => void
}

/** H&M-style product tile — photo, name, price, plain-text actions. No card box; a small retailer tag sits on the photo. */
export function ShopItemCard({ item, mode, inWardrobe, onAdd }: ShopItemCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const fallbackHex = item.colours[0] ? colourNameToHex(item.colours[0]) : '#EDE9E2'
  const fallbackText = isLightColour(fallbackHex) ? 'text-text-primary/35' : 'text-white/45'
  return (
    <div className="group flex flex-col">
      <div className="relative block aspect-[3/4] overflow-hidden bg-cream-200">
        {item.imageUrl && !imageFailed ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            referrerPolicy="no-referrer"
            onError={() => setImageFailed(true)}
            onLoad={(e) => {
              const { naturalWidth: w, naturalHeight: h } = e.currentTarget
              // Retailer logos / 1px placeholders load fine but aren't product photos.
              if (w < 200 || h < 200 || w / h > 1.6) setImageFailed(true)
            }}
            className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]"
          />
        ) : (
          <div
            aria-hidden="true"
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: fallbackHex }}
          >
            <CategoryGlyph category={item.category} size={56} className={fallbackText} />
          </div>
        )}
        {item.brand && (
          <span className="absolute bottom-3 left-3 text-2xs uppercase tracking-widest text-text-primary bg-warm-cream/90 px-2 py-1">
            {item.brand}
          </span>
        )}
        {inWardrobe && (
          <span className="absolute top-3 left-3 text-2xs uppercase tracking-widest text-text-primary bg-warm-cream/90 px-2 py-1">
            In your Kloset
          </span>
        )}
        <button
          type="button"
          onClick={() => !inWardrobe && onAdd()}
          disabled={inWardrobe}
          aria-label={inWardrobe ? `${item.name} is already in your Kloset` : `Add ${item.name} to Kloset`}
          title={inWardrobe ? 'Already in your Kloset' : 'Add to Kloset'}
          className="absolute bottom-3 right-3 flex h-11 w-11 items-center justify-center rounded-full bg-warm-cream text-text-primary shadow-medium opacity-0 pointer-events-none transition-all duration-200 group-hover:opacity-100 group-hover:pointer-events-auto group-focus-within:opacity-100 group-focus-within:pointer-events-auto hover:bg-text-primary hover:text-warm-cream disabled:cursor-default disabled:hover:bg-warm-cream disabled:hover:text-text-primary"
        >
          {inWardrobe ? <Check size={18} /> : <Plus size={20} />}
        </button>
      </div>

      <div className="pt-3 flex flex-col gap-1">
        <p className="text-sm text-text-primary leading-snug">{item.name}</p>
        <p className="text-sm font-semibold text-text-primary">
          {mode === 'rent' ? (
            <>{formatINR(item.rentPricePerWeek)}<span className="font-normal text-text-muted"> / week</span></>
          ) : (
            <>{formatINR(item.estimatedPrice)}</>
          )}
        </p>

      </div>
    </div>
  )
}
