import { useNavigate } from 'react-router-dom'
import { ArrowRight, ChevronDown, Sparkles, Layers, Clock } from 'lucide-react'
import { Button } from '@/components/ui/Button'
import { CinematicClosetHero } from '@/components/hero/CinematicClosetHero'
import { useAuth } from '@/contexts/AuthContext'
import { useUserStore } from '@/store/userStore'

export function LandingPage() {
  const navigate = useNavigate()
  const { user } = useAuth()
  const profile = useUserStore((s) => s.profile)

  const handleCTA = () => {
    if (user && profile?.onboardingComplete) {
      navigate('/wardrobe')
    } else if (user) {
      navigate('/onboarding')
    } else {
      navigate('/signup')
    }
  }

  return (
    <div className="min-h-screen bg-warm-cream">

      {/* ── Hero ──────────────────────────────────────────────────────────── */}
      <CinematicClosetHero
        onCTA={handleCTA}
        showStylistLink={Boolean(user && profile?.onboardingComplete)}
        onStylistClick={() => navigate('/stylist')}
      />

      {/* ── Features ──────────────────────────────────────────────────────── */}
      <section id="how-it-works" className="py-28 lg:py-40 bg-warm-cream scroll-mt-20">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <button
            onClick={() => document.getElementById('how-it-works')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
            className="group flex items-center gap-3 mb-16"
          >
            <span className="inline-block w-8 h-px bg-text-primary/20" />
            <span className="text-text-muted text-xs font-medium uppercase tracking-ultra-wide group-hover:text-text-primary transition-colors">How it works</span>
            <ChevronDown size={14} className="text-text-muted group-hover:text-text-primary group-hover:translate-y-0.5 transition-all" />
          </button>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 lg:gap-12">
            <FeatureCard icon={<Layers size={24} />} index="01" title="Digitise your wardrobe" description="Upload photos of your clothes and organise them into a beautiful digital closet. Tag each piece with colours, occasions, and seasons." delay={0} />
            <FeatureCard icon={<Sparkles size={24} />} index="02" title="AI-generated outfits" description="Tell the AI what you need — a work presentation, a weekend brunch, a dinner date — and it builds an outfit from your actual wardrobe." delay={100} />
            <FeatureCard icon={<Clock size={24} />} index="03" title="Effortless every morning" description="Save your favourite outfit combinations and revisit them anytime. Your AI stylist learns your preferences over time." delay={200} />
          </div>
        </div>
      </section>

      {/* ── Editorial split ────────────────────────────────────────────────── */}
      <section className="py-28 bg-soft-butter/40">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
            <div>
              <div className="flex items-center gap-3 mb-8">
                <span className="inline-block w-8 h-px bg-text-primary/30" />
                <span className="text-text-muted text-xs font-medium uppercase tracking-ultra-wide">For the modern professional</span>
              </div>
              <h2 className="font-display text-4xl lg:text-5xl font-medium text-text-primary leading-[1.15] mb-6">
                Dress with intention,
                <br />
                <em className="italic">every single day.</em>
              </h2>
              <p className="text-text-muted text-lg leading-relaxed mb-8">
                The average professional spends 17 minutes every morning deciding what to wear.
                Kloset.ai gives you those minutes back — with recommendations that fit your schedule, your mood, and the weather.
              </p>
              <div className="flex flex-col gap-4">
                {['Outfits built from clothes you already own', 'Style recommendations for every occasion', 'Track what you wear and love', 'Your wardrobe, always at your fingertips'].map((point) => (
                  <div key={point} className="flex items-start gap-3">
                    <div className="mt-1 w-5 h-5 rounded-full bg-butter-yellow flex items-center justify-center flex-shrink-0">
                      <div className="w-1.5 h-1.5 rounded-full bg-dark-purple" />
                    </div>
                    <span className="text-text-primary text-sm">{point}</span>
                  </div>
                ))}
              </div>
              <div className="mt-10">
                <Button size="lg" onClick={handleCTA}>Build My Kloset <ArrowRight size={16} /></Button>
              </div>
            </div>
            <div className="relative"><MockWardrobeVisual /></div>
          </div>
        </div>
      </section>

      {/* ── Final CTA ─────────────────────────────────────────────────────── */}
      <section className="py-28 lg:py-40 bg-dark-purple">
        <div className="mx-auto max-w-3xl px-6 lg:px-8 text-center">
          <div className="flex justify-center mb-8">
            <span className="inline-block w-8 h-px bg-butter-yellow/40" />
          </div>
          <h2 className="font-display text-4xl lg:text-5xl font-medium text-text-primary leading-[1.15] mb-6">
            Ready to discover your
            <br />
            <em className="italic text-butter-yellow">personal style?</em>
          </h2>
          <p className="text-text-primary/60 text-lg leading-relaxed mb-12">
            Start building your digital wardrobe today. It only takes a few minutes.
          </p>
          <Button size="xl" onClick={handleCTA} className="!bg-butter-yellow !text-dark-purple hover:!bg-soft-butter shadow-lifted">
            Build My Kloset <ArrowRight size={18} />
          </Button>
        </div>
      </section>

      {/* ── Footer ────────────────────────────────────────────────────────── */}
      <footer className="bg-dark-purple border-t border-text-primary/10 py-10">
        <div className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex flex-col md:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg text-text-primary/60"><span className="font-brand font-bold">Kloset</span><span className="text-butter-yellow">.</span>ai</span>
            </div>
            <p className="text-text-primary/40 text-xs">&copy; {new Date().getFullYear()} Kloset.ai. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  )
}

function FeatureCard({ icon, index, title, description, delay }: { icon: React.ReactNode; index: string; title: string; description: string; delay: number }) {
  return (
    <div className="group" style={{ animationDelay: `${delay}ms` }}>
      <div className="flex items-start gap-4 mb-5">
        <div className="w-12 h-12 rounded-2xl bg-text-primary/8 flex items-center justify-center text-text-primary flex-shrink-0 group-hover:bg-dark-purple group-hover:text-butter-yellow transition-colors duration-300">
          {icon}
        </div>
        <span className="text-text-muted/30 font-serif text-2xl font-medium pt-2">{index}</span>
      </div>
      <h3 className="font-display text-xl font-medium text-text-primary mb-3">{title}</h3>
      <p className="text-text-muted text-sm leading-relaxed">{description}</p>
    </div>
  )
}

function MockWardrobeVisual() {
  const items = [
    { bg: '#E8E4DF', label: 'White Shirt', category: 'Tops' },
    { bg: '#2C3E6B', label: 'Navy Blazer', category: 'Outerwear' },
    { bg: '#1A1A1A', label: 'Black Trousers', category: 'Bottoms' },
    { bg: '#FAF3C7', label: 'Cream Blouse', category: 'Tops' },
    { bg: '#C4A882', label: 'Camel Coat', category: 'Outerwear' },
    { bg: '#C8C8C8', label: 'Grey Skirt', category: 'Bottoms' },
  ]

  return (
    <div className="relative">
      <div className="bg-white rounded-3xl p-6 shadow-lifted">
        <div className="flex items-center justify-between mb-5">
          <span className="font-serif text-sm text-text-primary">My Wardrobe</span>
          <span className="text-2xs text-text-muted uppercase tracking-widest">24 items</span>
        </div>
        <div className="grid grid-cols-3 gap-3">
          {items.map((item) => (
            <div key={item.label} className="group cursor-pointer">
              <div className="aspect-square rounded-2xl mb-2 flex items-end p-2 overflow-hidden transition-transform duration-200 group-hover:scale-[0.97]" style={{ backgroundColor: item.bg }}>
                <span className="text-2xs text-white/70 bg-black/20 px-2 py-0.5 rounded-full backdrop-blur-sm">{item.category}</span>
              </div>
              <p className="text-2xs text-text-muted truncate">{item.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 p-3 rounded-2xl bg-butter-yellow flex items-center gap-3">
          <div className="w-7 h-7 rounded-xl bg-dark-purple/20 flex items-center justify-center flex-shrink-0">
            <Sparkles size={12} className="text-dark-purple" />
          </div>
          <div>
            <p className="text-dark-purple text-xs font-medium">Today's suggestion</p>
            <p className="text-dark-purple/60 text-2xs">Navy blazer + cream blouse + grey skirt</p>
          </div>
        </div>
      </div>
      <div className="absolute -bottom-6 -right-6 bg-white rounded-2xl px-4 py-3 shadow-medium flex items-center gap-3 max-w-xs">
        <div className="w-8 h-8 rounded-xl bg-butter-yellow flex items-center justify-center flex-shrink-0">
          <Sparkles size={14} className="text-dark-purple" />
        </div>
        <div>
          <p className="text-text-primary text-xs font-medium">Outfit ready for Monday</p>
          <p className="text-text-muted text-2xs">Business casual · 3 pieces</p>
        </div>
      </div>
    </div>
  )
}
