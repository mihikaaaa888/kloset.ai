import { useState } from 'react'
import { Sparkles, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/ui/Button'
import type { StyleRequest, WeatherCondition, Mood } from '@/lib/stylist'
import type { Occasion } from '@/types'

// ─── Option data ──────────────────────────────────────────────────────────────

const OCCASIONS: { value: Occasion; label: string; emoji: string }[] = [
  { value: 'work', label: 'Work', emoji: '💼' },
  { value: 'casual', label: 'Casual', emoji: '☕' },
  { value: 'date-night', label: 'Date Night', emoji: '✨' },
  { value: 'formal', label: 'Formal', emoji: '🥂' },
  { value: 'weekend', label: 'Weekend', emoji: '🌿' },
  { value: 'travel', label: 'Travel', emoji: '✈️' },
  { value: 'special-event', label: 'Special Event', emoji: '🎉' },
  { value: 'gym', label: 'Gym', emoji: '💪' },
]

const WEATHER_OPTIONS: { value: WeatherCondition; label: string; emoji: string; description: string }[] = [
  { value: 'hot', label: 'Hot', emoji: '☀️', description: '25°C+' },
  { value: 'warm', label: 'Warm', emoji: '🌤', description: '18–25°C' },
  { value: 'cool', label: 'Cool', emoji: '🍂', description: '12–18°C' },
  { value: 'cold', label: 'Cold', emoji: '❄️', description: 'Under 12°C' },
  { value: 'rainy', label: 'Rainy', emoji: '🌧', description: 'Wet outside' },
]

const MOODS: { value: Mood; label: string; emoji: string }[] = [
  { value: 'confident', label: 'Confident', emoji: '🔥' },
  { value: 'polished', label: 'Polished', emoji: '💎' },
  { value: 'relaxed', label: 'Relaxed', emoji: '🌊' },
  { value: 'creative', label: 'Creative', emoji: '🎨' },
  { value: 'playful', label: 'Playful', emoji: '🌈' },
  { value: 'understated', label: 'Understated', emoji: '🤍' },
  { value: 'romantic', label: 'Romantic', emoji: '🌸' },
]

// ─── Component ────────────────────────────────────────────────────────────────

interface StyleRequestFormProps {
  onSubmit: (request: StyleRequest) => void
  isLoading: boolean
}

export function StyleRequestForm({ onSubmit, isLoading }: StyleRequestFormProps) {
  const [occasion, setOccasion] = useState<Occasion | null>(null)
  const [weather, setWeather] = useState<WeatherCondition | null>(null)
  const [mood, setMood] = useState<Mood | null>(null)

  const canSubmit = occasion && weather && mood

  const handleSubmit = () => {
    if (!canSubmit) return
    onSubmit({ occasion, weather, mood })
  }

  return (
    <div className="space-y-10">
      {/* Question 1 — Occasion */}
      <FormQuestion
        number="01"
        question="What are you dressing for?"
        answered={!!occasion}
      >
        <div className="flex flex-wrap gap-2.5">
          {OCCASIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setOccasion(opt.value)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border',
                'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900',
                occasion === opt.value
                  ? 'bg-charcoal-900 text-cream-50 border-charcoal-900 shadow-soft'
                  : 'bg-white text-charcoal-700 border-cream-200 hover:border-charcoal-400 hover:text-charcoal-900'
              )}
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </FormQuestion>

      {/* Question 2 — Weather */}
      <FormQuestion
        number="02"
        question="What's the weather like?"
        answered={!!weather}
      >
        <div className="flex flex-wrap gap-2.5">
          {WEATHER_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setWeather(opt.value)}
              className={clsx(
                'flex flex-col items-center px-5 py-3 rounded-2xl border text-center min-w-[76px]',
                'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900',
                weather === opt.value
                  ? 'bg-charcoal-900 text-cream-50 border-charcoal-900 shadow-soft'
                  : 'bg-white text-charcoal-700 border-cream-200 hover:border-charcoal-400'
              )}
            >
              <span className="text-2xl mb-1">{opt.emoji}</span>
              <span className="text-sm font-medium">{opt.label}</span>
              <span
                className={clsx(
                  'text-2xs mt-0.5',
                  weather === opt.value ? 'text-cream-300' : 'text-charcoal-400'
                )}
              >
                {opt.description}
              </span>
            </button>
          ))}
        </div>
      </FormQuestion>

      {/* Question 3 — Mood */}
      <FormQuestion
        number="03"
        question="How do you want to feel?"
        answered={!!mood}
      >
        <div className="flex flex-wrap gap-2.5">
          {MOODS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setMood(opt.value)}
              className={clsx(
                'flex items-center gap-2 px-4 py-2.5 rounded-full text-sm font-medium border',
                'transition-all duration-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900',
                mood === opt.value
                  ? 'bg-charcoal-900 text-cream-50 border-charcoal-900 shadow-soft'
                  : 'bg-white text-charcoal-700 border-cream-200 hover:border-charcoal-400 hover:text-charcoal-900'
              )}
            >
              <span>{opt.emoji}</span>
              {opt.label}
            </button>
          ))}
        </div>
      </FormQuestion>

      {/* Submit */}
      <div className="pt-2">
        <Button
          size="xl"
          onClick={handleSubmit}
          disabled={!canSubmit}
          loading={isLoading}
          className="group w-full sm:w-auto gap-3"
        >
          <Sparkles size={18} />
          {isLoading ? 'Styling your look…' : 'Style Me'}
          {!isLoading && (
            <ArrowRight
              size={16}
              className="transition-transform duration-200 group-hover:translate-x-1"
            />
          )}
        </Button>
        {!canSubmit && (
          <p className="text-xs text-charcoal-400 mt-3">
            Answer all three questions to generate your outfit
          </p>
        )}
      </div>
    </div>
  )
}

// ─── Sub-component ────────────────────────────────────────────────────────────

function FormQuestion({
  number,
  question,
  answered,
  children,
}: {
  number: string
  question: string
  answered: boolean
  children: React.ReactNode
}) {
  return (
    <div className="relative">
      {/* Number + question */}
      <div className="flex items-center gap-3 mb-5">
        <span
          className={clsx(
            'text-xs font-medium tabular-nums transition-colors duration-300',
            answered ? 'text-gold' : 'text-charcoal-300'
          )}
        >
          {number}
        </span>
        <div className={clsx('w-px h-4 transition-colors duration-300', answered ? 'bg-gold' : 'bg-cream-300')} />
        <h3 className="font-serif text-lg text-charcoal-900">{question}</h3>
        {answered && (
          <span className="ml-auto text-gold">
            <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
              <path d="M2 7l3.5 3.5L12 3.5" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          </span>
        )}
      </div>
      {children}
    </div>
  )
}
