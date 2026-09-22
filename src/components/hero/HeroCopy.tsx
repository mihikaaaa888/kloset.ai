import { ArrowRight } from 'lucide-react'
import { clsx } from 'clsx'
import { Button } from '@/components/ui/Button'

interface HeroCopyProps {
  onCTA: () => void
  showStylistLink?: boolean
  onStylistClick?: () => void
  /** Skips the entrance animation delays — used when this copy is revealed mid-scroll rather than on page load. */
  animate?: boolean
  /** 'center' is used by the cinematic hero, where the copy grows outward from the closet's centre. */
  align?: 'left' | 'center'
}

/**
 * The hero headline/CTA block. Shared between the static fallback hero
 * (reduced motion, mobile, WebGL unavailable) and the layer revealed behind
 * the chroma-keyed closet video on the cinematic desktop hero, so the two
 * experiences show the same actual homepage content rather than a duplicate.
 */
export function HeroCopy({ onCTA, showStylistLink = false, onStylistClick, animate = true, align = 'left' }: HeroCopyProps) {
  const delay = (ms: number) => (animate ? { animationDelay: `${ms}ms`, opacity: 0 } : undefined)
  const animClass = animate ? 'animate-fade-up' : ''
  const centered = align === 'center'

  return (
    <div className={clsx('max-w-4xl', centered && 'text-center mx-auto')}>
      <div
        className={clsx('flex items-center gap-3 mb-8', centered && 'justify-center', animClass)}
        style={animate ? { animationDelay: '0ms' } : undefined}
      >
        <span className="inline-block w-8 h-px bg-butter-yellow" />
        <span className="text-butter-yellow text-xs font-medium uppercase tracking-ultra-wide">
          AI-Powered Personal Styling
        </span>
      </div>

      <h1
        className={`font-display text-5xl sm:text-6xl lg:text-7xl xl:text-8xl font-medium text-text-primary leading-[1.05] tracking-tight mb-8 ${animClass}`}
        style={delay(100)}
      >
        Your wardrobe,
        <br />
        <em className="font-serif italic text-butter-yellow">curated</em>
        <br />
        for you.
      </h1>

      <p
        className={clsx(
          'text-text-primary/70 text-lg lg:text-xl font-light leading-relaxed mb-12',
          centered ? 'max-w-xl mx-auto' : 'max-w-xl',
          animClass
        )}
        style={delay(200)}
      >
        Kloset.ai organises your wardrobe and generates outfit recommendations
        tailored to your lifestyle, occasions, and personal style.
      </p>

      <div
        className={clsx(
          'flex flex-col sm:flex-row gap-4',
          centered ? 'items-center justify-center' : 'items-start sm:items-center',
          animClass
        )}
        style={delay(300)}
      >
        <Button
          size="xl"
          onClick={onCTA}
          className="group !bg-butter-yellow !text-dark-purple hover:!bg-soft-butter !rounded-full shadow-lifted"
        >
          Build My Kloset
          <ArrowRight size={18} className="transition-transform duration-200 group-hover:translate-x-1" />
        </Button>
        {showStylistLink && (
          <button
            onClick={onStylistClick}
            className="text-text-primary/60 hover:text-text-primary text-sm font-medium underline underline-offset-4 transition-colors"
          >
            Go to AI Stylist
          </button>
        )}
      </div>
    </div>
  )
}
