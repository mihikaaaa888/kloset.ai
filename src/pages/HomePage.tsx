import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Shirt, Heart, Plus, CloudSun } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { useWardrobeStore } from '@/store/wardrobeStore'
import { useItemImage } from '@/hooks/useItemImage'
import type { ClothingItem } from '@/types'
import { generateOutfit, type WeatherCondition } from '@/lib/stylist'

function getGreeting(name: string): { time: string; lead: string; name: string; end: string } {
  const hour = new Date().getHours()
  const first = name.split(' ')[0]
  const sep = first ? ', ' : ''
  if (hour < 12) return { time: 'Good morning', lead: `What are we wearing today${sep}`, name: first, end: '?' }
  if (hour < 17) return { time: 'Good afternoon', lead: `Ready to put together a look${sep}`, name: first, end: '?' }
  return { time: 'Good evening', lead: `Let's plan tonight's outfit${sep}`, name: first, end: '.' }
}

export function HomePage() {
  const navigate = useNavigate()
  const profile = useUserStore((s) => s.profile)
  const items = useWardrobeStore((s) => s.items)

  const greeting = getGreeting(profile?.name ?? '')

  const favourites = items.filter((i) => i.isFavourite).slice(0, 4)

  return (
    <div className="min-h-screen bg-warm-cream pt-40 lg:pt-44 pb-24 md:pb-0">
      {/* ── Greeting — full-bleed yellow band ── */}
      <header className="bg-deep-purple">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-24">
          <p className="text-2xs uppercase tracking-ultra-wide text-butter-yellow font-medium mb-4">{greeting.time}</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-medium text-text-primary leading-[1.02] max-w-4xl">
            {greeting.lead}
            {greeting.name && <em className="italic text-butter-yellow">{greeting.name}</em>}
            {greeting.end}
          </h1>
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">

        <DailyOutfitCard
          items={items}
          profile={profile}
        />
        <div className="mb-16 lg:mb-20">
          <button onClick={() => navigate('/stylist', { state: { mode: 'wardrobe' } })} className="text-tab text-tab-active">
            Ask stylist
          </button>
        </div>

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

function DailyOutfitCard({ items, profile }: {
  items: ClothingItem[]
  profile: Parameters<typeof generateOutfit>[2]
}) {
  const [weather, setWeather] = useState<CurrentWeather | null>(null)
  const [weatherError, setWeatherError] = useState(false)
  const [recommendation, setRecommendation] = useState<string[] | null>(null)
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
        const cachedNames = JSON.parse(cached) as string[]
        if (Array.isArray(cachedNames) && cachedNames.every((name) => typeof name === 'string')) {
          setRecommendation(cachedNames)
          setRecommendationLoading(false)
          return
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
        const names = suggestion?.items.map(({ item }) => item.name) ?? []
        setRecommendation(names)
        try {
          localStorage.setItem(cacheKey, JSON.stringify(names))
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
    <section className="mb-16 lg:mb-20" aria-labelledby="daily-outfit-title">
      <div className="grid lg:grid-cols-[1fr_auto] lg:items-stretch">
        <div className="py-8 sm:py-10 lg:py-12 lg:pr-12">
          <p className="text-2xs uppercase tracking-ultra-wide text-text-muted font-medium">{dateLabel}</p>
          <h2 id="daily-outfit-title" className="mt-5 font-display text-3xl sm:text-4xl lg:text-5xl font-medium leading-tight text-text-primary">
            Today’s outfit <em className="italic text-butter-yellow">recommendation</em>
          </h2>
          <div className="mt-5 flex items-center gap-2 text-sm text-text-muted" aria-live="polite">
            <CloudSun size={18} className="text-deep-purple" />
            {weather ? <span>{weather.label} · {Math.round(weather.temperature)}°C</span> : weatherError ? <span>Weather unavailable — allow location access to see local conditions.</span> : <span>Checking today’s weather…</span>}
          </div>
          {weather && (
            <div className="mt-7" aria-live="polite">
              {!recommendation?.length && <p className="text-sm text-text-muted">{recommendationLoading ? 'Putting together a look from your Kloset…' : items.length < 2 ? 'Add at least two pieces to your Kloset for a personal outfit recommendation.' : 'Your stylist can put together a fresh look for today.'}</p>}
              {recommendation?.length ? (
                <div className="mt-4 flex flex-wrap gap-4">
                  {items.filter((item) => recommendation.includes(item.name)).map((item) => (
                    <RecommendationPiece key={item.id} item={item} />
                  ))}
                </div>
              ) : null}
            </div>
          )}
        </div>
      </div>
    </section>
  )
}

function RecommendationPiece({ item }: { item: ClothingItem }) {
  const imageUrl = useItemImage(item)

  return (
    <div className="flex items-center gap-3">
      <div className="h-20 w-16 overflow-hidden bg-cream-200">
        {imageUrl ? <img src={imageUrl} alt={item.name} className="h-full w-full object-cover" /> : <div className="flex h-full w-full items-center justify-center"><Shirt size={20} className="text-text-primary/25" /></div>}
      </div>
      <span className="max-w-32 text-sm font-medium text-text-primary">{item.name}</span>
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
