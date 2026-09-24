import { useEffect, useMemo, useState } from 'react'
import { createPortal } from 'react-dom'
import { Check, X } from 'lucide-react'
import { clsx } from 'clsx'
import { useItemImage } from '@/hooks/useItemImage'
import { colourNameToHex, isLightColour } from '@/lib/colourUtils'
import { CATEGORY_LABEL, CategoryGlyph } from '@/components/wardrobe/categoryVisuals'
import type { ClothingItem, Occasion, Outfit, OutfitItem } from '@/types'

const ROLE_FOR_CATEGORY: Record<string, OutfitItem['role']> = {
  tops: 'top',
  bottoms: 'bottom',
  dresses: 'dress',
  outerwear: 'outerwear',
  shoes: 'shoes',
  accessories: 'accessory',
}

const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: 'casual', label: 'Casual' },
  { value: 'work', label: 'Work' },
  { value: 'date-night', label: 'Date night' },
  { value: 'formal', label: 'Formal' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'travel', label: 'Travel' },
  { value: 'special-event', label: 'Special event' },
  { value: 'gym', label: 'Gym' },
]

const MAX_ACCESSORIES = 2

interface CreateOutfitModalProps {
  open: boolean
  items: ClothingItem[]
  onClose: () => void
  onSave: (outfit: Outfit) => void
}

/**
 * Build an outfit by hand from pieces already in the Kloset. Follows the
 * same slot rules as the stylist: one of each slot, a dress replaces a
 * top + bottom, and up to two accessories.
 */
export function CreateOutfitModal({ open, items, onClose, onSave }: CreateOutfitModalProps) {
  const [name, setName] = useState('')
  const [occasion, setOccasion] = useState<Occasion>('casual')
  const [selected, setSelected] = useState<string[]>([])

  useEffect(() => {
    if (!open) return
    setName('')
    setOccasion('casual')
    setSelected([])
  }, [open])

  useEffect(() => {
    if (!open) return
    const handler = (e: KeyboardEvent) => e.key === 'Escape' && onClose()
    document.addEventListener('keydown', handler)
    document.body.style.overflow = 'hidden'
    return () => {
      document.removeEventListener('keydown', handler)
      document.body.style.overflow = ''
    }
  }, [open, onClose])

  const byId = useMemo(() => new Map(items.map((i) => [i.id, i])), [items])

  const toggle = (item: ClothingItem) => {
    setSelected((prev) => {
      if (prev.includes(item.id)) return prev.filter((id) => id !== item.id)
      const role = ROLE_FOR_CATEGORY[item.category]
      const roleOf = (id: string) => ROLE_FOR_CATEGORY[byId.get(id)?.category ?? '']
      let next = prev
      if (role === 'accessory') {
        const accessories = next.filter((id) => roleOf(id) === 'accessory')
        if (accessories.length >= MAX_ACCESSORIES) next = next.filter((id) => id !== accessories[0])
      } else {
        // One piece per slot; a dress and separates are mutually exclusive.
        const clashes: OutfitItem['role'][] =
          role === 'dress' ? ['dress', 'top', 'bottom'] : role === 'top' || role === 'bottom' ? [role, 'dress'] : [role]
        next = next.filter((id) => !clashes.includes(roleOf(id)))
      }
      return [...next, item.id]
    })
  }

  const handleSave = () => {
    const outfitItems: OutfitItem[] = selected.map((id) => ({
      itemId: id,
      role: ROLE_FOR_CATEGORY[byId.get(id)!.category],
    }))
    const now = new Date().toISOString()
    const outfit: Outfit = {
      id: crypto.randomUUID(),
      name: name.trim() || `${OCCASIONS.find((o) => o.value === occasion)?.label} look`,
      items: outfitItems,
      occasion,
      stylingNotes: '',
      whyItWorks: '',
      generatedAt: now,
      isSaved: true,
      source: 'manual',
    }
    console.log('[my-outfits] saving manual outfit', { id: outfit.id, pieces: outfitItems.length })
    onSave(outfit)
  }

  if (!open) return null

  const canSave = selected.length >= 2

  return createPortal(
    <div role="dialog" aria-modal="true" aria-label="New outfit" className="fixed inset-0 z-[60] bg-warm-cream animate-fade-in flex flex-col">
      {/* Top bar */}
      <header className="flex items-center justify-between gap-4 px-4 sm:px-8 h-16 lg:h-20 border-b border-text-primary/10 flex-shrink-0">
        <h2 className="font-display text-2xl lg:text-3xl text-text-primary">New outfit</h2>
        <button
          onClick={onClose}
          aria-label="Close"
          className="w-11 h-11 rounded-full ring-1 ring-text-primary/10 flex items-center justify-center text-text-primary hover:ring-text-primary/30 transition-all"
        >
          <X size={20} strokeWidth={1.25} />
        </button>
      </header>

      <div className="flex-1 overflow-y-auto">
        <div className="mx-auto max-w-7xl px-4 sm:px-8 py-8 grid lg:grid-cols-[320px_1fr] gap-10">
          {/* Details */}
          <aside className="lg:sticky lg:top-8 self-start space-y-8">
            <label className="block">
              <span className="text-2xs uppercase tracking-widest text-text-muted">Name</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Sunday brunch"
                maxLength={60}
                className="mt-2 w-full bg-transparent border-b border-text-primary/25 focus:border-text-primary py-2 font-display text-2xl text-text-primary placeholder:text-text-muted/50 focus:outline-none transition-colors"
              />
            </label>

            <div>
              <span className="text-2xs uppercase tracking-widest text-text-muted">Occasion</span>
              <div className="mt-3 flex flex-wrap gap-2">
                {OCCASIONS.map((o) => (
                  <button
                    key={o.value}
                    onClick={() => setOccasion(o.value)}
                    aria-pressed={occasion === o.value}
                    className={clsx(
                      'px-3.5 h-9 text-xs ring-1 ring-inset transition-colors',
                      occasion === o.value
                        ? 'bg-text-primary text-warm-cream ring-text-primary'
                        : 'text-text-primary ring-text-primary/20 hover:ring-text-primary/50'
                    )}
                  >
                    {o.label}
                  </button>
                ))}
              </div>
            </div>

            <div>
              <span className="text-2xs uppercase tracking-widest text-text-muted">
                In this outfit · {selected.length}
              </span>
              {selected.length === 0 ? (
                <p className="mt-3 text-sm text-text-muted leading-relaxed">
                  Pick at least two pieces. One per slot — a dress replaces a top and bottom, and you can add up to two accessories.
                </p>
              ) : (
                <ul className="mt-3 divide-y divide-text-primary/10 border-y border-text-primary/10">
                  {selected.map((id) => {
                    const item = byId.get(id)
                    if (!item) return null
                    return (
                      <li key={id} className="flex items-center justify-between gap-3 py-2.5 text-sm">
                        <span className="truncate text-text-primary">{item.name}</span>
                        <span className="text-2xs uppercase tracking-widest text-text-muted flex-shrink-0">
                          {ROLE_FOR_CATEGORY[item.category]}
                        </span>
                      </li>
                    )
                  })}
                </ul>
              )}
            </div>
          </aside>

          {/* Picker */}
          {items.length === 0 ? (
            <p className="text-sm text-text-muted">Add pieces to your Kloset first, then come back to build an outfit.</p>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 gap-x-4 gap-y-6">
              {items.map((item) => (
                <PickTile key={item.id} item={item} selected={selected.includes(item.id)} onClick={() => toggle(item)} />
              ))}
            </div>
          )}
        </div>
      </div>

      <footer className="flex items-center justify-end gap-3 px-4 sm:px-8 py-4 border-t border-text-primary/10 flex-shrink-0">
        <button onClick={onClose} className="h-12 px-6 text-xs uppercase tracking-widest text-text-muted hover:text-text-primary transition-colors">
          Cancel
        </button>
        <button
          onClick={handleSave}
          disabled={!canSave}
          className="h-12 px-8 bg-text-primary text-warm-cream text-xs font-medium uppercase tracking-widest hover:bg-text-primary/90 disabled:opacity-35 disabled:cursor-not-allowed transition-colors"
        >
          Save outfit
        </button>
      </footer>
    </div>,
    document.body
  )
}

function PickTile({ item, selected, onClick }: { item: ClothingItem; selected: boolean; onClick: () => void }) {
  const imageUrl = useItemImage(item)
  const bgHex = item.colour[0] ? colourNameToHex(item.colour[0]) : '#EDE9E2'
  return (
    <button onClick={onClick} aria-pressed={selected} className="group text-left focus-visible:outline-none">
      <div
        className={clsx(
          'relative aspect-[3/4] overflow-hidden bg-[#F3F0E8] transition-shadow',
          selected ? 'ring-2 ring-text-primary ring-offset-2 ring-offset-warm-cream' : 'group-hover:ring-1 group-hover:ring-text-primary/30 group-focus-visible:ring-2 group-focus-visible:ring-butter-yellow'
        )}
      >
        {imageUrl ? (
          <img src={imageUrl} alt="" loading="lazy" className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center" style={{ backgroundColor: bgHex }}>
            <CategoryGlyph category={item.category} size={44} className={isLightColour(bgHex) ? 'text-text-primary/35' : 'text-white/45'} />
          </div>
        )}
        <span
          className={clsx(
            'absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center transition-all',
            selected ? 'bg-text-primary text-warm-cream' : 'bg-warm-cream/90 text-transparent ring-1 ring-text-primary/15'
          )}
        >
          <Check size={14} strokeWidth={1.75} />
        </span>
      </div>
      <p className="text-2xs uppercase tracking-widest text-text-muted mt-2.5">{CATEGORY_LABEL[item.category]}</p>
      <p className="font-display text-base text-text-primary truncate">{item.name}</p>
    </button>
  )
}
