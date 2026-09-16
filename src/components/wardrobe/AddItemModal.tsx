import { useState, useRef, useCallback } from 'react'
import { Upload, ImagePlus, X } from 'lucide-react'
import { clsx } from 'clsx'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'
import { SelectChip } from '@/components/ui/SelectChip'
import { ColourSwatch } from '@/components/ui/ColourSwatch'
import { COLOUR_PALETTE } from '@/lib/colourUtils'
import type { ClothingItem, ClothingCategory, Pattern, Season, Occasion } from '@/types'

// ─── Options ──────────────────────────────────────────────────────────────────

const CATEGORIES: { value: ClothingCategory; label: string; emoji: string }[] = [
  { value: 'tops', label: 'Tops', emoji: '👕' },
  { value: 'bottoms', label: 'Bottoms', emoji: '👖' },
  { value: 'dresses', label: 'Dresses', emoji: '👗' },
  { value: 'outerwear', label: 'Outerwear', emoji: '🧥' },
  { value: 'shoes', label: 'Shoes', emoji: '👟' },
  { value: 'accessories', label: 'Accessories', emoji: '💍' },
]

const PATTERNS: { value: Pattern; label: string }[] = [
  { value: 'solid', label: 'Solid' },
  { value: 'striped', label: 'Striped' },
  { value: 'checked', label: 'Checked' },
  { value: 'floral', label: 'Floral' },
  { value: 'abstract', label: 'Abstract' },
  { value: 'animal-print', label: 'Animal Print' },
  { value: 'geometric', label: 'Geometric' },
  { value: 'other', label: 'Other' },
]

const SEASONS: { value: Season; label: string; emoji: string }[] = [
  { value: 'spring', label: 'Spring', emoji: '🌸' },
  { value: 'summer', label: 'Summer', emoji: '☀️' },
  { value: 'autumn', label: 'Autumn', emoji: '🍂' },
  { value: 'winter', label: 'Winter', emoji: '❄️' },
  { value: 'all-season', label: 'All Season', emoji: '✦' },
]

const OCCASIONS: { value: Occasion; label: string }[] = [
  { value: 'work', label: 'Work' },
  { value: 'casual', label: 'Casual' },
  { value: 'formal', label: 'Formal' },
  { value: 'date-night', label: 'Date Night' },
  { value: 'weekend', label: 'Weekend' },
  { value: 'travel', label: 'Travel' },
  { value: 'gym', label: 'Gym' },
  { value: 'special-event', label: 'Special Event' },
]

// ─── Draft ────────────────────────────────────────────────────────────────────

interface ItemDraft {
  name: string
  category: ClothingCategory | ''
  imageUrl: string | null
  colour: string[]
  material: string
  pattern: Pattern | ''
  seasons: Season[]
  occasions: Occasion[]
  brand: string
  notes: string
}

function blankDraft(): ItemDraft {
  return {
    name: '',
    category: '',
    imageUrl: null,
    colour: [],
    material: '',
    pattern: 'solid',
    seasons: [],
    occasions: [],
    brand: '',
    notes: '',
  }
}

function itemToDraft(item: ClothingItem): ItemDraft {
  return {
    name: item.name,
    category: item.category,
    imageUrl: item.imageUrl,
    colour: item.colour,
    material: item.material ?? '',
    pattern: item.pattern,
    seasons: item.seasons,
    occasions: item.occasions,
    brand: item.brand ?? '',
    notes: item.notes ?? '',
  }
}

// ─── Component ────────────────────────────────────────────────────────────────

interface AddItemModalProps {
  open: boolean
  onClose: () => void
  onSave: (item: ClothingItem) => void
  editItem?: ClothingItem
}

export function AddItemModal({ open, onClose, onSave, editItem }: AddItemModalProps) {
  const [draft, setDraft] = useState<ItemDraft>(() =>
    editItem ? itemToDraft(editItem) : blankDraft()
  )
  const [errors, setErrors] = useState<Partial<Record<keyof ItemDraft, string>>>({})
  const fileInputRef = useRef<HTMLInputElement>(null)
  const [imageLoading, setImageLoading] = useState(false)
  const [dragOver, setDragOver] = useState(false)

  // Reset when modal opens/closes or editItem changes
  const handleOpenChange = useCallback(() => {
    setDraft(editItem ? itemToDraft(editItem) : blankDraft())
    setErrors({})
  }, [editItem])

  // Run reset effect when open toggles to true
  useState(() => { if (open) handleOpenChange() })

  const update = <K extends keyof ItemDraft>(key: K, value: ItemDraft[K]) => {
    setDraft((d) => ({ ...d, [key]: value }))
    setErrors((e) => ({ ...e, [key]: undefined }))
  }

  const toggleArray = <T,>(key: keyof ItemDraft, value: T) => {
    setDraft((d) => {
      const arr = d[key] as T[]
      return {
        ...d,
        [key]: arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value],
      }
    })
  }

  const processImageFile = (file: File) => {
    if (!file.type.startsWith('image/')) return
    setImageLoading(true)
    const reader = new FileReader()
    reader.onload = (e) => {
      update('imageUrl', e.target?.result as string)
      setImageLoading(false)
    }
    reader.readAsDataURL(file)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) processImageFile(file)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const file = e.dataTransfer.files[0]
    if (file) processImageFile(file)
  }

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!draft.name.trim()) newErrors.name = 'Name is required'
    if (!draft.category) newErrors.category = 'Please select a category'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSave = () => {
    if (!validate()) return
    const now = new Date().toISOString()
    const item: ClothingItem = {
      ...(editItem ?? {
        id: crypto.randomUUID(),
        isFavourite: false,
        timesWorn: 0,
        createdAt: now,
      }),
      name: draft.name.trim(),
      category: draft.category as ClothingCategory,
      imageUrl: draft.imageUrl,
      imageSource: draft.imageUrl ? 'local' : 'none',
      colour: draft.colour,
      material: draft.material.trim() || undefined,
      pattern: (draft.pattern as Pattern) || 'solid',
      seasons: draft.seasons,
      occasions: draft.occasions,
      brand: draft.brand.trim() || undefined,
      notes: draft.notes.trim() || undefined,
      updatedAt: now,
    }
    onSave(item)
    onClose()
  }

  return (
    <Modal
      open={open}
      onClose={onClose}
      title={editItem ? 'Edit Item' : 'Add to My Kloset'}
      variant="sheet"
    >
      <div className="px-6 py-4 pb-8 space-y-7">
        {/* ── Image Upload ── */}
        <div>
          <SectionLabel>Photo</SectionLabel>
          {draft.imageUrl ? (
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src={draft.imageUrl}
                alt="Item preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={() => update('imageUrl', null)}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-charcoal-900/70 flex items-center justify-center text-white hover:bg-charcoal-900 transition-colors"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div
              onClick={() => fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={clsx(
                'rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-10 cursor-pointer transition-all duration-200',
                dragOver
                  ? 'border-charcoal-900 bg-cream-100'
                  : 'border-cream-300 hover:border-charcoal-400 hover:bg-cream-50'
              )}
            >
              {imageLoading ? (
                <div className="w-8 h-8 rounded-full border-2 border-charcoal-400 border-t-transparent animate-spin" />
              ) : (
                <>
                  <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center text-charcoal-500">
                    <ImagePlus size={22} />
                  </div>
                  <div className="text-center">
                    <p className="text-sm font-medium text-charcoal-700">Upload a photo</p>
                    <p className="text-xs text-charcoal-400 mt-0.5">
                      Tap to browse or drag & drop
                    </p>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-charcoal-400">
                    <Upload size={12} />
                    <span>JPG, PNG, WEBP</span>
                  </div>
                </>
              )}
            </div>
          )}
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>

        {/* ── Name ── */}
        <div>
          <SectionLabel>Item name *</SectionLabel>
          <TextInput
            placeholder="e.g. White Linen Shirt, Black Blazer…"
            value={draft.name}
            onChange={(e) => update('name', e.target.value)}
            error={errors.name}
          />
        </div>

        {/* ── Category ── */}
        <div>
          <SectionLabel error={errors.category}>Category *</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.value}
                type="button"
                onClick={() => update('category', cat.value)}
                className={clsx(
                  'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border transition-all duration-200',
                  draft.category === cat.value
                    ? 'bg-charcoal-900 text-cream-50 border-charcoal-900'
                    : 'bg-white text-charcoal-700 border-cream-200 hover:border-charcoal-300'
                )}
              >
                <span>{cat.emoji}</span>
                {cat.label}
              </button>
            ))}
          </div>
          {errors.category && (
            <p className="text-xs text-red-500 mt-1.5">{errors.category}</p>
          )}
        </div>

        {/* ── Colours ── */}
        <div>
          <SectionLabel>Colours</SectionLabel>
          <div className="flex flex-wrap gap-3">
            {COLOUR_PALETTE.map((colour) => (
              <div key={colour.name} className="flex flex-col items-center gap-1">
                <ColourSwatch
                  name={colour.name}
                  hex={colour.hex}
                  selected={draft.colour.includes(colour.name)}
                  onClick={() => toggleArray('colour', colour.name)}
                />
                <span className="text-2xs text-charcoal-400 text-center max-w-[48px] leading-tight truncate">
                  {colour.name}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* ── Pattern ── */}
        <div>
          <SectionLabel>Pattern</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {PATTERNS.map((p) => (
              <SelectChip
                key={p.value}
                label={p.label}
                selected={draft.pattern === p.value}
                onClick={() => update('pattern', p.value)}
              />
            ))}
          </div>
        </div>

        {/* ── Material ── */}
        <div>
          <SectionLabel>Material</SectionLabel>
          <TextInput
            placeholder="e.g. Cotton, Wool, Silk, Denim…"
            value={draft.material}
            onChange={(e) => update('material', e.target.value)}
          />
        </div>

        {/* ── Seasons ── */}
        <div>
          <SectionLabel>Seasons</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {SEASONS.map((s) => (
              <SelectChip
                key={s.value}
                label={s.label}
                emoji={s.emoji}
                selected={draft.seasons.includes(s.value)}
                onClick={() => toggleArray('seasons', s.value)}
              />
            ))}
          </div>
        </div>

        {/* ── Occasions ── */}
        <div>
          <SectionLabel>Occasions</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {OCCASIONS.map((o) => (
              <SelectChip
                key={o.value}
                label={o.label}
                selected={draft.occasions.includes(o.value)}
                onClick={() => toggleArray('occasions', o.value)}
              />
            ))}
          </div>
        </div>

        {/* ── Brand + Notes ── */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <SectionLabel>Brand (optional)</SectionLabel>
            <TextInput
              placeholder="e.g. Zara, COS, Uniqlo…"
              value={draft.brand}
              onChange={(e) => update('brand', e.target.value)}
            />
          </div>
          <div>
            <SectionLabel>Notes (optional)</SectionLabel>
            <TextInput
              placeholder="Any notes about this piece…"
              value={draft.notes}
              onChange={(e) => update('notes', e.target.value)}
            />
          </div>
        </div>

        {/* ── Actions ── */}
        <div className="flex gap-3 pt-2">
          <Button variant="ghost" onClick={onClose} fullWidth>
            Cancel
          </Button>
          <Button onClick={handleSave} fullWidth>
            {editItem ? 'Save Changes' : 'Add to Kloset'}
          </Button>
        </div>
      </div>
    </Modal>
  )
}

function SectionLabel({ children, error }: { children: React.ReactNode; error?: string }) {
  return (
    <p className={clsx('text-sm font-medium mb-3', error ? 'text-red-500' : 'text-charcoal-700')}>
      {children}
    </p>
  )
}
