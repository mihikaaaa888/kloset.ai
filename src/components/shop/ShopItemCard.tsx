import { useState } from 'react'
import { Plus } from 'lucide-react'
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

/** Product tile with a compact add control over the top-right of its photo. */
export function ShopItemCard({ item, mode, inWardrobe, onAdd }: ShopItemCardProps) {
  const [imageFailed, setImageFailed] = useState(false)
  const fallbackHex = item.colours[0] ? colourNameToHex(item.colours[0]) : '#EDE9E2'
  const fallbackText = isLightColour(fallbackHex) ? 'text-text-primary/35' : 'text-white/45'
  const href = mode === 'rent' ? item.rentUrl : item.shopUrl

  return (
    <div className="group flex flex-col">
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-200">
        <a
          href={href}
          target="_blank"
          rel="noreferrer"
          onClick={() => { console.log('[shop] open item', { id: item.id, mode }) }}
          className="absolute inset-0 block"
        >
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
        </a>
        {item.brand && (
          <span className="absolute bottom-3 left-3 text-2xs uppercase tracking-widest text-text-primary bg-warm-cream/90 px-2 py-1">
            {item.brand}
          </span>
        )}
        {inWardrobe ? (
          <span className="absolute top-3 left-3 text-2xs uppercase tracking-widest text-text-primary bg-warm-cream/90 px-2 py-1">
            In your Kloset
          </span>
        ) : mode === 'buy' ? (
          <button
            type="button"
            onClick={onAdd}
            aria-label={`Add ${item.name} to your Kloset`}
            title="Add to Kloset"
            className="absolute right-2 top-2 flex h-8 w-8 items-center justify-center rounded-full bg-warm-cream/95 text-text-primary shadow-sm opacity-100 transition-all hover:bg-text-primary hover:text-warm-cream sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100"
          >
            <Plus size={14} strokeWidth={1.6} />
          </button>
        ) : null}
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
