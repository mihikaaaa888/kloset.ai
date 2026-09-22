import { useState } from 'react'
import { Check, Plus, ShoppingBag, Repeat } from 'lucide-react'
import { clsx } from 'clsx'
import { colourNameToHex } from '@/lib/colourUtils'
import { CATALOG_PRICE_LABELS } from '@/lib/catalogData'
import type { CatalogItem } from '@/types'

interface CatalogCardProps {
  item: CatalogItem
  inWardrobe: boolean
  onAdd: () => void
}

export function CatalogCard({ item, inWardrobe, onAdd }: CatalogCardProps) {
  const primaryColour = item.colours[0]
  const bgHex = primaryColour ? colourNameToHex(primaryColour) : '#EDE9E2'
  const [imageFailed, setImageFailed] = useState(false)

  return (
    <div className="group relative rounded-3xl overflow-hidden bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-medium flex flex-col">
      {/* Photo area */}
      <div className="aspect-[3/4] relative overflow-hidden flex-shrink-0">
        {!imageFailed ? (
          <img
            src={item.imageUrl}
            alt={item.name}
            loading="lazy"
            onError={() => setImageFailed(true)}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bgHex }} />
        )}

        {/* Colour swatches — bottom left */}
        <div className="absolute bottom-3 left-3 flex gap-1">
          {item.colours.map((c) => (
            <div
              key={c}
              title={c}
              className="w-4 h-4 rounded-full ring-1 ring-black/15 shadow-sm"
              style={{ backgroundColor: colourNameToHex(c) }}
            />
          ))}
        </div>

        {/* Price range — top right */}
        <div className="absolute top-3 right-3">
          <span className="text-2xs font-medium uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-text-muted">
            {CATALOG_PRICE_LABELS[item.priceRange]}
          </span>
        </div>

        {/* In wardrobe badge */}
        {inWardrobe && (
          <div className="absolute top-3 left-3">
            <span className="flex items-center gap-1 text-2xs font-medium px-2 py-0.5 rounded-full bg-dark-purple text-butter-yellow">
              <Check size={10} />
              In Kloset
            </span>
          </div>
        )}
      </div>

      {/* Card body */}
      <div className="p-3 pb-4 flex flex-col gap-2 flex-1">
        <div>
          <p className="text-sm font-medium text-text-primary leading-snug">{item.name}</p>
          <p className="text-2xs text-text-muted mt-0.5">{item.material}</p>
        </div>

        {/* Style aesthetic pills */}
        <div className="flex flex-wrap gap-1">
          {item.styleAesthetics.slice(0, 2).map((s) => (
            <span
              key={s}
              className="text-2xs px-2 py-0.5 rounded-full bg-text-primary/5 text-text-primary/70 font-medium capitalize"
            >
              {s}
            </span>
          ))}
        </div>

        {/* Buy / rent — open a live shopping search in a new tab, pushed to bottom */}
        <div className="mt-auto pt-1 flex gap-1.5">
          <a
            href={item.shopUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-2xs font-medium bg-text-primary/5 text-text-primary hover:bg-text-primary/10 transition-colors"
            title={`Search to buy — around $${item.estimatedPrice}`}
          >
            <ShoppingBag size={11} />
            ${item.estimatedPrice}
          </a>
          <a
            href={item.rentUrl}
            target="_blank"
            rel="noreferrer"
            onClick={(e) => e.stopPropagation()}
            className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-xl text-2xs font-medium bg-text-primary/5 text-text-primary hover:bg-text-primary/10 transition-colors"
            title={`Search to rent — around $${item.rentPricePerWeek}/week`}
          >
            <Repeat size={11} />
            ${item.rentPricePerWeek}/wk
          </a>
        </div>

        {/* Add to Kloset — pushed to bottom */}
        <div>
          <button
            onClick={(e) => {
              e.stopPropagation()
              if (!inWardrobe) onAdd()
            }}
            disabled={inWardrobe}
            className={clsx(
              'w-full flex items-center justify-center gap-1.5 py-2 rounded-2xl text-xs font-medium transition-all duration-200',
              inWardrobe
                ? 'bg-text-primary/5 text-text-primary/40 cursor-default'
                : 'bg-dark-purple text-butter-yellow hover:bg-deep-purple active:scale-95'
            )}
          >
            {inWardrobe ? (
              <>
                <Check size={12} />
                In Your Kloset
              </>
            ) : (
              <>
                <Plus size={12} />
                Add to Kloset
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
