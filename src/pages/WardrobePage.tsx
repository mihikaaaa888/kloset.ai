import { useState, useMemo } from 'react'
import { Plus, Search, Sparkles, Shirt, SlidersHorizontal, Compass } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'

import { CategoryFilter } from '@/components/wardrobe/CategoryFilter'
import { ClothingCard } from '@/components/wardrobe/ClothingCard'
import { AddItemModal } from '@/components/wardrobe/AddItemModal'
import { ItemDetailModal } from '@/components/wardrobe/ItemDetailModal'
import { Button } from '@/components/ui/Button'
import { useWardrobeStore } from '@/store/wardrobeStore'
import { useUserStore } from '@/store/userStore'
import { deleteImage } from '@/lib/imageStorage'
import { SAMPLE_WARDROBE_ITEMS } from '@/lib/sampleData'
import { useAuth } from '@/contexts/AuthContext'
import { insertItem, updateItem as dbUpdateItem, deleteItem as dbDeleteItem } from '@/lib/wardrobeService'
import type { ClothingItem, ClothingCategory } from '@/types'

export function WardrobePage() {
  const navigate = useNavigate()
  const profile = useUserStore((s) => s.profile)
  const { user } = useAuth()
  const { items, addItem, updateItem, removeItem, toggleFavourite, activeCategory, setActiveCategory } =
    useWardrobeStore()

  const [showAddModal, setShowAddModal] = useState(false)
  const [editItem, setEditItem] = useState<ClothingItem | undefined>()
  const [detailItem, setDetailItem] = useState<ClothingItem | null>(null)
  const [searchQuery, setSearchQuery] = useState('')
  const [showSearch, setShowSearch] = useState(false)

  const categoryCounts = useMemo(() => {
    const counts: Record<string, number> = {}
    for (const item of items) {
      counts[item.category] = (counts[item.category] ?? 0) + 1
    }
    return counts
  }, [items])

  const filteredItems = useMemo(() => {
    let result = activeCategory === 'all' ? items : items.filter((i) => i.category === activeCategory)
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase()
      result = result.filter(
        (i) =>
          i.name.toLowerCase().includes(q) ||
          i.colour.some((c) => c.toLowerCase().includes(q)) ||
          i.material?.toLowerCase().includes(q) ||
          i.brand?.toLowerCase().includes(q)
      )
    }
    return result
  }, [items, activeCategory, searchQuery])

  const handleAddSamples = () => {
    for (const item of SAMPLE_WARDROBE_ITEMS) {
      addItem({ ...item, id: crypto.randomUUID() })
    }
  }

  const handleSaveItem = (item: ClothingItem) => {
    if (editItem) {
      updateItem(item.id, item)
      if (user) dbUpdateItem(user.id, item).catch(() => {})
    } else {
      addItem(item)
      if (user) insertItem(user.id, item).catch(() => {})
    }
    setEditItem(undefined)
  }

  const handleEdit = (item: ClothingItem) => {
    setDetailItem(null)
    setEditItem(item)
    setShowAddModal(true)
  }

  const handleDelete = (id: string) => {
    if (window.confirm('Remove this item from your Kloset?')) {
      const item = items.find((i) => i.id === id)
      if (item?.imageId) deleteImage(item.imageId).catch(() => {})
      removeItem(id)
      if (user) dbDeleteItem(user.id, id).catch(() => {})
      setDetailItem(null)
    }
  }

  const handleIncrementWorn = (item: ClothingItem) => {
    const updated = { ...item, timesWorn: item.timesWorn + 1 }
    updateItem(item.id, { timesWorn: updated.timesWorn })
    if (user) dbUpdateItem(user.id, updated).catch(() => {})
    setDetailItem((prev) => prev ? { ...prev, timesWorn: updated.timesWorn } : null)
  }

  const openAdd = () => {
    setEditItem(undefined)
    setShowAddModal(true)
  }

  const name = profile?.name?.split(' ')[0] ?? 'your'

  return (
    <div className="min-h-screen bg-warm-cream pt-16 lg:pt-20 pb-28 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* Header */}
        <div className="flex items-start justify-between gap-4 py-8 lg:py-10">
          <div>
            <p className="text-dark-purple bg-text-primary/80 inline-block text-xs font-medium uppercase tracking-ultra-wide mb-2 px-2.5 py-1 rounded-full">
              Your wardrobe
            </p>
            <h1 className="font-display text-3xl lg:text-4xl font-medium text-text-primary">
              {name}&apos;s Kloset
            </h1>
            <p className="text-text-muted text-sm mt-1">
              {items.length} {items.length === 1 ? 'piece' : 'pieces'}
            </p>
          </div>

          <div className="flex items-center gap-2 flex-shrink-0">
            <button
              onClick={() => setShowSearch((v) => !v)}
              className={clsx(
                'p-2.5 rounded-full transition-colors',
                showSearch
                  ? 'bg-dark-purple text-butter-yellow'
                  : 'bg-white text-text-muted hover:bg-text-primary/5 shadow-card'
              )}
              aria-label="Search wardrobe"
            >
              <Search size={18} />
            </button>
            <Button size="sm" onClick={openAdd} className="gap-1.5">
              <Plus size={16} />
              Add Item
            </Button>
          </div>
        </div>

        {/* Search bar */}
        {showSearch && (
          <div className="mb-6 animate-fade-up">
            <div className="relative">
              <Search size={16} className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted pointer-events-none" />
              <input
                autoFocus
                type="search"
                placeholder="Search by name, colour, material…"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-10 pr-4 py-3 rounded-2xl border border-text-primary/15 bg-white text-sm text-text-primary placeholder:text-text-muted focus:outline-none focus:ring-2 focus:ring-text-primary/30 focus:border-text-primary/40 transition-all"
              />
            </div>
          </div>
        )}

        {/* Category filter */}
        {items.length > 0 && (
          <div className="mb-6">
            <CategoryFilter
              active={activeCategory}
              counts={categoryCounts}
              onChange={(cat) => setActiveCategory(cat as ClothingCategory | 'all')}
            />
          </div>
        )}

        {/* Content */}
        {items.length === 0 ? (
          <EmptyState onAdd={openAdd} onLoadSamples={handleAddSamples} />
        ) : filteredItems.length === 0 ? (
          <NoResultsState query={searchQuery} category={activeCategory} onClear={() => {
            setSearchQuery('')
            setActiveCategory('all')
          }} />
        ) : (
          <>
            {items.length >= 3 && (
              <div
                onClick={() => navigate('/stylist')}
                className="mb-6 p-4 rounded-2xl bg-butter-yellow flex items-center justify-between gap-4 cursor-pointer hover:bg-soft-butter transition-colors group"
              >
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 rounded-xl bg-dark-purple/20 flex items-center justify-center flex-shrink-0">
                    <Sparkles size={16} className="text-dark-purple" />
                  </div>
                  <div>
                    <p className="text-dark-purple text-sm font-medium">Ready for a styled outfit?</p>
                    <p className="text-dark-purple/60 text-xs">Your AI stylist can build an outfit from your Kloset</p>
                  </div>
                </div>
                <SlidersHorizontal size={16} className="text-dark-purple/50 group-hover:text-dark-purple/80 transition-colors flex-shrink-0" />
              </div>
            )}

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
              {filteredItems.map((item) => (
                <ClothingCard
                  key={item.id}
                  item={item}
                  onClick={() => setDetailItem(item)}
                  onToggleFavourite={(e) => { e.stopPropagation(); toggleFavourite(item.id) }}
                  onStyleThis={(e) => { e.stopPropagation(); navigate('/stylist', { state: { mode: 'item', itemId: item.id } }) }}
                />
              ))}
              <AddItemCard onClick={openAdd} />
            </div>
          </>
        )}
      </div>

      <AddItemModal
        open={showAddModal}
        onClose={() => { setShowAddModal(false); setEditItem(undefined) }}
        onSave={handleSaveItem}
        editItem={editItem}
      />

      <ItemDetailModal
        item={detailItem}
        open={!!detailItem}
        onClose={() => setDetailItem(null)}
        onEdit={() => detailItem && handleEdit(detailItem)}
        onDelete={() => detailItem && handleDelete(detailItem.id)}
        onToggleFavourite={() => {
          if (!detailItem) return
          toggleFavourite(detailItem.id)
          setDetailItem((prev) => prev ? { ...prev, isFavourite: !prev.isFavourite } : null)
        }}
        onIncrementWorn={() => detailItem && handleIncrementWorn(detailItem)}
      />
    </div>
  )
}

function EmptyState({ onAdd, onLoadSamples }: { onAdd: () => void; onLoadSamples: () => void }) {
  const navigate = useNavigate()
  return (
    <div className="flex flex-col items-center justify-center text-center py-20 px-4">
      <div className="w-20 h-20 rounded-3xl bg-text-primary/8 flex items-center justify-center mb-6">
        <Shirt size={32} className="text-text-primary/40" />
      </div>
      <h2 className="font-display text-2xl font-medium text-text-primary mb-2">Your Kloset is empty</h2>
      <p className="text-text-muted text-base leading-relaxed max-w-sm mb-8">
        Start adding your clothes to get outfit recommendations tailored to what you actually own —
        or skip the uploads and build from our curated inspiration instead.
      </p>
      <div className="flex flex-col sm:flex-row gap-3">
        <Button size="lg" onClick={onAdd} className="gap-2">
          <Plus size={16} />
          Add your first item
        </Button>
        <Button variant="secondary" size="lg" onClick={() => navigate('/discover')} className="gap-2">
          <Compass size={16} />
          Browse inspiration
        </Button>
        <Button variant="secondary" size="lg" onClick={onLoadSamples}>
          Load sample wardrobe
        </Button>
      </div>
      <p className="text-text-muted/60 text-xs mt-5">
        Browse inspiration to pick pieces from our curated catalogue — no photos required.
      </p>
    </div>
  )
}

function NoResultsState({ query, category, onClear }: { query: string; category: string; onClear: () => void }) {
  return (
    <div className="flex flex-col items-center justify-center text-center py-16 px-4">
      <div className="w-16 h-16 rounded-3xl bg-text-primary/8 flex items-center justify-center mb-4">
        <Search size={24} className="text-text-primary/40" />
      </div>
      <h3 className="font-display text-xl font-medium text-text-primary mb-2">No items found</h3>
      <p className="text-text-muted text-sm mb-6">
        {query
          ? `Nothing matched "${query}" in ${category === 'all' ? 'your wardrobe' : category}`
          : `You don't have anything in ${category} yet`}
      </p>
      <button
        onClick={onClear}
        className="text-sm text-text-primary underline underline-offset-4 hover:text-text-muted transition-colors"
      >
        Clear filters
      </button>
    </div>
  )
}

function AddItemCard({ onClick }: { onClick: () => void }) {
  return (
    <button
      onClick={onClick}
      className="rounded-3xl border-2 border-dashed border-text-primary/15 hover:border-text-primary/40 hover:bg-text-primary/5 transition-all duration-200 flex flex-col items-center justify-center gap-2 aspect-[3/4] group"
    >
      <div className="w-10 h-10 rounded-full bg-text-primary/8 group-hover:bg-text-primary/15 flex items-center justify-center transition-colors">
        <Plus size={18} className="text-text-primary/50" />
      </div>
      <span className="text-xs font-medium text-text-muted group-hover:text-text-primary transition-colors">
        Add item
      </span>
    </button>
  )
}
