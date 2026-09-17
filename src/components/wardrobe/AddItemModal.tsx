import { useState, useRef, useCallback, useEffect } from 'react'
import { Upload, ImagePlus, X, ChevronRight, SkipForward } from 'lucide-react'
import { clsx } from 'clsx'
import { Modal } from '@/components/ui/Modal'
import { Button } from '@/components/ui/Button'
import { TextInput } from '@/components/ui/TextInput'
import { SelectChip } from '@/components/ui/SelectChip'
import { ColourSwatch } from '@/components/ui/ColourSwatch'
import { COLOUR_PALETTE } from '@/lib/colourUtils'
import {
  saveImage,
  getImage,
  deleteImage,
  validateImageFile,
  compressImage,
} from '@/lib/imageStorage'
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

const SUBCATEGORIES: Partial<Record<ClothingCategory, string[]>> = {
  tops: ['T-shirt', 'Shirt', 'Blouse', 'Tank Top', 'Polo', 'Crop Top', 'Hoodie', 'Sweatshirt'],
  bottoms: ['Jeans', 'Trousers', 'Shorts', 'Skirt', 'Leggings', 'Joggers'],
  dresses: ['Casual Dress', 'Midi Dress', 'Maxi Dress', 'Mini Dress', 'Wrap Dress', 'Sundress'],
  outerwear: ['Blazer', 'Jacket', 'Coat', 'Cardigan', 'Puffer', 'Raincoat', 'Leather Jacket'],
  shoes: ['Sneakers', 'Boots', 'Heels', 'Loafers', 'Sandals', 'Flats', 'Mules'],
  accessories: ['Bag', 'Jewellery', 'Belt', 'Hat', 'Scarf', 'Watch', 'Sunglasses'],
}

const FIT_OPTIONS = ['Slim', 'Regular', 'Relaxed', 'Oversized', 'Fitted']

const FORMALITY_OPTIONS = ['Casual', 'Smart Casual', 'Business', 'Formal', 'Black Tie']

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
  subcategory: string
  colour: string[]
  material: string
  pattern: Pattern | ''
  fit: string
  formality: string
  seasons: Season[]
  occasions: Occasion[]
  brand: string
  notes: string
}

function blankDraft(): ItemDraft {
  return {
    name: '',
    category: '',
    subcategory: '',
    colour: [],
    material: '',
    pattern: 'solid',
    fit: '',
    formality: '',
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
    subcategory: item.subcategory ?? '',
    colour: item.colour,
    material: item.material ?? '',
    pattern: item.pattern,
    fit: item.fit ?? '',
    formality: item.formality ?? '',
    seasons: item.seasons,
    occasions: item.occasions,
    brand: item.brand ?? '',
    notes: item.notes ?? '',
  }
}

// ─── Image state ──────────────────────────────────────────────────────────────

interface QueuedImage {
  imageId: string
  previewUrl: string
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

  // ── Image state ──────────────────────────────────────────────────────────────
  // activeImageId: the imageId to persist in ClothingItem (IndexedDB key)
  const [activeImageId, setActiveImageId] = useState<string | null>(null)
  // legacyImageUrl: base64/remote imageUrl from an old item, preserved if not replaced
  const [legacyImageUrl, setLegacyImageUrl] = useState<string | null>(null)
  // previewUrl: displayed in the modal (blob URL or base64)
  const [previewUrl, setPreviewUrl] = useState<string | null>(null)
  const [imageProcessing, setImageProcessing] = useState(false)
  const [imageError, setImageError] = useState<string | null>(null)
  const [dragOver, setDragOver] = useState(false)

  // Multi-upload batch (new items only)
  const [uploadBatch, setUploadBatch] = useState<QueuedImage[]>([])
  const [batchIdx, setBatchIdx] = useState(0)
  const isInBatch = uploadBatch.length > 1

  // Refs for cleanup (using refs so closures always see current values)
  const pendingMap = useRef(new Map<string, string>()) // imageId → previewUrl (uploaded, not saved)
  const priorImageId = useRef<string | null>(null)     // old imageId to delete when saving
  const fileInputRef = useRef<HTMLInputElement>(null)

  // ── Reset when modal opens ───────────────────────────────────────────────────
  useEffect(() => {
    if (!open) return
    setDraft(editItem ? itemToDraft(editItem) : blankDraft())
    setErrors({})
    setImageError(null)
    setUploadBatch([])
    setBatchIdx(0)
    setActiveImageId(editItem?.imageId ?? null)
    setLegacyImageUrl(editItem?.imageUrl ?? null)
    // Show base64 image immediately; IndexedDB images loaded below
    setPreviewUrl(editItem?.imageUrl ?? null)
    pendingMap.current = new Map()
    priorImageId.current = null
  }, [open]) // eslint-disable-line react-hooks/exhaustive-deps

  // ── Load existing IndexedDB image for edit mode ──────────────────────────────
  useEffect(() => {
    if (!open || !editItem?.imageId || editItem.imageUrl) return
    let cancelled = false

    getImage(editItem.imageId).then((blob) => {
      if (cancelled || !blob) return
      const url = URL.createObjectURL(blob)
      setPreviewUrl(url)
    }).catch(() => {})

    return () => { cancelled = true }
  }, [open, editItem?.imageId, editItem?.imageUrl])

  // ── Process selected files ───────────────────────────────────────────────────
  const processFiles = useCallback(async (files: File[]) => {
    setImageProcessing(true)
    setImageError(null)

    const valid: File[] = []
    const errs: string[] = []
    for (const f of files) {
      const err = validateImageFile(f)
      if (err) errs.push(`${f.name}: ${err}`)
      else valid.push(f)
    }

    if (valid.length === 0) {
      setImageError(errs[0] ?? 'No valid images selected.')
      setImageProcessing(false)
      return
    }

    try {
      const processed: QueuedImage[] = []
      for (const file of valid) {
        const blob = await compressImage(file)
        const imageId = await saveImage(blob)
        const url = URL.createObjectURL(blob)
        processed.push({ imageId, previewUrl: url })
        pendingMap.current.set(imageId, url)
      }

      // If there was already a pending (just-uploaded, not from editItem) image, clean it up
      if (activeImageId && pendingMap.current.has(activeImageId)) {
        deleteImage(activeImageId).catch(() => {})
        URL.revokeObjectURL(pendingMap.current.get(activeImageId)!)
        pendingMap.current.delete(activeImageId)
      }

      // Record the original imageId for deletion when saving in edit mode
      if (editItem?.imageId && !priorImageId.current) {
        priorImageId.current = editItem.imageId
      }

      // Set first image as active
      const first = processed[0]
      setActiveImageId(first.imageId)
      setPreviewUrl(first.previewUrl)
      setLegacyImageUrl(null)

      if (processed.length > 1) {
        setUploadBatch(processed)
        setBatchIdx(0)
      } else {
        setUploadBatch([])
      }

      if (errs.length > 0) {
        setImageError(`${errs.length} file(s) skipped — unsupported format or too large.`)
      }
    } catch (e) {
      setImageError(e instanceof Error ? e.message : 'Failed to process image.')
    } finally {
      setImageProcessing(false)
      if (fileInputRef.current) fileInputRef.current.value = ''
    }
  }, [activeImageId, editItem?.imageId])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? [])
    if (files.length) processFiles(files)
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    setDragOver(false)
    const files = Array.from(e.dataTransfer.files)
    if (files.length) processFiles(files)
  }

  const handleRemoveImage = () => {
    // Track original imageId for deletion if user removes image in edit mode
    if (editItem?.imageId && !priorImageId.current) {
      priorImageId.current = editItem.imageId
    }
    // Note: pendingMap entries stay until modal closes — they'll be cleaned up there
    setActiveImageId(null)
    setLegacyImageUrl(null)
    setPreviewUrl(null)
  }

  // ── Cleanup on close ─────────────────────────────────────────────────────────
  const handleClose = useCallback(() => {
    // Delete all uploaded-but-not-saved images from IndexedDB
    for (const [id, url] of pendingMap.current) {
      deleteImage(id).catch(() => {})
      URL.revokeObjectURL(url)
    }
    pendingMap.current = new Map()

    // Revoke any edit-mode blob URL that wasn't tracked in pendingMap
    if (previewUrl && previewUrl.startsWith('blob:') && !pendingMap.current.has(activeImageId ?? '')) {
      URL.revokeObjectURL(previewUrl)
    }

    setUploadBatch([])
    setBatchIdx(0)
    setActiveImageId(null)
    setLegacyImageUrl(null)
    setPreviewUrl(null)
    setImageError(null)
    priorImageId.current = null

    onClose()
  }, [onClose, previewUrl, activeImageId])

  // ── Form helpers ─────────────────────────────────────────────────────────────
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

  const validate = (): boolean => {
    const newErrors: typeof errors = {}
    if (!draft.name.trim()) newErrors.name = 'Name is required'
    if (!draft.category) newErrors.category = 'Please select a category'
    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  // ── Save ─────────────────────────────────────────────────────────────────────
  const handleSave = () => {
    if (!validate()) return
    const now = new Date().toISOString()

    // Delete replaced image in edit mode
    if (priorImageId.current) {
      deleteImage(priorImageId.current).catch(() => {})
      priorImageId.current = null
    }

    // Remove the saved imageId from pending cleanup
    if (activeImageId) {
      pendingMap.current.delete(activeImageId)
    }

    // Determine image fields
    const imageFields: Pick<ClothingItem, 'imageId' | 'imageUrl' | 'imageSource'> = activeImageId
      ? { imageId: activeImageId, imageUrl: null, imageSource: 'local' }
      : legacyImageUrl
      ? { imageId: undefined, imageUrl: legacyImageUrl, imageSource: 'local' }
      : { imageId: undefined, imageUrl: null, imageSource: 'none' }

    const item: ClothingItem = {
      ...(editItem ?? {
        id: crypto.randomUUID(),
        isFavourite: false,
        timesWorn: 0,
        createdAt: now,
      }),
      name: draft.name.trim(),
      category: draft.category as ClothingCategory,
      subcategory: draft.subcategory || undefined,
      ...imageFields,
      colour: draft.colour,
      material: draft.material.trim() || undefined,
      pattern: (draft.pattern as Pattern) || 'solid',
      fit: draft.fit || undefined,
      formality: draft.formality || undefined,
      seasons: draft.seasons,
      occasions: draft.occasions,
      brand: draft.brand.trim() || undefined,
      notes: draft.notes.trim() || undefined,
      updatedAt: now,
    }

    onSave(item)

    // Advance through batch or close
    const nextIdx = batchIdx + 1
    if (isInBatch && nextIdx < uploadBatch.length) {
      const next = uploadBatch[nextIdx]
      setBatchIdx(nextIdx)
      setActiveImageId(next.imageId)
      setPreviewUrl(next.previewUrl)
      setLegacyImageUrl(null)
      priorImageId.current = null
      setDraft(blankDraft())
      setErrors({})
      setImageError(null)
    } else {
      handleClose()
    }
  }

  // ── Skip in batch ────────────────────────────────────────────────────────────
  const handleSkip = () => {
    if (!isInBatch || batchIdx >= uploadBatch.length) return
    const current = uploadBatch[batchIdx]
    if (current) {
      deleteImage(current.imageId).catch(() => {})
      URL.revokeObjectURL(current.previewUrl)
      pendingMap.current.delete(current.imageId)
    }

    const nextIdx = batchIdx + 1
    if (nextIdx < uploadBatch.length) {
      const next = uploadBatch[nextIdx]
      setBatchIdx(nextIdx)
      setActiveImageId(next.imageId)
      setPreviewUrl(next.previewUrl)
      setDraft(blankDraft())
      setErrors({})
      setImageError(null)
    } else {
      handleClose()
    }
  }

  // ── Render ───────────────────────────────────────────────────────────────────
  const subcategoryOptions = draft.category ? SUBCATEGORIES[draft.category as ClothingCategory] : undefined

  const batchLabel = isInBatch
    ? `Photo ${batchIdx + 1} of ${uploadBatch.length}`
    : null

  const displayUrl = previewUrl

  return (
    <Modal
      open={open}
      onClose={handleClose}
      title={
        batchLabel
          ? `Add to My Kloset — ${batchLabel}`
          : editItem
          ? 'Edit Item'
          : 'Add to My Kloset'
      }
      variant="sheet"
    >
      <div className="px-6 py-4 pb-8 space-y-7">

        {/* ── Batch progress bar ── */}
        {isInBatch && (
          <div className="space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="text-xs text-charcoal-400">{batchLabel}</span>
              <button
                onClick={handleSkip}
                className="flex items-center gap-1 text-xs text-charcoal-400 hover:text-charcoal-700 transition-colors"
              >
                <SkipForward size={12} />
                Skip this photo
              </button>
            </div>
            <div className="h-1 rounded-full bg-cream-200 overflow-hidden">
              <div
                className="h-full bg-charcoal-900 rounded-full transition-all duration-300"
                style={{ width: `${((batchIdx + 1) / uploadBatch.length) * 100}%` }}
              />
            </div>
          </div>
        )}

        {/* ── Image Upload ── */}
        <div>
          <SectionLabel>Photo</SectionLabel>

          {imageError && (
            <p className="text-xs text-amber-600 mb-2 bg-amber-50 px-3 py-2 rounded-xl">
              {imageError}
            </p>
          )}

          {displayUrl ? (
            <div className="relative rounded-2xl overflow-hidden aspect-[4/3]">
              <img
                src={displayUrl}
                alt="Item preview"
                className="w-full h-full object-cover"
              />
              <button
                onClick={handleRemoveImage}
                className="absolute top-3 right-3 w-8 h-8 rounded-full bg-charcoal-900/70 flex items-center justify-center text-white hover:bg-charcoal-900 transition-colors"
                aria-label="Remove image"
              >
                <X size={14} />
              </button>
              {!isInBatch && (
                <button
                  onClick={() => fileInputRef.current?.click()}
                  className="absolute bottom-3 left-3 flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 backdrop-blur-sm text-charcoal-700 text-xs font-medium hover:bg-white transition-colors"
                >
                  <Upload size={11} />
                  Replace
                </button>
              )}
            </div>
          ) : (
            <div
              onClick={() => !imageProcessing && fileInputRef.current?.click()}
              onDragOver={(e) => { e.preventDefault(); setDragOver(true) }}
              onDragLeave={() => setDragOver(false)}
              onDrop={handleDrop}
              className={clsx(
                'rounded-2xl border-2 border-dashed flex flex-col items-center justify-center gap-3 py-10 transition-all duration-200',
                imageProcessing ? 'cursor-wait opacity-60' : 'cursor-pointer',
                dragOver
                  ? 'border-charcoal-900 bg-cream-100'
                  : 'border-cream-300 hover:border-charcoal-400 hover:bg-cream-50'
              )}
            >
              {imageProcessing ? (
                <>
                  <div className="w-8 h-8 rounded-full border-2 border-charcoal-400 border-t-transparent animate-spin" />
                  <p className="text-sm text-charcoal-400">Processing…</p>
                </>
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
                    <span>JPG, PNG, WEBP · max 15 MB</span>
                  </div>
                </>
              )}
            </div>
          )}

          <input
            ref={fileInputRef}
            type="file"
            accept="image/jpeg,image/png,image/webp"
            multiple={!editItem}
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
                onClick={() => {
                  update('category', cat.value)
                  update('subcategory', '') // reset subcategory when category changes
                }}
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

        {/* ── Subcategory ── */}
        {subcategoryOptions && subcategoryOptions.length > 0 && (
          <div>
            <SectionLabel>Type</SectionLabel>
            <div className="flex flex-wrap gap-2">
              {subcategoryOptions.map((sub) => (
                <SelectChip
                  key={sub}
                  label={sub}
                  selected={draft.subcategory === sub}
                  onClick={() => update('subcategory', draft.subcategory === sub ? '' : sub)}
                />
              ))}
            </div>
          </div>
        )}

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

        {/* ── Fit ── */}
        <div>
          <SectionLabel>Fit</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {FIT_OPTIONS.map((f) => (
              <SelectChip
                key={f}
                label={f}
                selected={draft.fit === f}
                onClick={() => update('fit', draft.fit === f ? '' : f)}
              />
            ))}
          </div>
        </div>

        {/* ── Formality ── */}
        <div>
          <SectionLabel>Formality</SectionLabel>
          <div className="flex flex-wrap gap-2">
            {FORMALITY_OPTIONS.map((f) => (
              <SelectChip
                key={f}
                label={f}
                selected={draft.formality === f}
                onClick={() => update('formality', draft.formality === f ? '' : f)}
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
          <Button variant="ghost" onClick={handleClose} fullWidth>
            Cancel
          </Button>
          <Button onClick={handleSave} fullWidth className="gap-1.5">
            {isInBatch ? (
              <>
                Add to Kloset
                <ChevronRight size={14} />
              </>
            ) : editItem ? (
              'Save Changes'
            ) : (
              'Add to Kloset'
            )}
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
