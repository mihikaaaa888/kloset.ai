import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { ArrowLeft, Shirt, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

import { StyleRequestForm } from '@/components/stylist/StyleRequestForm'
import { OutfitResult } from '@/components/stylist/OutfitResult'
import { Button } from '@/components/ui/Button'
import { generateOutfit } from '@/lib/stylist'
import { useWardrobeStore } from '@/store/wardrobeStore'
import { useUserStore } from '@/store/userStore'
import { useOutfitStore } from '@/store/outfitStore'
import type { StyleRequest, OutfitSuggestion } from '@/lib/stylist'
import type { OutfitItem, Outfit } from '@/types'

type PageState = 'form' | 'loading' | 'result'

export function StylistPage() {
  const navigate = useNavigate()
  const items = useWardrobeStore((s) => s.items)
  const profile = useUserStore((s) => s.profile)
  const { saveOutfit, isOutfitSaved } = useOutfitStore()

  const [pageState, setPageState] = useState<PageState>('form')
  const [currentRequest, setCurrentRequest] = useState<StyleRequest | null>(null)
  const [suggestion, setSuggestion] = useState<OutfitSuggestion | null>(null)
  const [attempt, setAttempt] = useState(0)
  const [error, setError] = useState<string | null>(null)
  const [isSaved, setIsSaved] = useState(false)

  const isEmpty = items.length < 2

  const runGeneration = async (request: StyleRequest, currentAttempt: number) => {
    setPageState('loading')
    setError(null)
    setIsSaved(false)

    try {
      const result = await generateOutfit(request, items, profile, currentAttempt)
      if (result.suggestion) {
        setSuggestion(result.suggestion)
        setPageState('result')
        // Check if this id was previously saved
        setIsSaved(isOutfitSaved(result.suggestion.id))
      } else {
        setError(result.error ?? 'Could not generate an outfit. Try adjusting your wardrobe.')
        setPageState('form')
      }
    } catch {
      setError('Something went wrong. Please try again.')
      setPageState('form')
    }
  }

  const handleFormSubmit = (request: StyleRequest) => {
    setCurrentRequest(request)
    setAttempt(0)
    runGeneration(request, 0)
  }

  const handleTryAnother = () => {
    if (!currentRequest) return
    const next = attempt + 1
    setAttempt(next)
    runGeneration(currentRequest, next)
  }

  const handleSave = () => {
    if (!suggestion) return
    const outfitItems: OutfitItem[] = suggestion.items.map((r) => ({
      itemId: r.item.id,
      role: r.role,
    }))
    const outfit: Outfit = {
      id: suggestion.id,
      name: suggestion.name,
      items: outfitItems,
      occasion: suggestion.occasion,
      weather: suggestion.weather,
      mood: suggestion.mood,
      stylingNotes: suggestion.stylingTips.join(' '),
      whyItWorks: suggestion.whyItWorks,
      generatedAt: suggestion.generatedAt,
      isSaved: true,
      source: 'ai-mock',
    }
    saveOutfit(outfit)
    setIsSaved(true)
  }

  const handleBackToForm = () => {
    setPageState('form')
    setSuggestion(null)
    setError(null)
  }

  return (
    <div className="min-h-screen bg-cream-50 pt-16 lg:pt-20 pb-28 md:pb-12">
      <div className="mx-auto max-w-2xl px-4 sm:px-6 lg:px-8">

        {/* ── Page header ── */}
        <div className="py-8 lg:py-10">
          {pageState === 'result' && (
            <button
              onClick={handleBackToForm}
              className="flex items-center gap-2 text-charcoal-400 hover:text-charcoal-900 text-sm font-medium mb-6 transition-colors"
            >
              <ArrowLeft size={16} />
              New request
            </button>
          )}

          {pageState !== 'result' && (
            <>
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 rounded-2xl bg-charcoal-900 flex items-center justify-center">
                  <Sparkles size={18} className="text-gold" />
                </div>
                <div>
                  <p className="text-gold text-xs font-medium uppercase tracking-ultra-wide">
                    AI Stylist
                  </p>
                </div>
              </div>
              <h1 className="font-display text-3xl lg:text-4xl font-medium text-charcoal-900 leading-tight">
                What are we{' '}
                <em className="italic">styling</em> today?
              </h1>
              <p className="text-charcoal-400 text-base mt-2 leading-relaxed">
                Answer three questions and your AI stylist will build an outfit from your Kloset.
              </p>
            </>
          )}
        </div>

        {/* ── Empty wardrobe state ── */}
        {isEmpty && (
          <EmptyWardrobeState onGoToWardrobe={() => navigate('/wardrobe')} />
        )}

        {/* ── Error ── */}
        {error && !isEmpty && (
          <div className="mb-6 p-4 rounded-2xl bg-red-50 border border-red-100 text-sm text-red-700">
            {error}
          </div>
        )}

        {/* ── Form ── */}
        {!isEmpty && pageState === 'form' && (
          <StyleRequestForm onSubmit={handleFormSubmit} isLoading={false} />
        )}

        {/* ── Loading ── */}
        {pageState === 'loading' && (
          <LoadingState occasion={currentRequest?.occasion} />
        )}

        {/* ── Result ── */}
        {pageState === 'result' && suggestion && (
          <OutfitResult
            suggestion={suggestion}
            onTryAnother={handleTryAnother}
            onSave={handleSave}
            isSaved={isSaved}
            isRegenerating={false}
          />
        )}
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function EmptyWardrobeState({ onGoToWardrobe }: { onGoToWardrobe: () => void }) {
  return (
    <div className="py-16 flex flex-col items-center text-center">
      <div className="text-6xl mb-5 select-none">👗</div>
      <h2 className="font-display text-2xl font-medium text-charcoal-900 mb-2">
        Your Kloset needs a few pieces first
      </h2>
      <p className="text-charcoal-400 text-base max-w-sm leading-relaxed mb-8">
        Add at least 2 items to your wardrobe and your AI stylist can start building outfits for you.
      </p>
      <Button size="lg" onClick={onGoToWardrobe} className="gap-2">
        <Shirt size={16} />
        Go to My Kloset
      </Button>
    </div>
  )
}

const LOADING_PHRASES = [
  'Curating your look…',
  'Checking colour harmony…',
  'Considering the occasion…',
  'Pulling pieces together…',
  'Finishing the edit…',
]

function LoadingState({ occasion }: { occasion?: string }) {
  return (
    <div className="py-20 flex flex-col items-center text-center">
      {/* Animated rings */}
      <div className="relative w-20 h-20 mb-8">
        <div className="absolute inset-0 rounded-full border-2 border-cream-200 animate-ping opacity-30" />
        <div className="absolute inset-2 rounded-full border-2 border-charcoal-200 animate-ping opacity-20 animation-delay-150" />
        <div className="w-20 h-20 rounded-full bg-charcoal-900 flex items-center justify-center">
          <Sparkles size={28} className="text-gold animate-pulse" />
        </div>
      </div>

      <p className="font-display text-xl text-charcoal-900 mb-2">
        Styling your {occasion ? <strong>{occasion}</strong> : ''} look
      </p>
      <p className="text-charcoal-400 text-sm animate-pulse">
        {LOADING_PHRASES[Math.floor(Math.random() * LOADING_PHRASES.length)]}
      </p>

      {/* Subtle progress dots */}
      <div className="flex gap-1.5 mt-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className={clsx(
              'w-1.5 h-1.5 rounded-full bg-charcoal-300',
              'animate-pulse'
            )}
            style={{ animationDelay: `${i * 200}ms` }}
          />
        ))}
      </div>
    </div>
  )
}
