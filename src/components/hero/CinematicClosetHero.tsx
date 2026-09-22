import { useEffect, useRef, useState } from 'react'
import { HeroCopy } from './HeroCopy'
import { useCinematicChromaHero } from '@/hooks/useCinematicChromaHero'

const VIDEO_SRC = '/videos/closet-hero.mp4'
const HERO_SCROLL_VH = 600 // scroll runway for the pinned closet animation — more room to breathe

interface CinematicClosetHeroProps {
  onCTA: () => void
  showStylistLink?: boolean
  onStylistClick?: () => void
}

function useMediaQuery(query: string): boolean {
  const [matches, setMatches] = useState(() => (typeof window !== 'undefined' ? window.matchMedia(query).matches : false))
  useEffect(() => {
    const mql = window.matchMedia(query)
    const handler = () => setMatches(mql.matches)
    handler()
    mql.addEventListener('change', handler)
    return () => mql.removeEventListener('change', handler)
  }, [query])
  return matches
}

/**
 * Backdrop shared by every hero variant: the dark-purple gradient + pattern
 * that used to sit behind the plain hero text. Kept identical so the
 * cinematic version reveals the same visual language the static fallback shows.
 */
function HeroBackdrop() {
  return (
    <>
      <div className="absolute inset-0 bg-dark-purple" />
      <div
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23355E3B' fill-opacity='1'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
        }}
      />
      <div className="absolute inset-0 bg-gradient-to-br from-dark-purple via-deep-purple to-dark-purple opacity-90" />
      <div className="absolute top-1/4 right-1/4 w-96 h-96 rounded-full bg-butter-yellow/5 blur-3xl pointer-events-none" />
    </>
  )
}

/** Static hero — reduced motion, WebGL unavailable, or video failed to load. */
function StaticHero({ onCTA, showStylistLink, onStylistClick }: CinematicClosetHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center">
      <HeroBackdrop />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-warm-cream to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-32">
        <HeroCopy onCTA={onCTA} showStylistLink={showStylistLink} onStylistClick={onStylistClick} />
      </div>
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-text-primary/30">
        <span className="text-2xs uppercase tracking-widest">Scroll</span>
        <div className="w-px h-8 bg-gradient-to-b from-text-primary/30 to-transparent" />
      </div>
    </section>
  )
}

/** Lightweight mobile hero — a short, plain looping video, no chroma key / scroll scrub. */
function MobileVideoHero({ onCTA, showStylistLink, onStylistClick }: CinematicClosetHeroProps) {
  return (
    <section className="relative min-h-screen flex items-center overflow-hidden">
      <HeroBackdrop />
      <video
        className="absolute inset-0 w-full h-full object-cover opacity-30"
        src={VIDEO_SRC}
        autoPlay
        muted
        loop
        playsInline
        preload="auto"
      />
      <div className="absolute inset-0 bg-gradient-to-b from-dark-purple/60 via-dark-purple/70 to-dark-purple" />
      <div className="absolute bottom-0 left-0 right-0 h-64 bg-gradient-to-t from-warm-cream to-transparent" />
      <div className="relative z-10 mx-auto max-w-7xl px-6 lg:px-8 pt-24 pb-32">
        <HeroCopy onCTA={onCTA} showStylistLink={showStylistLink} onStylistClick={onStylistClick} />
      </div>
    </section>
  )
}

/** Desktop cinematic hero — scroll-scrubbed, chroma-keyed, zooming closet portal. */
function CinematicHeroDesktop({ onCTA, showStylistLink, onStylistClick }: CinematicClosetHeroProps) {
  const containerRef = useRef<HTMLDivElement>(null)
  const videoRef = useRef<HTMLVideoElement>(null)
  const canvasRef = useRef<HTMLCanvasElement>(null)
  const contentRef = useRef<HTMLDivElement>(null)

  const { isReady, hasError } = useCinematicChromaHero({
    containerRef,
    videoRef,
    canvasRef,
    contentRef,
    zoomTo: 2.6,
    openFraction: 0.6,
    enabled: true,
  })

  if (hasError) {
    return <StaticHero onCTA={onCTA} showStylistLink={showStylistLink} onStylistClick={onStylistClick} />
  }

  return (
    <section id="cinematic-hero" ref={containerRef} className="relative" style={{ height: `${HERO_SCROLL_VH}vh` }}>
      <div className="sticky top-0 h-screen w-full overflow-hidden">
        <HeroBackdrop />

        {/* Hero copy — scales/fades in centred, in lockstep with the door
            opening (same eased progress drives both), driven imperatively by
            the hook via this ref (not React state, to stay off the render
            path). No z-index here: it must stay BELOW the canvas in the
            stacking order (an explicit z-index would paint above the canvas
            regardless of DOM order), since the video's alpha holes are what
            reveal it underneath. */}
        <div ref={contentRef} className="absolute inset-0 h-full flex items-center justify-center px-6" style={{ opacity: 0 }}>
          <HeroCopy onCTA={onCTA} showStylistLink={showStylistLink} onStylistClick={onStylistClick} animate={false} align="center" />
        </div>

        {/* Closet video layer — chroma-keyed transparent portal, zooms toward
            centre while opening, then fades out completely. */}
        <canvas
          ref={canvasRef}
          className="absolute inset-0 w-full h-full pointer-events-none"
          style={{ transformOrigin: '50% 50%', opacity: 0 }}
          aria-hidden="true"
        />

        {/* Not `display:none` (Tailwind's `hidden`) — browsers deprioritize or
            skip decoding frames for display:none video, which is why the
            closet would sometimes render and sometimes just silently never
            show up. Laid out off-screen instead, so decoding stays reliable. */}
        <video
          ref={videoRef}
          src={VIDEO_SRC}
          aria-hidden="true"
          tabIndex={-1}
          style={{ position: 'absolute', width: 1, height: 1, left: -9999, top: -9999, opacity: 0, pointerEvents: 'none' }}
        />

        {!isReady && (
          <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
            <div className="w-8 h-8 rounded-full border-2 border-butter-yellow/30 border-t-butter-yellow animate-spin" />
          </div>
        )}

        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-10 flex flex-col items-center gap-2 text-text-primary/30">
          <span className="text-2xs uppercase tracking-widest">Scroll</span>
          <div className="w-px h-8 bg-gradient-to-b from-text-primary/30 to-transparent" />
        </div>
      </div>
    </section>
  )
}

export function CinematicClosetHero(props: CinematicClosetHeroProps) {
  const prefersReducedMotion = useMediaQuery('(prefers-reduced-motion: reduce)')
  const isMobile = useMediaQuery('(max-width: 767px)')
  const supportsWebGL = useRef<boolean>(true)

  if (typeof window !== 'undefined' && supportsWebGL.current) {
    try {
      const testCanvas = document.createElement('canvas')
      supportsWebGL.current = !!(testCanvas.getContext('webgl') || testCanvas.getContext('experimental-webgl'))
    } catch {
      supportsWebGL.current = false
    }
  }

  if (prefersReducedMotion) return <StaticHero {...props} />
  if (isMobile) return <MobileVideoHero {...props} />
  if (!supportsWebGL.current) return <StaticHero {...props} />
  return <CinematicHeroDesktop {...props} />
}
