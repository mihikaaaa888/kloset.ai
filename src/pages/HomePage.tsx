import { useNavigate } from 'react-router-dom'
import { Sparkles, Shirt, MessageCircle, Heart, Plus, ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import { useUserStore } from '@/store/userStore'
import { useWardrobeStore } from '@/store/wardrobeStore'
import { useItemImage } from '@/hooks/useItemImage'
import type { ClothingItem } from '@/types'

function getGreeting(name: string): { time: string; line: string } {
  const hour = new Date().getHours()
  const first = name.split(' ')[0]
  if (hour < 12) return { time: 'Good morning', line: `What are we wearing today, ${first}?` }
  if (hour < 17) return { time: 'Good afternoon', line: `Ready to put together a look, ${first}?` }
  return { time: 'Good evening', line: `Let's plan tonight's outfit, ${first}.` }
}

export function HomePage() {
  const navigate = useNavigate()
  const profile = useUserStore((s) => s.profile)
  const items = useWardrobeStore((s) => s.items)

  const firstName = profile?.name?.split(' ')[0] ?? 'there'
  const greeting = getGreeting(profile?.name ?? '')

  const recent = [...items]
    .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
    .slice(0, 4)

  const favourites = items.filter((i) => i.isFavourite).slice(0, 4)

  return (
    <div className="min-h-screen bg-warm-cream pt-16 lg:pt-20 pb-28 md:pb-12">
      <div className="mx-auto max-w-5xl px-4 sm:px-6 lg:px-8 py-10 lg:py-14">

        {/* ── Greeting ── */}
        <div className="mb-10">
          <p className="text-text-muted text-sm font-medium mb-1">{greeting.time}</p>
          <h1 className="font-display text-3xl sm:text-4xl lg:text-5xl font-medium text-text-primary leading-tight">
            {greeting.line}
          </h1>
          {items.length > 0 && (
            <p className="text-text-muted text-sm mt-3">
              You have <span className="text-text-primary font-medium">{items.length} pieces</span> in your Kloset
              {favourites.length > 0 && ` · ${favourites.length} favourited`}
            </p>
          )}
        </div>

        {/* ── Quick actions ── */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-10">
          <QuickAction
            title="Style My Wardrobe"
            subtitle="Generate an outfit from your Kloset"
            icon={<Sparkles size={20} />}
            colour="purple"
            onClick={() => navigate('/stylist', { state: { mode: 'wardrobe' } })}
            disabled={items.length < 2}
            disabledHint="Add 2+ items first"
          />
          <QuickAction
            title="Style an Item"
            subtitle="Build a look around a specific piece"
            icon={<Shirt size={20} />}
            colour="cream"
            onClick={() => navigate('/stylist', { state: { mode: 'item' } })}
            disabled={items.length === 0}
            disabledHint="Add items first"
          />
          <QuickAction
            title="Chat with Kaia"
            subtitle="Ask your personal stylist anything"
            icon={<MessageCircle size={20} />}
            colour="butter"
            onClick={() => navigate('/stylist', { state: { mode: 'chat' } })}
          />
        </div>

        {/* ── Wardrobe empty state ── */}
        {items.length === 0 && (
          <div className="rounded-3xl border-2 border-dashed border-text-primary/15 flex flex-col items-center justify-center text-center py-14 px-6 mb-10">
            <div className="w-14 h-14 rounded-2xl bg-text-primary/8 flex items-center justify-center mb-4">
              <Shirt size={24} className="text-text-primary/40" />
            </div>
            <h3 className="font-display text-xl font-medium text-text-primary mb-2">
              Start building your Kloset
            </h3>
            <p className="text-text-muted text-sm max-w-xs mb-6">
              Add your clothes to get personalised outfit recommendations.
            </p>
            <button
              onClick={() => navigate('/wardrobe')}
              className="flex items-center gap-2 px-5 py-2.5 rounded-full bg-dark-purple text-butter-yellow text-sm font-medium hover:bg-deep-purple transition-colors"
            >
              <Plus size={15} />
              Add your first item
            </button>
          </div>
        )}

        {/* ── Recent additions ── */}
        {recent.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              title="Recently added"
              action={{ label: 'View all', onClick: () => navigate('/wardrobe') }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recent.map((item) => <WardrobeThumb key={item.id} item={item} onClick={() => navigate('/wardrobe')} />)}
            </div>
          </section>
        )}

        {/* ── Favourites ── */}
        {favourites.length > 0 && (
          <section className="mb-10">
            <SectionHeader
              title="Your favourites"
              action={{ label: 'View all', onClick: () => navigate('/wardrobe') }}
            />
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {favourites.map((item) => <WardrobeThumb key={item.id} item={item} onClick={() => navigate('/wardrobe')} />)}
            </div>
          </section>
        )}

        {/* ── Discover prompt ── */}
        <div
          onClick={() => navigate('/discover')}
          className="rounded-3xl bg-dark-purple p-6 cursor-pointer hover:bg-deep-purple transition-colors group"
        >
          <div className="flex items-center justify-between">
            <div>
              <p className="text-butter-yellow/70 text-xs font-medium uppercase tracking-widest mb-1">Discover</p>
              <h3 className="text-text-primary font-display text-xl font-medium">
                Explore wardrobe essentials
              </h3>
              <p className="text-text-primary/60 text-sm mt-1">
                Browse {firstName === 'there' ? 'curated' : 'our curated'} catalogue and add pieces to your Kloset
              </p>
            </div>
            <ArrowRight size={20} className="text-text-primary/40 group-hover:text-text-primary/80 group-hover:translate-x-1 transition-all flex-shrink-0" />
          </div>
        </div>

      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function QuickAction({
  title,
  subtitle,
  icon,
  colour,
  onClick,
  disabled,
  disabledHint,
}: {
  title: string
  subtitle: string
  icon: React.ReactNode
  colour: 'purple' | 'cream' | 'butter'
  onClick: () => void
  disabled?: boolean
  disabledHint?: string
}) {
  const variants = {
    purple: { card: 'bg-dark-purple text-text-primary hover:bg-deep-purple', chip: 'bg-text-primary/10', subtitle: 'text-text-primary/60' },
    cream: { card: 'bg-white text-text-primary hover:bg-warm-cream border border-text-primary/10', chip: 'bg-text-primary/5', subtitle: 'text-text-muted' },
    butter: { card: 'bg-butter-yellow text-dark-purple hover:bg-soft-butter', chip: 'bg-dark-purple/20', subtitle: 'text-dark-purple/70' },
  }
  const variant = variants[colour]

  return (
    <button
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className={clsx(
        'relative text-left p-5 rounded-3xl transition-all duration-200 group',
        disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer shadow-card hover:shadow-medium hover:-translate-y-0.5',
        variant.card
      )}
    >
      <div className={clsx('w-10 h-10 rounded-2xl flex items-center justify-center mb-3', variant.chip)}>
        {icon}
      </div>
      <p className="font-semibold text-sm mb-0.5">{title}</p>
      <p className={clsx('text-xs', variant.subtitle)}>
        {disabled && disabledHint ? disabledHint : subtitle}
      </p>
    </button>
  )
}

function SectionHeader({ title, action }: { title: string; action?: { label: string; onClick: () => void } }) {
  return (
    <div className="flex items-center justify-between mb-4">
      <h2 className="text-base font-semibold text-text-primary">{title}</h2>
      {action && (
        <button
          onClick={action.onClick}
          className="text-xs text-text-muted hover:text-text-primary transition-colors underline underline-offset-4"
        >
          {action.label}
        </button>
      )}
    </div>
  )
}

function WardrobeThumb({ item, onClick }: { item: ClothingItem; onClick: () => void }) {
  const imageUrl = useItemImage(item)

  return (
    <button
      onClick={onClick}
      className="relative rounded-2xl overflow-hidden aspect-[3/4] bg-text-primary/5 group hover:shadow-medium transition-all duration-200"
    >
      {imageUrl ? (
        <img src={imageUrl} alt={item.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
      ) : (
        <div className="w-full h-full flex items-center justify-center">
          <Shirt size={24} className="text-text-primary/20" />
        </div>
      )}
      <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-black/60 to-transparent px-2.5 py-2">
        <p className="text-white text-2xs font-medium truncate">{item.name}</p>
      </div>
      {item.isFavourite && (
        <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-white/90 flex items-center justify-center">
          <Heart size={10} className="fill-rose-500 text-rose-500" />
        </div>
      )}
    </button>
  )
}
