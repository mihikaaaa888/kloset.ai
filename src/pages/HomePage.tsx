import { useNavigate } from 'react-router-dom'
import { Shirt, Heart, Plus, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import { useUserStore } from '@/store/userStore'
import { useWardrobeStore } from '@/store/wardrobeStore'
import { useItemImage } from '@/hooks/useItemImage'
import type { ClothingItem } from '@/types'

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

  const recent = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  const favourites = items.filter((i) => i.isFavourite).slice(0, 4)

  return (
    <div className="min-h-screen bg-warm-cream pt-16 lg:pt-20 pb-24 md:pb-0">
      {/* ── Greeting — full-bleed yellow band ── */}
      <header className="bg-deep-purple">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pt-14 pb-16 lg:pt-20 lg:pb-24">
          <p className="text-2xs uppercase tracking-ultra-wide text-butter-yellow font-medium mb-4">{greeting.time}</p>
          <h1 className="font-display text-4xl sm:text-5xl lg:text-7xl font-medium text-text-primary leading-[1.02] max-w-4xl">
            {greeting.lead}
            {greeting.name && <em className="italic text-butter-yellow">{greeting.name}</em>}
            {greeting.end}
          </h1>
          {items.length > 0 && (
            <p className="text-2xs uppercase tracking-widest text-text-muted mt-6">
              {items.length} pieces in your Kloset
              {favourites.length > 0 && ` · ${favourites.length} favourited`}
            </p>
          )}
        </div>
      </header>

      <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 pb-12 lg:pb-16">

        {/* ── Quick actions — editorial numbered row, no cards ── */}
        <nav className="grid grid-cols-1 sm:grid-cols-3 -mt-8 lg:-mt-10 mb-20 shadow-lifted" aria-label="Get styled">
          <QuickAction
            index="01"
            tone="cream"
            title="Style my wardrobe"
            subtitle="An outfit from what you already own."
            onClick={() => navigate('/stylist', { state: { mode: 'wardrobe' } })}
            disabled={items.length < 2}
            disabledHint="Add 2+ pieces first"
          />
          <QuickAction
            index="02"
            tone="sage"
            title="Style an item"
            subtitle="A full look around one piece."
            onClick={() => navigate('/stylist', { state: { mode: 'item' } })}
            disabled={items.length === 0}
            disabledHint="Add a piece first"
          />
          <QuickAction
            index="03"
            tone="forest"
            title="Chat with Kaia"
            subtitle="Ask your stylist anything."
            onClick={() => navigate('/stylist', { state: { mode: 'chat' } })}
          />
        </nav>

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

        {/* ── Recent additions ── */}
        {recent.length > 0 && (
          <section className="mb-20">
            <SectionHeader title="Recently added" action={{ label: 'View all', onClick: () => navigate('/wardrobe') }} />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-x-4 gap-y-8">
              {recent.map((item) => <WardrobeThumb key={item.id} item={item} onClick={() => navigate('/wardrobe')} />)}
            </div>
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

      {/* ── Personal shopping — full-bleed forest-green band ── */}
      <button onClick={() => navigate('/discover')} className="group block w-full text-left bg-butter-yellow hover:bg-soft-butter transition-colors duration-300">
        <div className="mx-auto max-w-6xl px-4 sm:px-6 lg:px-8 py-14 lg:py-20 flex flex-col sm:flex-row sm:items-end justify-between gap-6">
          <div>
            <p className="text-2xs uppercase tracking-ultra-wide text-deep-purple/80 font-medium mb-3">Personal shopping</p>
            <h3 className="font-display text-5xl lg:text-6xl font-medium text-dark-purple leading-none">
              Shop <em className="italic">for you</em>
            </h3>
            <p className="text-dark-purple/75 text-sm mt-4 max-w-md">
              New outfits and pieces, finds for what you own, or rentals — picked for your style and budget.
            </p>
          </div>
          <span className="flex items-center gap-2 text-2xs uppercase tracking-widest font-semibold text-dark-purple flex-shrink-0">
            Shop now
            <ArrowRight size={14} className="transition-transform duration-300 group-hover:translate-x-1" />
          </span>
        </div>
      </button>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

const ACTION_TONES = {
  cream: { panel: 'bg-dark-purple hover:bg-deep-purple', index: 'text-butter-yellow', title: 'text-text-primary', sub: 'text-text-muted', cta: 'text-butter-yellow' },
  sage: { panel: 'bg-soft-butter hover:bg-butter-yellow', index: 'text-dark-purple/70', title: 'text-dark-purple', sub: 'text-dark-purple/75', cta: 'text-dark-purple' },
  forest: { panel: 'bg-butter-yellow hover:bg-soft-butter', index: 'text-deep-purple/70', title: 'text-dark-purple', sub: 'text-dark-purple/70', cta: 'text-deep-purple' },
} as const

/** Square colour-block panel — a numbered editorial tile, no rounded card. */
function QuickAction({
  index,
  tone,
  title,
  subtitle,
  onClick,
  disabled,
  disabledHint,
}: {
  index: string
  tone: keyof typeof ACTION_TONES
  title: string
  subtitle: string
  onClick: () => void
  disabled?: boolean
  disabledHint?: string
}) {
  const t = ACTION_TONES[tone]
  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={clsx(
        'group text-left p-8 lg:p-10 min-h-[15rem] flex flex-col transition-colors duration-300',
        t.panel,
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'
      )}
    >
      <span className={clsx('font-display italic text-3xl', t.index)}>{index}</span>
      <span className={clsx('block font-display text-3xl lg:text-4xl font-medium leading-tight mt-auto', t.title)}>{title}</span>
      <span className={clsx('block text-sm mt-2', t.sub)}>{disabled && disabledHint ? disabledHint : subtitle}</span>
      <span className={clsx('mt-6 inline-flex items-center gap-2 text-2xs uppercase tracking-widest font-semibold', t.cta)}>
        Start
        <ArrowRight size={13} className="transition-transform duration-300 group-hover:translate-x-1" />
      </span>
    </button>
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
