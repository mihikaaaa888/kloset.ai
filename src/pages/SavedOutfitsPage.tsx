import { useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { HangerIcon } from '@/components/ui/HangerIcon'

import { SavedOutfitCard } from '@/components/saved/SavedOutfitCard'
import { SavedOutfitDetailModal } from '@/components/saved/SavedOutfitDetailModal'
import { Button } from '@/components/ui/Button'
import { useOutfitStore } from '@/store/outfitStore'
import { useWardrobeStore } from '@/store/wardrobeStore'
import type { Outfit } from '@/types'

export function SavedOutfitsPage() {
  const navigate = useNavigate()
  const { savedOutfits, unsaveOutfit } = useOutfitStore()
  const wardrobeItems = useWardrobeStore((s) => s.items)

  const [selectedOutfit, setSelectedOutfit] = useState<Outfit | null>(null)

  // Pre-resolve wardrobe items for all saved outfits
  const resolvedOutfits = useMemo(
    () =>
      savedOutfits.map((outfit) => ({
        outfit,
        resolvedItems: outfit.items.map((oi) => ({
          itemId: oi.itemId,
          role: oi.role,
          item: wardrobeItems.find((w) => w.id === oi.itemId) ?? null,
        })),
      })),
    [savedOutfits, wardrobeItems]
  )

  const selectedResolved = useMemo(
    () => resolvedOutfits.find((r) => r.outfit.id === selectedOutfit?.id)?.resolvedItems ?? [],
    [resolvedOutfits, selectedOutfit]
  )

  const handleUnsave = (outfit: Outfit, e?: React.MouseEvent) => {
    e?.stopPropagation()
    unsaveOutfit(outfit.id)
    if (selectedOutfit?.id === outfit.id) setSelectedOutfit(null)
  }

  return (
    <div className="min-h-screen bg-warm-cream pt-16 lg:pt-20 pb-28 md:pb-12">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">

        {/* ── Header ── */}
        <div className="py-8 lg:py-10">
          <p className="text-butter-yellow text-xs font-medium uppercase tracking-ultra-wide mb-1">
            Your collection
          </p>
          <h1 className="font-display text-3xl lg:text-4xl font-medium text-text-primary">
            Saved Outfits
          </h1>
          <p className="text-text-muted text-sm mt-1">
            {savedOutfits.length} {savedOutfits.length === 1 ? 'outfit' : 'outfits'} saved
          </p>
        </div>

        {/* ── Empty state ── */}
        {savedOutfits.length === 0 ? (
          <EmptyState onGoToStylist={() => navigate('/stylist')} />
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3 sm:gap-4">
            {resolvedOutfits.map(({ outfit, resolvedItems }) => (
              <SavedOutfitCard
                key={outfit.id}
                outfit={outfit}
                resolvedItems={resolvedItems}
                onClick={() => setSelectedOutfit(outfit)}
                onUnsave={(e) => handleUnsave(outfit, e)}
              />
            ))}
          </div>
        )}
      </div>

      {/* ── Detail modal ── */}
      <SavedOutfitDetailModal
        outfit={selectedOutfit}
        resolvedItems={selectedResolved}
        open={!!selectedOutfit}
        onClose={() => setSelectedOutfit(null)}
        onUnsave={() => selectedOutfit && handleUnsave(selectedOutfit)}
        onStyleSimilar={() => {
          setSelectedOutfit(null)
          navigate('/stylist')
        }}
      />
    </div>
  )
}

function EmptyState({ onGoToStylist }: { onGoToStylist: () => void }) {
  return (
    <div className="py-20 flex flex-col items-center text-center px-4">
      <div className="w-20 h-20 rounded-3xl bg-dark-purple flex items-center justify-center mb-6">
        <HangerIcon size={32} className="text-butter-yellow" />
      </div>
      <h2 className="font-display text-2xl font-medium text-text-primary mb-2">
        No saved outfits yet
      </h2>
      <p className="text-text-muted text-base max-w-sm leading-relaxed mb-8">
        Generate an outfit with your AI stylist and save the ones you love to find them here.
      </p>
      <Button size="lg" onClick={onGoToStylist} className="gap-2">
        <HangerIcon size={16} />
        Open AI Stylist
      </Button>
    </div>
  )
}
