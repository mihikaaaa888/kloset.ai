import { type ReactNode } from 'react'
import { ArrowLeft } from 'lucide-react'
import { clsx } from 'clsx'

interface OnboardingLayoutProps {
  step: number
  totalSteps: number
  onBack?: () => void
  children: ReactNode
}

export function OnboardingLayout({
  step,
  totalSteps,
  onBack,
  children,
}: OnboardingLayoutProps) {
  const progress = (step / totalSteps) * 100

  return (
    <div className="min-h-screen bg-cream-50 flex flex-col">
      {/* Progress bar + header */}
      <div className="fixed top-0 left-0 right-0 z-50 bg-cream-50/95 backdrop-blur-sm">
        {/* Progress bar */}
        <div className="h-0.5 bg-cream-200">
          <div
            className="h-full bg-charcoal-900 transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>

        {/* Header row */}
        <div className="flex items-center justify-between px-6 py-4 max-w-2xl mx-auto w-full">
          {onBack ? (
            <button
              onClick={onBack}
              className="flex items-center gap-2 text-charcoal-500 hover:text-charcoal-900 text-sm font-medium transition-colors"
              aria-label="Go back"
            >
              <ArrowLeft size={16} />
              Back
            </button>
          ) : (
            <div />
          )}

          <div className="flex items-center gap-1.5">
            {/* Logo */}
            <svg width="20" height="20" viewBox="0 0 28 28" fill="none">
              <rect width="28" height="28" rx="8" fill="#111110" />
              <path
                d="M8 10h12M8 14h8M8 18h10"
                stroke="#FAFAF8"
                strokeWidth="1.8"
                strokeLinecap="round"
              />
            </svg>
            <span className="font-serif text-base text-charcoal-900">
              Kloset<span className="text-gold">.</span>ai
            </span>
          </div>

          <span className="text-xs text-charcoal-400 tabular-nums">
            {step} / {totalSteps}
          </span>
        </div>
      </div>

      {/* Step dots */}
      <div className="fixed top-[60px] left-0 right-0 z-40 flex justify-center gap-1.5 py-2">
        {Array.from({ length: totalSteps }).map((_, i) => (
          <div
            key={i}
            className={clsx(
              'rounded-full transition-all duration-300',
              i + 1 < step
                ? 'w-4 h-1.5 bg-charcoal-900'
                : i + 1 === step
                ? 'w-6 h-1.5 bg-charcoal-900'
                : 'w-1.5 h-1.5 bg-cream-300'
            )}
          />
        ))}
      </div>

      {/* Content */}
      <div className="flex-1 flex flex-col items-center justify-center pt-28 pb-16 px-6">
        <div className="w-full max-w-2xl">{children}</div>
      </div>
    </div>
  )
}
