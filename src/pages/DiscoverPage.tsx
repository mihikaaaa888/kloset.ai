import { useState, useMemo } from 'react'
import { clsx } from 'clsx'

import { ShopItemCard } from '@/components/shop/ShopItemCard'
import { LookCard } from '@/components/shop/LookCard'
import { BudgetDropdown } from '@/components/shop/BudgetDropdown'
import { CompleteAPiece } from '@/components/shop/CompleteAPiece'
import { useWardrobeStore } from '@/store/wardrobeStore'
import { useUserStore } from '@/store/userStore'
import { useAuth } from '@/contexts/AuthContext'
import { insertItem } from '@/lib/wardrobeService'
import { CATALOG_ITEMS } from '@/lib/catalogData'
import {
  buildShoppingLooks,
  fitsBuyBudget,
  fitsRentBudget,
  isRentable,
  rankForUser,
  type BudgetId,
} from '@/lib/shopping'
import type { CatalogItem, ClothingCategory, ClothingItem } from '@/types'

type ShopMode = 'outfit' | 'piece' | 'complete' | 'rent'

const MODES: { id: ShopMode; label: string; blurb: string }[] = [
  { id: 'outfit', label: 'Brand-new outfit', blurb: 'Complete looks, head to toe — built around your style.' },
  { id: 'piece', label: 'New pieces', blurb: 'Single pieces, starting with the gaps in your Kloset.' },
  { id: 'complete', label: 'Complete a piece', blurb: 'Pick something you own, or upload a photo — we’ll find what goes with it.' },
  { id: 'rent', label: 'Rent', blurb: 'Occasion and investment pieces you can rent by the week.' },
]

const CATEGORY_FILTERS: { value: ClothingCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
]

/** Personal shopping — brand-new outfits, single pieces, or rentals, with one budget dropdown. */
export function DiscoverPage() {
  const { user } = useAuth()
  const { items: wardrobeItems, addItem } = useWardrobeStore()
  const profile = useUserStore((s) => s.profile)

  const [mode, setMode] = useState<ShopMode>('outfit')
  const [budget, setBudget] = useState<BudgetId>('any')
  const [category, setCategory] = useState<ClothingCategory | 'all'>('all')
  // Items added this session, for instant UI feedback before the store syncs.
  const [addedThisSession, setAddedThisSession] = useState<Set<string>>(new Set())

  const addedCatalogIds = useMemo(
    () => new Set(wardrobeItems.map((i) => i.catalogId).filter(Boolean) as string[]),
    [wardrobeItems]
  )
  const isInWardrobe = (id: string) => addedCatalogIds.has(id) || addedThisSession.has(id)

  const looks = useMemo(() => buildShoppingLooks(profile, budget), [profile, budget])

  const pieces = useMemo(() => {
    const pool = CATALOG_ITEMS.filter((item) => {
      if (mode === 'rent') return isRentable(item) && fitsRentBudget(item, budget)
      return fitsBuyBudget(item, budget)
    }).filter((item) => category === 'all' || item.category === category)
    return rankForUser(pool, profile, wardrobeItems)
  }, [mode, budget, category, profile, wardrobeItems])

  const handleAdd = (catalogItem: CatalogItem) => {
    if (isInWardrobe(catalogItem.id)) return
    const now = new Date().toISOString()
    const newItem: ClothingItem = {
      id: crypto.randomUUID(),
      name: catalogItem.name,
      category: catalogItem.category,
      subcategory: catalogItem.subcategory,
      imageUrl: catalogItem.imageUrl,
      imageSource: 'remote',
      colour: catalogItem.colours,
      material: catalogItem.material,
      pattern: catalogItem.pattern,
      fit: catalogItem.fit,
      formality: catalogItem.formality,
      seasons: catalogItem.seasons,
      occasions: catalogItem.occasions,
      isFavourite: false,
      timesWorn: 0,
      createdAt: now,
      updatedAt: now,
      catalogId: catalogItem.id,
    }

    console.log('[shop] add to Kloset', { id: catalogItem.id, mode })
    addItem(newItem)
    setAddedThisSession((prev) => new Set(prev).add(catalogItem.id))
    if (user) {
      insertItem(user.id, newItem).catch((err) => console.error('[shop] failed to save item', catalogItem.id, err))
    }
  }

  const activeMode = MODES.find((m) => m.id === mode)!
  const resultCount = mode === 'outfit' ? looks.length : pieces.length
  const isEmpty = resultCount === 0

  return (
    <div className="min-h-screen bg-warm-cream pt-16 lg:pt-20 pb-28 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <header className="pt-10 pb-8 lg:pt-14 text-center">
          <p className="text-butter-yellow text-xs font-medium uppercase tracking-ultra-wide mb-3">
            Personal shopping
          </p>
          <h1 className="font-display text-4xl lg:text-5xl font-medium text-text-primary">
            Shop for you
          </h1>
          <p className="text-text-muted text-sm mt-3">{activeMode.blurb}</p>
        </header>

        {/* ── Toolbar: mode tabs + budget ── */}
        <div className="flex flex-col-reverse sm:flex-row sm:items-end justify-between gap-4 border-b border-text-primary/10 pb-3">
          <nav className="flex gap-6 sm:gap-10 overflow-x-auto no-scrollbar" aria-label="Shopping mode">
            {MODES.map((m) => (
              <button
                key={m.id}
                onClick={() => {
                  console.log('[shop] mode changed', m.id)
                  setMode(m.id)
                  setCategory('all')
                }}
                aria-current={mode === m.id ? 'page' : undefined}
                className={clsx('text-tab sm:text-sm flex-shrink-0', mode === m.id && 'text-tab-active')}
              >
                {m.label}
              </button>
            ))}
          </nav>
          <div className="self-end sm:self-auto">
            <BudgetDropdown value={budget} onChange={setBudget} mode={mode === 'rent' ? 'rent' : 'buy'} />
          </div>
        </div>

        {/* ── Category (single pieces + rentals only) ── */}
        {(mode === 'piece' || mode === 'rent') && (
          <div className="flex gap-6 overflow-x-auto no-scrollbar pt-5">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setCategory(f.value)}
                className={clsx('text-tab flex-shrink-0 !text-2xs', category === f.value && 'text-tab-active')}
              >
                {f.label}
              </button>
            ))}
          </div>
        )}

        {mode !== 'complete' && (
          <p className="text-2xs uppercase tracking-widest text-text-muted pt-5 pb-6">
            {resultCount} {mode === 'outfit' ? (resultCount === 1 ? 'look' : 'looks') : resultCount === 1 ? 'piece' : 'pieces'}
          </p>
        )}

        {/* ── Results ── */}
        {mode === 'complete' ? (
          <div className="pt-10">
            <CompleteAPiece
              budget={budget}
              profile={profile}
              wardrobe={wardrobeItems}
              isInWardrobe={isInWardrobe}
              onAdd={handleAdd}
            />
          </div>
        ) : isEmpty ? (
          <div className="py-20 text-center">
            <p className="font-display text-2xl text-text-primary mb-2">Nothing in this budget yet</p>
            <button
              onClick={() => { setBudget('any'); setCategory('all') }}
              className="text-tab text-tab-active"
            >
              Show everything
            </button>
          </div>
        ) : mode === 'outfit' ? (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-14">
            {looks.map((look) => (
              <LookCard
                key={look.id}
                look={look}
                isInWardrobe={isInWardrobe}
                onAddLook={() => look.pieces.forEach(handleAdd)}
              />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-x-4 gap-y-10">
            {pieces.map((item) => (
              <ShopItemCard
                key={item.id}
                item={item}
                mode={mode === 'rent' ? 'rent' : 'buy'}
                inWardrobe={isInWardrobe(item.id)}
                onAdd={() => handleAdd(item)}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
