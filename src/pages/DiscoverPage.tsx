import { useState, useMemo } from 'react'
import { clsx } from 'clsx'
import { Compass } from 'lucide-react'

import { CatalogCard } from '@/components/catalog/CatalogCard'
import { WebShopSearch } from '@/components/discover/WebShopSearch'
import { useWardrobeStore } from '@/store/wardrobeStore'
import { useAuth } from '@/contexts/AuthContext'
import { insertItem } from '@/lib/wardrobeService'
import { CATALOG_ITEMS, CATALOG_PRICE_LABELS } from '@/lib/catalogData'
import type { CatalogItem, ClothingCategory, StylePreference, ClothingItem } from '@/types'

const CATEGORY_FILTERS: { value: ClothingCategory | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'tops', label: 'Tops' },
  { value: 'bottoms', label: 'Bottoms' },
  { value: 'dresses', label: 'Dresses' },
  { value: 'outerwear', label: 'Outerwear' },
  { value: 'shoes', label: 'Shoes' },
  { value: 'accessories', label: 'Accessories' },
]

type PriceRange = CatalogItem['priceRange']

const BUDGET_FILTERS: { value: PriceRange | 'all'; label: string }[] = [
  { value: 'all', label: 'Any budget' },
  { value: 'budget', label: `${CATALOG_PRICE_LABELS.budget} · under $55` },
  { value: 'mid', label: `${CATALOG_PRICE_LABELS.mid} · $60–140` },
  { value: 'premium', label: `${CATALOG_PRICE_LABELS.premium} · $150–380` },
  { value: 'luxury', label: `${CATALOG_PRICE_LABELS.luxury} · $400+` },
]

const STYLE_FILTERS: { value: StylePreference | 'all'; label: string }[] = [
  { value: 'all', label: 'All styles' },
  { value: 'classic', label: 'Classic' },
  { value: 'minimalist', label: 'Minimalist' },
  { value: 'business', label: 'Business' },
  { value: 'romantic', label: 'Romantic' },
  { value: 'streetwear', label: 'Streetwear' },
  { value: 'bohemian', label: 'Bohemian' },
  { value: 'eclectic', label: 'Eclectic' },
]

export function DiscoverPage() {
  const { user } = useAuth()
  const { items: wardrobeItems, addItem } = useWardrobeStore()

  const [activeCategory, setActiveCategory] = useState<ClothingCategory | 'all'>('all')
  const [activeStyle, setActiveStyle] = useState<StylePreference | 'all'>('all')
  const [activeBudget, setActiveBudget] = useState<PriceRange | 'all'>('all')
  // Track items added this session for instant UI feedback
  const [addedThisSession, setAddedThisSession] = useState<Set<string>>(new Set())

  const addedCatalogIds = useMemo(
    () => new Set(wardrobeItems.map((i) => i.catalogId).filter(Boolean) as string[]),
    [wardrobeItems]
  )

  const filtered = useMemo(() => {
    return CATALOG_ITEMS.filter((item) => {
      const catMatch = activeCategory === 'all' || item.category === activeCategory
      const styleMatch =
        activeStyle === 'all' || item.styleAesthetics.includes(activeStyle as StylePreference)
      const budgetMatch = activeBudget === 'all' || item.priceRange === activeBudget
      return catMatch && styleMatch && budgetMatch
    })
  }, [activeCategory, activeStyle, activeBudget])

  const handleAdd = (catalogItem: CatalogItem) => {
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

    addItem(newItem)
    setAddedThisSession((prev) => new Set(prev).add(catalogItem.id))
    if (user) insertItem(user.id, newItem).catch(() => {})
  }

  const isInWardrobe = (id: string) => addedCatalogIds.has(id) || addedThisSession.has(id)

  const addedCount = addedThisSession.size

  return (
    <div className="min-h-screen bg-warm-cream pt-16 lg:pt-20 pb-28 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="py-8 lg:py-10">
          <div className="flex items-center gap-3 mb-3">
            <div className="w-10 h-10 rounded-2xl bg-dark-purple flex items-center justify-center flex-shrink-0">
              <Compass size={18} className="text-butter-yellow" />
            </div>
            <p className="text-butter-yellow text-xs font-medium uppercase tracking-ultra-wide">
              Curated essentials
            </p>
          </div>
          <h1 className="font-display text-3xl lg:text-4xl font-medium text-text-primary">
            Discover
          </h1>
          <p className="text-text-muted text-sm mt-1 max-w-md">
            {filtered.length} essential pieces — add any directly to your Kloset.
            {addedCount > 0 && (
              <span className="ml-2 text-butter-yellow font-medium">
                {addedCount} added this session.
              </span>
            )}
          </p>
        </div>

        <WebShopSearch />

        {/* ── Category filter ── */}
        <div className="mb-4 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1 min-w-max">
            {CATEGORY_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveCategory(f.value)}
                className={clsx(
                  'px-4 py-2 rounded-full text-sm font-medium border transition-all duration-200 whitespace-nowrap',
                  activeCategory === f.value
                    ? 'bg-dark-purple text-butter-yellow border-dark-purple'
                    : 'bg-white text-text-muted border-text-primary/15 hover:border-text-primary/40 hover:text-text-primary'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Style filter ── */}
        <div className="mb-3 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1 min-w-max">
            {STYLE_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveStyle(f.value)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap',
                  activeStyle === f.value
                    ? 'bg-text-primary/10 text-butter-yellow border-text-primary/30'
                    : 'bg-transparent text-text-muted border-text-primary/10 hover:border-text-primary/25 hover:text-text-primary'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Budget filter ── */}
        <div className="mb-8 overflow-x-auto scrollbar-hide">
          <div className="flex gap-2 pb-1 min-w-max">
            {BUDGET_FILTERS.map((f) => (
              <button
                key={f.value}
                onClick={() => setActiveBudget(f.value)}
                className={clsx(
                  'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap',
                  activeBudget === f.value
                    ? 'bg-butter-yellow/10 text-butter-yellow border-butter-yellow/40'
                    : 'bg-transparent text-text-muted border-text-primary/10 hover:border-text-primary/25 hover:text-text-primary'
                )}
              >
                {f.label}
              </button>
            ))}
          </div>
        </div>

        {/* ── Grid ── */}
        {filtered.length === 0 ? (
          <div className="py-20 flex flex-col items-center text-center">
            <div className="w-16 h-16 rounded-3xl bg-text-primary/8 flex items-center justify-center mb-4">
              <Compass size={24} className="text-text-primary/40" />
            </div>
            <p className="text-text-primary font-medium mb-1">No pieces match these filters</p>
            <button
              onClick={() => { setActiveCategory('all'); setActiveStyle('all'); setActiveBudget('all') }}
              className="text-sm text-butter-yellow underline underline-offset-4 mt-2"
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
            {filtered.map((item) => (
              <CatalogCard
                key={item.id}
                item={item}
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
