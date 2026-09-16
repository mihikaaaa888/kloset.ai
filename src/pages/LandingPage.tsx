import { useNavigate } from 'react-router-dom'
import { ArrowRight, Sparkles, Layers, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { useUserStore } from '@/store/userStore'

export function LandingPage() {
  const navigate = useNavigate()
  const profile = useUserStore((s) => s.profile)

  const handleCTA = () => {
    if (profile?.onboardingComplete) {
      navigate('/wardrobe')
    } else {
      navigate('/onboarding')
    }
  }

  return (
    <div className="min-h-screen bg-cream-50 overflow-x-hidden">
      {/* ── Hero ─────────────────────────────────────────────────────── */}
      <section className="relative min-h-screen flex items-center">
        {/* Background */}
        <div className="absolute inset-0 bg-charcoal-900" />
        <div
          className="absolute inset-0 opacity-20"
          style={{
            backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
          }}
        />
        {/* Gradient overlays for depth */}
        <div className="absolute inset-0 bg-gradient-to-br from-charcoal-900 via-charcoal-800 to-charcoal-900 opacity-90" />
        <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-cream-50 to-transparent" />

        {/* Decorative gold circle */}
        <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-gold/5 blur-3xl pointer-events-none" />
        <div className="absolute bottom-1/3 left-1/3 w-64 h-64 rounded-full bg-stone-warm/10 blur-2xl pointer-events-none" />

        <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-32">
          <div className="max-w-4xl">
            {/* Eyebrow */}
            <div className="flex items-center gap-3 mb-8 animate-fade-up" style={{ animationDelay: '0ms' }}>
              <span className="inline-block w-8 h-px bg-gold" />
              <span className="text-gold text-xs font-medium uppercase tracking-ultra-wide">
                AI-Powered Personal Styling
              </span>
            </div>

            {/* Headline */}
            <h1
              className="font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium text-white leading-[1.05] tracking-tight mb-8 animate-fade-up"
              style={{ animationDelay: '100ms', opacity: 0 }}
            >
              Your wardrobe,
              <br />
              <em className="font-serif italic text-gold">curated</em>
              <br />
              for you.
            </h1>

            {/* Description */}
            <p
              className="text-white/60 text-lg lg:text-xl font-light leading-relaxed max-w-xl mb-12 animate-fade-up"
              style={{ animationDelay: '200ms', opacity: 0 }}
            >
              Kloset.ai organises your wardrobe and generates outfit recommendations
              tailored to your lifestyle, occasions, and personal style — so you spend less
              time deciding and more time living.
            </p>

            {/* CTAs */}
            <div
              className="flex flex-col sm:flex-row items-start sm:items-center gap-4 animate-fade-up"
              style={{ animationDelay: '300ms', opacity: 0 }}
            >
              <Button
                size="xl"
                onClick={handleCTA}
                className="group !bg-white !text-charcoal-900 hover:!bg-cream-100 !rounded-full shadow-lifted"
              >
                Build My Kloset
                <ArrowRight
                  size={18}
                  className="transition-transform duration-200 group-hover:translate-x-1"
                />
              </Button>
              {profile?.onboardingComplete && (
                <button
                  onClick={() => navigate('/stylist')}
                  className="text-white/60 hover:text-white text-sm font-medium underline underline-offset-4 transition-colors"
                >
                  Go to AI Stylist
                </button>
              )}
            </div>

            {/* Social proof / tag line */}
            <p
              className="mt-10 text-white/30 text-xs uppercase tracking-widest animate-fade-up"
              style={{ animationDelay: '400ms', opacity: 0 }}
            >
              For working professionals who want effortless style
            </p>
          </div>
        </div>

        {/* Scroll indicator */}
        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-white/30">
          <span className="text-2xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-white/30 to-transparent" />
        </div>
      </section>

      {/* ── Features ─────────────────────────────────────────────────── */}
      <section className="py-28 lg:py-40 bg-cream-50">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          {/* Section label */}
          <div className="flex items-center gap-3 mb-16">
            <span className="inline-block w-8 h-px bg-charcoal-400" />
            <span className="text-charcoal-400 text-xs font-medium uppercase tracking-ultra-wide">
              How it works
            </span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <FeatureCard
              icon={<Layers size={24} />}
              index="01"
              title="Digitise your wardrobe"
              description="Upload photos of your clothes and organise them into a beautiful digital closet. Tag each piece with colours, occasions, and seasons."
              delay={0}
            />
            <FeatureCard
              icon={<Sparkles size={24} />}
              index="02"
              title="AI-generated outfits"
              description="Tell the AI what you need — a work presentation, a weekend brunch, a dinner date — and it builds an outfit from your actual wardrobe."
              delay={100}
            />
            <FeatureCard
              icon={<Clock size={24} />}
              index="03"
              title="Effortless every morning"
              description="Save your favourite outfit combinations and revisit them anytime. Your AI stylist learns your preferences over time."
              delay={200}
            />
          </div>
        </div>
      </section>

      {/* ── Editorial split section ───────────────────────────────────── */}
      <section className="py-28 bg-cream-100">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            {/* Text */}
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="inline-block w-8 h-px bg-gold" />
                <span className="text-stone-warm text-xs font-medium uppercase tracking-ultra-wide">
                  For the modern professional
                </span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-medium text-charcoal-900 leading-[1.15] mb-6">
                Dress with intention,
                <br />
                <em className="italic">every single day.</em>
              </h2>
              <p className="text-charcoal-500 text-lg leading-relaxed mb-8">
                The average professional spends 17 minutes every morning deciding what to wear.
                Kloset.ai gives you those minutes back — with recommendations that fit your schedule,
                your mood, and the weather.
              </p>
              <div className="flex flex-col gap-4">
                {[
                  'Outfits built from clothes you already own',
                  'Style recommendations for every occasion',
                  'Track what you wear and love',
                  'Your wardrobe, always at your fingertips',
                ].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-gold-muted flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-gold" />
                    </div>
                    <span className="text-charcoal-700 text-sm">{point}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Button size="lg" onClick={handleCTA}>
                  Build My Kloset
                  <ArrowRight size={16} />
                </Button>
              </div>
            </div>

            {/* Visual */}
            <div className="relative">
              <MockWardrobeVisual />
            </div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────── */}
      <section className="py-28 lg:py-40 bg-charcoal-900">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <span className="inline-block w-8 h-px bg-gold" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-medium text-white leading-[1.15] mb-6">
            Ready to discover your
            <br />
            <em className="italic text-gold">personal style?</em>
          </h2>
          <p className="text-white/50 text-lg leading-relaxed mb-12">
            Start building your digital wardrobe today. It only takes a few minutes.
          </p>
          <Button
            size="xl"
            onClick={handleCTA}
            className="!bg-white !text-charcoal-900 hover:!bg-cream-100 shadow-lifted"
          >
            Build My Kloset
            <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────── */}
      <footer className="bg-charcoal-900 border-t border-charcoal-700 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <svg width="22" height="22" viewBox="0 0 28 28" fill="none">
                <rect width="28" height="28" rx="8" fill="white" />
                <path d="M8 10h12M8 14h8M8 18h10" stroke="#111110" strokeWidth="1.8" strokeLinecap="round" />
              </svg>
              <span className="font-serif text-lg text-white/70">
                Kloset<span className="text-gold">.</span>ai
              </span>
            </div>
            <p className="text-charcoal-500 text-xs">
              &copy; {new Date().getFullYear()} Kloset.ai. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

// ─── Sub-components ──────────────────────────────────────────────────────────

function FeatureCard({
  icon,
  index,
  title,
  description,
  delay,
}: {
  icon: React.ReactNode
  index: string
  title: string
  description: string
  delay: number
}) {
  return (
    <div
      className="group"
      style={{ animationDelay: `${delay}ms` }}
    >
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-cream-200 flex items-center justify-center text-charcoal-700 flex-shrink-0 group-hover:bg-charcoal-900 group-hover:text-cream-50 transition-colors duration-300">
          {icon}
        </div>
        <span className="text-charcoal-400/40 font-serif text-2xl font-medium pt-2">{index}</span>
      </div>
      <h3 className="font-display text-xl font-medium text-charcoal-900 mb-3">{title}</h3>
      <p className="text-charcoal-500 text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function MockWardrobeVisual() {
  const items = [
    { bg: 'bg-stone-200', label: 'White Shirt', category: 'Tops' },
    { bg: 'bg-slate-700', label: 'Navy Blazer', category: 'Outerwear' },
    { bg: 'bg-neutral-800', label: 'Black Trousers', category: 'Bottoms' },
    { bg: 'bg-amber-100', label: 'Cream Blouse', category: 'Tops' },
    { bg: 'bg-stone-400', label: 'Camel Coat', category: 'Outerwear' },
    { bg: 'bg-zinc-300', label: 'Grey Skirt', category: 'Bottoms' },
  ]

  return (
    <div className="relative">
      {/* Card container */}
      <div className="bg-white rounded-3xl p-6 shadow-lifted">
        <div className="flex items-center justify-between mb-5">
          <span className="font-serif text-sm text-charcoal-700">My Wardrobe</span>
          <span className="text-2xs text-charcoal-400 uppercase tracking-widest">24 items</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.label} className="group cursor-pointer">
              <div
                className={`${item.bg} aspect-square rounded-2xl mb-2 flex items-end p-2 overflow-hidden transition-transform duration-200 group-hover:scale-[0.97]`}
              >
                <span className="text-2xs text-white/60 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">
                  {item.category}
                </span>
              </div>
              <p className="text-2xs text-charcoal-500 truncate">{item.label}</p>
            </div>
          ))}
        </div>
        {/* AI suggestion strip */}
        <div className="mt-5 p-3 rounded-2xl bg-charcoal-900 flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-gold/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={12} className="text-gold" />
          </div>
          <div>
            <p className="text-cream-50 text-xs font-medium">Today's suggestion</p>
            <p className="text-cream-300/60 text-2xs">Navy blazer + cream blouse + grey skirt</p>
          </div>
        </div>
      </div>

      {/* Floating outfit card */}
      <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl px-4 py-3 shadow-medium flex items-center gap-3 max-w-xs">
        <div className="w-8 h-8 rounded-xl bg-gold-muted flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-gold" />
        </div>
        <div>
          <p className="text-charcoal-900 text-xs font-medium">Outfit ready for Monday</p>
          <p className="text-charcoal-400 text-2xs">Business casual · 3 pieces</p>
        </div>
      </div>
    </div>
  )
}
