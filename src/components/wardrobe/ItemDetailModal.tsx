import { Heart, Pencil, Trash2, Plus } from 'lucide-react'
import { clsx } from 'clsx'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { colourNameToHex } from '@/lib/colourUtils'
import type { ClothingItem } from '@/types'

const CATEGORY_EMOJI: Record<string, string> = {
  tops: '👕',
  bottoms: '👖',
  dresses: '👗',
  outerwear: '🧥',
  shoes: '👟',
  accessories: '💍',
}

interface ItemDetailModalProps {
  item: ClothingItem | null
  open: boolean
  onClose: () => void
  onEdit: () => void
  onDelete: () => void
  onToggleFavourite: () => void
  onIncrementWorn: () => void
}

export function ItemDetailModal({
  item,
  open,
  onClose,
  onEdit,
  onDelete,
  onToggleFavourite,
  onIncrementWorn,
}: ItemDetailModalProps) {
  if (!item) return null

  const primaryColour = item.colour[0]
  const bgStyle = primaryColour
    ? { backgroundColor: colourNameToHex(primaryColour) }
    : { backgroundColor: '#EDE9E2' }

  return (
    <Modal open={open} onClose={onClose} variant="sheet" maxWidth="max-w-lg">
      <div className="pb-8">
        {/* Image */}
        <div className="aspect-[4/3] w-full overflow-hidden">
          {item.imageUrl ? (
            <img src={item.imageUrl} alt={item.name} className="w-full h-full object-cover" />
          ) : (
            <div
              className="w-full h-full flex items-center justify-center"
              style={bgStyle}
            >
              <span className="text-7xl">{CATEGORY_EMOJI[item.category]}</span>
            </div>
          )}
        </div>

        <div className="px-6 pt-5">
          {/* Header row */}
          <div className="flex items-start justify-between gap-4 mb-4">
            <div className="flex-1 min-w-0">
              <h2 className="font-serif text-2xl font-medium text-charcoal-900 leading-tight">
                {item.name}
              </h2>
              {item.brand && (
                <p className="text-sm text-charcoal-400 mt-0.5">{item.brand}</p>
              )}
            </div>
            <button
              onClick={onToggleFavourite}
              className={clsx(
                'w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0',
                'transition-all duration-200',
                item.isFavourite
                  ? 'bg-rose-50 text-rose-500'
                  : 'bg-cream-100 text-charcoal-400 hover:text-rose-400 hover:bg-rose-50'
              )}
            >
              <Heart size={18} className={item.isFavourite ? 'fill-rose-500' : ''} />
            </button>
          </div>

          {/* Badges */}
          <div className="flex flex-wrap gap-2 mb-6">
            <Badge variant="dark">
              {CATEGORY_EMOJI[item.category]} {item.category}
            </Badge>
            {item.pattern !== 'solid' && (
              <Badge variant="neutral">{item.pattern}</Badge>
            )}
            {item.material && <Badge variant="neutral">{item.material}</Badge>}
          </div>

          {/* Colours */}
          {item.colour.length > 0 && (
            <AttributeRow label="Colours">
              <div className="flex items-center gap-2 flex-wrap">
                {item.colour.map((c) => (
                  <div key={c} className="flex items-center gap-1.5">
                    <div
                      className="w-4 h-4 rounded-full ring-1 ring-black/10"
                      style={{ backgroundColor: colourNameToHex(c) }}
                    />
                    <span className="text-sm text-charcoal-700">{c}</span>
                  </div>
                ))}
              </div>
            </AttributeRow>
          )}

          {/* Seasons */}
          {item.seasons.length > 0 && (
            <AttributeRow label="Seasons">
              <div className="flex flex-wrap gap-1.5">
                {item.seasons.map((s) => (
                  <span
                    key={s}
                    className="text-xs px-2.5 py-1 rounded-full bg-cream-100 text-charcoal-600 capitalize"
                  >
                    {s.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </AttributeRow>
          )}

          {/* Occasions */}
          {item.occasions.length > 0 && (
            <AttributeRow label="Occasions">
              <div className="flex flex-wrap gap-1.5">
                {item.occasions.map((o) => (
                  <span
                    key={o}
                    className="text-xs px-2.5 py-1 rounded-full bg-cream-100 text-charcoal-600 capitalize"
                  >
                    {o.replace('-', ' ')}
                  </span>
                ))}
              </div>
            </AttributeRow>
          )}

          {/* Times worn */}
          <AttributeRow label="Times worn">
            <div className="flex items-center gap-3">
              <span className="text-2xl font-serif font-medium text-charcoal-900">
                {item.timesWorn}
              </span>
              <button
                onClick={onIncrementWorn}
                className="flex items-center gap-1 px-3 py-1.5 rounded-full bg-cream-200 hover:bg-cream-300 text-charcoal-700 text-xs font-medium transition-colors"
              >
                <Plus size={12} />
                Log wear
              </button>
            </div>
          </AttributeRow>

          {/* Notes */}
          {item.notes && (
            <AttributeRow label="Notes">
              <p className="text-sm text-charcoal-600 leading-relaxed">{item.notes}</p>
            </AttributeRow>
          )}

          {/* Actions */}
          <div className="flex gap-3 pt-4 mt-2 border-t border-cream-100">
            <Button
              variant="outline"
              size="sm"
              onClick={onEdit}
              className="flex-1 gap-2"
            >
              <Pencil size={14} />
              Edit
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={onDelete}
              className="flex-1 gap-2 !text-red-500 hover:!bg-red-50"
            >
              <Trash2 size={14} />
              Remove
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  )
}

function AttributeRow({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="mb-4">
      <p className="text-2xs font-medium text-charcoal-400 uppercase tracking-widest mb-2">
        {label}
      </p>
      {children}
    </div>
  )
}
