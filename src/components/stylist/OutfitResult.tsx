import { RefreshCw, BookMarked, Check, Sparkles, ChevronRight, Shirt } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/ui/Button'
import { Badge } from '@/components/ui/Badge'
import { colourNameToHex, isLightColour } from '@/lib/colourUtils'
import { useItemImage } from '@/hooks/useItemImage'
import type { OutfitSuggestion, OutfitItemResult } from '@/lib/stylist'

// ─── Occasion + weather display labels ───────────────────────────────────────

const OCCASION_LABELS: Record<string, string> = {
  work: 'Work', casual: 'Casual', 'date-night': 'Date Night', formal: 'Formal',
  weekend: 'Weekend', travel: 'Travel', 'special-event': 'Special Event', gym: 'Gym',
}
const WEATHER_LABELS: Record<string, string> = {
  hot: 'Hot', warm: 'Warm', cool: 'Cool', cold: 'Cold', rainy: 'Rainy',
}
const MOOD_LABELS: Record<string, string> = {
  confident: 'Confident', polished: 'Polished', relaxed: 'Relaxed',
  creative: 'Creative', playful: 'Playful', understated: 'Understated', romantic: 'Romantic',
}

// ─── Component ────────────────────────────────────────────────────────────────

interface OutfitResultProps {
  suggestion: OutfitSuggestion
  onTryAnother: () => void
  onSave: () => void
  isSaved: boolean
  isRegenerating: boolean
}

export function OutfitResult({
  suggestion,
  onTryAnother,
  onSave,
  isSaved,
  isRegenerating,
}: OutfitResultProps) {
  const { name, colourSubtitle, items, whyItWorks, stylingTips, occasion, weather, mood } =
    suggestion

  // Separate items by role for the layout
  const mainItems = items.filter((i) => ['top', 'bottom', 'dress'].includes(i.role))
  const layerItems = items.filter((i) => i.role === 'outerwear')
  const footwearItems = items.filter((i) => i.role === 'shoes')
  const accItems = items.filter((i) => i.role === 'accessory')

  return (
    <div className="animate-fade-up space-y-8">
      {/* ── Outfit header ── */}
      <div>
        <div className="flex items-start justify-between gap-4">
          <div>
            <h2 className="font-display text-3xl sm:text-4xl font-medium text-charcoal-900 leading-tight">
              {name}
            </h2>
            {colourSubtitle && (
              <p className="text-charcoal-400 text-sm mt-1 font-medium tracking-wide">
                {colourSubtitle}
              </p>
            )}
          </div>
          <div className="flex-shrink-0 w-12 h-12 rounded-2xl bg-charcoal-900 flex items-center justify-center">
            <Sparkles size={20} className="text-gold" />
          </div>
        </div>

        {/* Tags */}
        <div className="flex flex-wrap gap-2 mt-4">
          <Badge variant="dark">{OCCASION_LABELS[occasion]}</Badge>
          <Badge variant="neutral">{WEATHER_LABELS[weather]}</Badge>
          <Badge variant="gold">{MOOD_LABELS[mood]}</Badge>
        </div>
      </div>

      {/* ── Outfit items grid ── */}
      <div className="space-y-3">
        {/* Main items (top + bottom, or dress) */}
        <div
          className={clsx(
            'grid gap-3',
            mainItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
          )}
        >
          {mainItems.map((result) => (
            <OutfitItemTile key={result.item.id} result={result} featured />
          ))}
        </div>

        {/* Outerwear */}
        {layerItems.length > 0 && (
          <div className="grid grid-cols-1 gap-3">
            {layerItems.map((result) => (
              <OutfitItemTile key={result.item.id} result={result} />
            ))}
          </div>
        )}

        {/* Shoes + Accessories */}
        {(footwearItems.length > 0 || accItems.length > 0) && (
          <div
            className={clsx(
              'grid gap-3',
              footwearItems.length + accItems.length === 1 ? 'grid-cols-1' : 'grid-cols-2'
            )}
          >
            {[...footwearItems, ...accItems].map((result) => (
              <OutfitItemTile key={result.item.id} result={result} />
            ))}
          </div>
        )}
      </div>

      {/* ── Why it works ── */}
      {whyItWorks && (
        <div className="rounded-3xl bg-charcoal-900 p-6">
          <div className="flex items-center gap-2 mb-3">
            <Sparkles size={14} className="text-gold" />
            <span className="text-gold text-xs font-medium uppercase tracking-widest">
              Why this works
            </span>
          </div>
          <p className="text-cream-50/80 text-sm leading-relaxed">{whyItWorks}</p>

          {/* Colour dots */}
          <div className="flex items-center gap-2 mt-4 pt-4 border-t border-charcoal-700">
            <span className="text-charcoal-400 text-2xs uppercase tracking-widest">Palette</span>
            <div className="flex gap-1.5">
              {[...new Set(items.flatMap((i) => i.item.colour))].slice(0, 6).map((c) => (
                <div
                  key={c}
                  title={c}
                  className="w-4 h-4 rounded-full ring-1 ring-white/10"
                  style={{ backgroundColor: colourNameToHex(c) }}
                />
              ))}
            </div>
          </div>
        </div>
      )}

      {/* ── Styling tips ── */}
      {stylingTips.length > 0 && (
        <div className="rounded-3xl bg-cream-100 p-6">
          <p className="text-xs font-medium text-charcoal-400 uppercase tracking-widest mb-4">
            Styling tips
          </p>
          <ul className="space-y-3">
            {stylingTips.map((tip, i) => (
              <li key={i} className="flex items-start gap-3">
                <ChevronRight size={14} className="text-gold mt-0.5 flex-shrink-0" />
                <p className="text-sm text-charcoal-700 leading-relaxed">{tip}</p>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* ── Actions ── */}
      <div className="flex flex-col sm:flex-row gap-3 pt-2">
        <Button
          variant={isSaved ? 'secondary' : 'primary'}
          size="lg"
          onClick={onSave}
          disabled={isSaved}
          fullWidth
          className="gap-2"
        >
          {isSaved ? (
            <>
              <Check size={16} />
              Outfit Saved
            </>
          ) : (
            <>
              <BookMarked size={16} />
              Save Outfit
            </>
          )}
        </Button>
        <Button
          variant="outline"
          size="lg"
          onClick={onTryAnother}
          loading={isRegenerating}
          fullWidth
          className="gap-2"
        >
          <RefreshCw size={16} className={isRegenerating ? 'animate-spin' : ''} />
          Try Another
        </Button>
      </div>
    </div>
  )
}

// ─── Individual outfit item tile ──────────────────────────────────────────────

function OutfitItemTile({
  result,
  featured = false,
}: {
  result: OutfitItemResult
  featured?: boolean
}) {
  const { item, role, stylingNote } = result
  const imageUrl = useItemImage(item)
  const primaryColour = item.colour[0]
  const bgHex = primaryColour ? colourNameToHex(primaryColour) : '#EDE9E2'
  const isLight = isLightColour(bgHex)

  return (
    <div className="rounded-3xl overflow-hidden bg-white shadow-card">
      {/* Image / placeholder */}
      <div className={clsx('relative', featured ? 'aspect-[4/3]' : 'aspect-[3/2]')}>
        {imageUrl ? (
          <img
            src={imageUrl}
            alt={item.name}
            className="w-full h-full object-cover"
          />
        ) : (
          <div
            className="w-full h-full flex items-center justify-center"
            style={{ backgroundColor: bgHex }}
          >
            <Shirt
              size={featured ? 40 : 28}
              className={clsx('select-none', isLight ? 'text-text-primary opacity-30' : 'text-white opacity-40')}
            />
          </div>
        )}

        {/* Role badge */}
        <div className="absolute top-3 left-3">
          <span className="text-2xs font-medium uppercase tracking-widest px-2.5 py-1 rounded-full bg-white/90 backdrop-blur-sm text-charcoal-700 capitalize">
            {role}
          </span>
        </div>

        {/* Colour dots */}
        {item.colour.length > 0 && (
          <div className="absolute bottom-3 right-3 flex gap-1">
            {item.colour.slice(0, 3).map((c) => (
              <div
                key={c}
                className="w-3 h-3 rounded-full ring-1 ring-black/20 shadow-sm"
                style={{ backgroundColor: colourNameToHex(c) }}
              />
            ))}
          </div>
        )}
      </div>

      {/* Info */}
      <div className="px-4 py-3">
        <p className="text-sm font-medium text-charcoal-900 truncate">{item.name}</p>
        {stylingNote && (
          <p className="text-2xs text-charcoal-400 mt-0.5 leading-snug">{stylingNote}</p>
        )}
      </div>
    </div>
  )
}
