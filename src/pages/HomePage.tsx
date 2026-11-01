import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shirt, Heart, Plus, ArrowRight, CloudSun, Sparkles } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { useWardrobeStore } from '@/store/wardrobeStore'
import { useItemImage } from '@/hooks/useItemImage'
import type { ClothingItem } from '@/types'
import { generateOutfit, type WeatherCondition } from '@/lib/stylist'

export function HomePage() {
  const navigate = useNavigate()
  const profile = useUserStore((s) => s.profile)
  const items = useWardrobeStore((s) => s.items)

  const favourites = items.filter((i) => i.isFavourite).slice(0, 4)

  return (
    <div className="min-h-screen bg-warm-cream pt-16 lg:pt-20 pb-24 md:pb-0">
      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">

        <DailyOutfitCard
          items={items}
          profile={profile}
          onOpenStylist={() => navigate('/stylist', { state: { mode: 'wardrobe' } })}
        />

        {/* ── Wardrobe empty state ── */}
        {items.length === 0 && (
          <section className="border-y border-text-primary/15 py-16 text-center mb-20">
            <h3 className="font-display text-3xl font-medium text-text-primary mb-3">Start building your Kloset</h3>
            <p className="text-text-muted text-sm max-w-sm mx-auto mb-8">
              Add your clothes to get outfits made for you.
            </p>
            <button onClick={() => navigate('/wardrobe')} className="text-tab text-tab-active sm:text-sm">
              <Plus size={13} /> Add your first piece
            </button>
          </section>
        )}

        {/* ── Favourites ── */}
        {favourites.length > 0 && (
          <section className="mb-20">
            <SectionHeader title="Your favourites" action={{ label: 'View all', onClick: () => navigate('/wardrobe') }} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-8">
              {favourites.map((item) => <WardrobeThumb key={item.id} item={item} onClick={() => navigate('/wardrobe')} />)}
            </div>
          </section>
        )}

      </div>

      {/* ── Stylist CTA ── */}
      <button onClick={() => navigate('/stylist', { state: { mode: 'wardrobe' } })} className="group block w-full text-left bg-deep-purple hover:bg-dark-purple transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-8 lg:py-10 flex flex-col sm:flex-row sm:items-center justify-between gap-5">
          <div>
            <p className="text-2xs uppercase tracking-ultra-wide text-butter-yellow font-medium mb-2">Your personal stylist</p>
            <h3 className="font-display text-3xl lg:text-4xl font-medium text-text-primary leading-none">
              Go to <em className="italic text-butter-yellow">stylist</em>
            </h3>
            <p className="text-text-muted text-sm mt-3 max-w-md">
              Get a fresh look from the pieces you already own.
            </p>
          </div>
          <span className="flex items-center gap-2 text-2xs uppercase tracking-widest font-semibold text-text-primary flex-shrink-0">
            Open stylist
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </button>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

type CurrentWeather = { temperature: number; label: string; condition: WeatherCondition; dateKey: string }

function dailyWeatherCondition(temperature: number, code: number): WeatherCondition {
  if ([51, 53, 55, 56, 57, 61, 63, 65, 66, 67, 80, 81, 82, 95, 96, 99].includes(code)) return 'rainy'
  if (temperature >= 30) return 'hot'
  if (temperature >= 23) return 'warm'
  if (temperature >= 14) return 'cool'
  return 'cold'
}

function weatherDescription(code: number): string {
  if (code === 0) return 'Clear sky'
  if (code === 1) return 'Mostly clear'
  if (code === 2) return 'Partly cloudy'
  if (code === 3) return 'Overcast'
  if (code === 45 || code === 48) return 'Foggy'
  if (code >= 51 && code <= 57) return 'Drizzle'
  if (code >= 61 && code <= 67) return 'Rain'
  if (code >= 71 && code <= 77) return 'Snow'
  if (code >= 80 && code <= 82) return 'Rain showers'
  if (code === 85 || code === 86) return 'Snow showers'
  if (code >= 95) return 'Thunderstorm'
  return 'Current conditions'
}

function DailyOutfitCard({
  items,
  profile,
  onOpenStylist,
}: {
  items: ClothingItem[]
  profile: Parameters<typeof generateOutfit>[2]
  onOpenStylist: () => void
}) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null)
  const [weatherError, setWeatherError] = useState(false)
  const [recommendation, setRecommendation] = useState<ClothingItem[] | null>(null)
  const [recommendationLoading, setRecommendationLoading] = useState(false)
  const [today, setToday] = useState(() => new Date())
  const dateLabel = new Intl.DateTimeFormat(undefined, { weekday: 'long', month: 'long', day: 'numeric', year: 'numeric' }).format(today)

  useEffect(() => {
    const now = new Date()
    const nextLocalDay = new Date(now.getFullYear(), now.getMonth(), now.getDate() + 1)
    const timer = window.setTimeout(() => setToday(new Date()), nextLocalDay.getTime() - now.getTime() + 50)
    return () => window.clearTimeout(timer)
  }, [today.getDate(), today.getMonth(), today.getFullYear()])

  useEffect(() => {
    const weatherDateKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    setWeather(null)
    setWeatherError(false)
    if (!navigator.geolocation) {
      setWeatherError(true)
      return
    }

    navigator.geolocation.getCurrentPosition(async ({ coords }) => {
      try {
        const params = new URLSearchParams({
          latitude: String(coords.latitude),
          longitude: String(coords.longitude),
          current: 'temperature_2m,weather_code',
          timezone: 'auto',
        })
        const response = await fetch(`https://api.open-meteo.com/v1/forecast?${params}`)
        if (!response.ok) throw new Error('Weather request failed')
        const data = await response.json() as { current?: { temperature_2m?: number; weather_code?: number } }
        const temperature = data.current?.temperature_2m
        const code = data.current?.weather_code
        if (temperature === undefined || code === undefined) throw new Error('Weather data unavailable')
        setWeather({ temperature, label: weatherDescription(code), condition: dailyWeatherCondition(temperature, code), dateKey: weatherDateKey })
      } catch {
        setWeatherError(true)
      }
    }, () => setWeatherError(true), { timeout: 12000, maximumAge: 30 * 60 * 1000 })
  }, [today.getDate(), today.getMonth(), today.getFullYear()])

  useEffect(() => {
    const dayKey = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, '0')}-${String(today.getDate()).padStart(2, '0')}`
    if (!weather || weather.dateKey !== dayKey || items.length < 2) return
    let cancelled = false
    const wardrobeKey = items.map((item) => item.id).sort().join(',')
    const cacheKey = `kloset:daily-outfit:${profile?.name ?? 'guest'}:${dayKey}:${wardrobeKey}`
    try {
      const cached = localStorage.getItem(cacheKey)
      if (cached) {
        const cachedIds = JSON.parse(cached) as string[]
        if (Array.isArray(cachedIds) && cachedIds.every((id) => typeof id === 'string')) {
          const cachedItems = cachedIds.map((id) => items.find((item) => item.id === id)).filter((item): item is ClothingItem => Boolean(item))
          if (cachedItems.length) setRecommendation(cachedItems)
          setRecommendationLoading(false)
          if (cachedItems.length) return
        }
      }
    } catch {
      // Continue with a fresh recommendation if local storage is unavailable.
    }

    setRecommendationLoading(true)
    const dailyAttempt = Math.floor(new Date(today.getFullYear(), today.getMonth(), today.getDate()).getTime() / 86400000)
    void generateOutfit({ occasion: 'casual', weather: weather.condition, mood: 'relaxed' }, items, profile, dailyAttempt)
      .then(({ suggestion }) => {
        if (cancelled) return
        const recommendedItems = suggestion?.items.map(({ item }) => item) ?? []
        const ids = recommendedItems.map((item) => item.id)
        setRecommendation(recommendedItems)
        try {
          localStorage.setItem(cacheKey, JSON.stringify(ids))
        } catch {
          // The daily seed still keeps the recommendation stable within this date.
        }
      })
      .finally(() => {
        if (!cancelled) setRecommendationLoading(false)
      })
    return () => { cancelled = true }
  }, [weather, items, profile, today.getDate(), today.getMonth(), today.getFullYear()])

  return (
    <section className="-mt-8 lg:-mt-10 mb-16 lg:mb-20 overflow-hidden bg-dark-purple text-text-primary shadow-lifted" aria-labelledby="daily-outfit-title">
      <div className="grid lg:grid-cols-[1fr_auto]">
        <div className="p-7 sm:p-9 lg:p-12">
          <h2 id="daily-outfit-title" className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight">
            Today’s outfit <em className="italic text-butter-yellow">recommendation</em>
          </h2>
          <p className="mt-4 text-2xs uppercase tracking-ultra-wide text-butter-yellow font-medium">{dateLabel}</p>
          <div className="mt-3 flex items-center gap-2 text-sm text-text-muted" aria-live="polite">
            <CloudSun size={18} className="text-butter-yellow" />
            {weather ? <span>{weather.label} · {Math.round(weather.temperature)}°C</span> : weatherError ? <span>Weather unavailable — allow location access to see local conditions.</span> : <span>Checking today’s weather…</span>}
          </div>
          {weather && (
          <div className="mt-7" aria-live="polite">
              <p className="text-sm text-text-muted">{recommendationLoading ? 'Putting together a look from your Kloset…' : recommendation?.length ? 'A look picked for today, from pieces you own:' : items.length < 2 ? 'Add at least two pieces to your Kloset for a personal outfit recommendation.' : 'Your stylist can put together a fresh look for today.'}</p>
              {recommendation?.length ? (
                <div className="mt-4 grid grid-cols-2 sm:grid-cols-3 gap-3">
                  {recommendation.map((item) => <RecommendedItem key={item.id} item={item} />)}
                </div>
              ) : null}
            </div>
          )}
        </div>
        <button onClick={onOpenStylist} className="group flex min-h-24 items-center justify-between gap-5 bg-butter-yellow px-7 py-6 text-left text-dark-purple transition-colors hover:bg-soft-butter sm:px-9 lg:min-h-full lg:w-64 lg:flex-col lg:items-start lg:justify-end lg:p-9" aria-label="Go to AI Stylist">
          <span className="flex items-center gap-2 text-2xs uppercase tracking-widest font-semibold"><Sparkles size={14} /> AI Stylist</span>
          <span className="inline-flex items-center gap-2 text-sm font-medium">Go to stylist <ArrowRight size={16} className="transition-transform group-hover:translate-x-1" /></span>
        </button>
      </div>
    </section>
  )
}

function RecommendedItem({ item }: { item: ClothingItem }) {
  const imageUrl = useItemImage(item)
  return (
    <div className="min-w-0 overflow-hidden bg-white/5">
      <div className="aspect-[4/5] flex items-center justify-center bg-white/5">
        {imageUrl ? <img src={imageUrl} alt={item.name} className="h-full w-full object-contain" /> : <Shirt size={24} className="text-text-primary/30" />}
      </div>
      <p className="truncate px-2 py-2 text-xs text-text-primary">{item.name}</p>
    </div>
  )
}

function SectionHeader({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) {
  const words = title.split(' ')
  const last = words.pop()
  return (
    <div className="flex items-end justify-between mb-6 border-b border-text-primary/15 pb-4">
      <h2 className="font-display text-3xl lg:text-4xl font-medium text-text-primary">
        {words.join(' ')} <em className="italic text-butter-yellow">{last}</em>
      </h2>
      {action && (
        <button onClick={action.onClick} className="text-tab">
          {action.label}
        </button>
      )}
    </div>
  )
}

function WardrobeThumb({ item, onClick }: { item: ClothingItem; onClick: () => void }) {
  const imageUrl = useItemImage(item)

  return (
    <button onClick={onClick} className="group text-left">
      <div className="relative aspect-[3/4] overflow-hidden bg-cream-200">
        {imageUrl ? (
          <img src={imageUrl} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.03]" />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Shirt size={24} className="text-text-primary/20" />
          </div>
        )}
        {item.isFavourite && (
          <Heart size={14} className="absolute top-3 right-3 fill-butter-yellow text-butter-yellow" />
        )}
      </div>
      <p className="text-sm text-text-primary mt-3 truncate group-hover:underline underline-offset-4">{item.name}</p>
      <p className="text-2xs uppercase tracking-widest text-text-muted mt-0.5">{item.category}</p>
    </button>
  )
}
