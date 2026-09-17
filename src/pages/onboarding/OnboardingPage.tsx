import { useState, useCallback } from 'react'
import { useNavigate, useLocation } from 'react-router-dom'
import { ArrowRight, Check, Sparkles } from 'lucide-react'
import { clsx } from 'clsx'

import { OnboardingLayout } from './OnboardingLayout'
import {
  styleOptions,
  occasionOptions,
  COLOUR_PALETTE,
  ageRangeOptions,
  frequencyOptions,
  genderStyleOptions,
} from './onboardingData'
import { SelectChip } from '@/components/ui/SelectChip'
import { ColourSwatch } from '@/components/ui/ColourSwatch'
import { TextInput } from '@/components/ui/TextInput'
import { Button } from '@/components/ui/Button'
import { useUserStore } from '@/store/userStore'
import type { UserProfile, StylePreference, Occasion, AgeRange, RecommendationFrequency } from '@/types'

// ─── Draft state ─────────────────────────────────────────────────────────────

interface OnboardingDraft {
  name: string
  ageRange: AgeRange | ''
  occupation: string
  lifestyle: string
  stylePreferences: StylePreference[]
  typicalOccasions: Occasion[]
  favouriteColours: string[]
  avoidColours: string[]
  genderStylePreference: UserProfile['genderStylePreference'] | ''
  recommendationFrequency: RecommendationFrequency | ''
}

const INITIAL_DRAFT: OnboardingDraft = {
  name: '',
  ageRange: '',
  occupation: '',
  lifestyle: '',
  stylePreferences: [],
  typicalOccasions: [],
  favouriteColours: [],
  avoidColours: [],
  genderStylePreference: '',
  recommendationFrequency: '',
}

const TOTAL_STEPS = 9

function profileToDraft(profile: UserProfile): OnboardingDraft {
  return {
    name: profile.name,
    ageRange: profile.ageRange,
    occupation: profile.occupation,
    lifestyle: profile.lifestyle,
    stylePreferences: profile.stylePreferences,
    typicalOccasions: profile.typicalOccasions,
    favouriteColours: profile.favouriteColours,
    avoidColours: profile.avoidColours,
    genderStylePreference: profile.genderStylePreference ?? '',
    recommendationFrequency: profile.recommendationFrequency,
  }
}

// ─── Main Component ───────────────────────────────────────────────────────────

export function OnboardingPage() {
  const navigate = useNavigate()
  const location = useLocation()
  const setProfile = useUserStore((s) => s.setProfile)
  const profile = useUserStore((s) => s.profile)

  const isEditMode = new URLSearchParams(location.search).get('edit') === 'true'

  // Already onboarded and not editing — go straight to wardrobe
  if (profile?.onboardingComplete && !isEditMode) {
    navigate('/wardrobe', { replace: true })
    return null
  }

  const [step, setStep] = useState(1)
  const [draft, setDraft] = useState<OnboardingDraft>(
    isEditMode && profile ? profileToDraft(profile) : INITIAL_DRAFT
  )
  const [animating, setAnimating] = useState(false)
  const [direction, setDirection] = useState<'forward' | 'back'>('forward')

  const update = useCallback(
    <K extends keyof OnboardingDraft>(key: K, value: OnboardingDraft[K]) => {
      setDraft((d) => ({ ...d, [key]: value }))
    },
    []
  )

  const toggleArray = useCallback(
    <T,>(key: keyof OnboardingDraft, value: T) => {
      setDraft((d) => {
        const arr = d[key] as T[]
        const exists = arr.includes(value)
        return {
          ...d,
          [key]: exists ? arr.filter((v) => v !== value) : [...arr, value],
        }
      })
    },
    []
  )

  const canAdvance = (): boolean => {
    switch (step) {
      case 1: return draft.name.trim().length >= 2
      case 2: return draft.ageRange !== ''
      case 3: return draft.occupation.trim().length >= 2
      case 4: return draft.stylePreferences.length >= 1
      case 5: return draft.typicalOccasions.length >= 1
      case 6: return true // colours optional but encouraged
      case 7: return true // avoid colours optional
      case 8: return true // gender optional
      case 9: return draft.recommendationFrequency !== ''
      default: return false
    }
  }

  const transition = (nextStep: number, dir: 'forward' | 'back') => {
    setAnimating(true)
    setDirection(dir)
    setTimeout(() => {
      setStep(nextStep)
      setAnimating(false)
    }, 220)
  }

  const goNext = () => {
    if (step < TOTAL_STEPS) {
      transition(step + 1, 'forward')
    } else {
      handleComplete()
    }
  }

  const goBack = () => {
    if (step > 1) transition(step - 1, 'back')
  }

  const handleComplete = () => {
    const now = new Date().toISOString()
    const profile: UserProfile = {
      id: crypto.randomUUID(),
      name: draft.name.trim(),
      ageRange: draft.ageRange as AgeRange,
      occupation: draft.occupation.trim(),
      lifestyle: draft.lifestyle.trim() || draft.occupation.trim(),
      stylePreferences: draft.stylePreferences,
      typicalOccasions: draft.typicalOccasions,
      favouriteColours: draft.favouriteColours,
      avoidColours: draft.avoidColours,
      genderStylePreference: (draft.genderStylePreference as UserProfile['genderStylePreference']) || undefined,
      recommendationFrequency: draft.recommendationFrequency as RecommendationFrequency,
      onboardingComplete: true,
      createdAt: now,
      updatedAt: now,
    }
    setProfile(profile)
    navigate(isEditMode ? '/profile' : '/wardrobe')
  }

  const stepClass = clsx(
    'transition-all duration-200',
    animating
      ? direction === 'forward'
        ? 'opacity-0 translate-x-6'
        : 'opacity-0 -translate-x-6'
      : 'opacity-100 translate-x-0'
  )

  return (
    <OnboardingLayout
      step={step}
      totalSteps={TOTAL_STEPS}
      onBack={step > 1 ? goBack : undefined}
    >
      <div className={stepClass}>
        {step === 1 && (
          <Step1Name
            value={draft.name}
            onChange={(v) => update('name', v)}
            onNext={goNext}
            canAdvance={canAdvance()}
          />
        )}
        {step === 2 && (
          <Step2Age
            value={draft.ageRange}
            onChange={(v) => update('ageRange', v)}
            onNext={goNext}
          />
        )}
        {step === 3 && (
          <Step3Occupation
            occupation={draft.occupation}
            lifestyle={draft.lifestyle}
            onChangeOccupation={(v) => update('occupation', v)}
            onChangeLifestyle={(v) => update('lifestyle', v)}
            onNext={goNext}
            canAdvance={canAdvance()}
          />
        )}
        {step === 4 && (
          <Step4Style
            selected={draft.stylePreferences}
            onToggle={(v) => toggleArray('stylePreferences', v)}
            onNext={goNext}
            canAdvance={canAdvance()}
          />
        )}
        {step === 5 && (
          <Step5Occasions
            selected={draft.typicalOccasions}
            onToggle={(v) => toggleArray('typicalOccasions', v)}
            onNext={goNext}
            canAdvance={canAdvance()}
          />
        )}
        {step === 6 && (
          <Step6Colours
            title="What colours do you love?"
            subtitle="Select the tones you gravitate towards."
            selected={draft.favouriteColours}
            onToggle={(v) => toggleArray('favouriteColours', v)}
            onNext={goNext}
          />
        )}
        {step === 7 && (
          <Step6Colours
            title="Any colours to avoid?"
            subtitle="We'll keep these out of your recommendations."
            selected={draft.avoidColours}
            onToggle={(v) => toggleArray('avoidColours', v)}
            onNext={goNext}
            skipLabel="None, I'm open to anything"
          />
        )}
        {step === 8 && (
          <Step8Gender
            value={draft.genderStylePreference ?? ''}
            onChange={(v) => update('genderStylePreference', v)}
            onNext={goNext}
          />
        )}
        {step === 9 && (
          <Step9Frequency
            name={draft.name}
            value={draft.recommendationFrequency}
            onChange={(v) => update('recommendationFrequency', v)}
            onNext={goNext}
            canAdvance={canAdvance()}
          />
        )}
      </div>
    </OnboardingLayout>
  )
}

// ─── Individual Steps ─────────────────────────────────────────────────────────

function StepHeading({
  eyebrow,
  title,
  subtitle,
}: {
  eyebrow?: string
  title: string
  subtitle?: string
}) {
  return (
    <div className="mb-10">
      {eyebrow && (
        <p className="text-gold text-xs font-medium uppercase tracking-ultra-wide mb-3">
          {eyebrow}
        </p>
      )}
      <h2 className="font-display text-3xl sm:text-4xl font-medium text-charcoal-900 leading-tight mb-3">
        {title}
      </h2>
      {subtitle && (
        <p className="text-charcoal-500 text-base leading-relaxed">{subtitle}</p>
      )}
    </div>
  )
}

function StepActions({
  onNext,
  canAdvance,
  nextLabel = 'Continue',
  loading = false,
}: {
  onNext: () => void
  canAdvance: boolean
  nextLabel?: string
  loading?: boolean
}) {
  return (
    <div className="mt-10">
      <Button
        size="lg"
        onClick={onNext}
        disabled={!canAdvance}
        loading={loading}
        className="group"
      >
        {nextLabel}
        <ArrowRight
          size={16}
          className="transition-transform duration-200 group-hover:translate-x-1"
        />
      </Button>
    </div>
  )
}

// Step 1 — Name
function Step1Name({
  value,
  onChange,
  onNext,
  canAdvance,
}: {
  value: string
  onChange: (v: string) => void
  onNext: () => void
  canAdvance: boolean
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Welcome"
        title="What should we call you?"
        subtitle="This is just for personalisation — no account needed yet."
      />
      <TextInput
        autoFocus
        placeholder="Your name"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && canAdvance && onNext()}
        className="text-lg"
      />
      <StepActions onNext={onNext} canAdvance={canAdvance} />
    </div>
  )
}

// Step 2 — Age Range
function Step2Age({
  value,
  onChange,
  onNext,
}: {
  value: string
  onChange: (v: AgeRange) => void
  onNext: () => void
}) {
  return (
    <div>
      <StepHeading
        eyebrow="About you"
        title="What's your age range?"
        subtitle="Helps us tailor trends and style suggestions."
      />
      <div className="flex flex-wrap gap-3">
        {ageRangeOptions.map((opt) => (
          <SelectChip
            key={opt.value}
            label={opt.label}
            selected={value === opt.value}
            onClick={() => {
              onChange(opt.value as AgeRange)
              setTimeout(onNext, 250)
            }}
          />
        ))}
      </div>
    </div>
  )
}

// Step 3 — Occupation
function Step3Occupation({
  occupation,
  lifestyle,
  onChangeOccupation,
  onChangeLifestyle,
  onNext,
  canAdvance,
}: {
  occupation: string
  lifestyle: string
  onChangeOccupation: (v: string) => void
  onChangeLifestyle: (v: string) => void
  onNext: () => void
  canAdvance: boolean
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Your life"
        title="What do you do?"
        subtitle="Knowing your work and lifestyle helps us suggest outfits that fit your actual day."
      />
      <div className="flex flex-col gap-4">
        <TextInput
          autoFocus
          placeholder="e.g. Marketing Manager, Freelance Designer…"
          label="Occupation"
          value={occupation}
          onChange={(e) => onChangeOccupation(e.target.value)}
        />
        <TextInput
          placeholder="e.g. Busy with meetings, gym 3x a week, weekends outdoors…"
          label="Describe your lifestyle (optional)"
          value={lifestyle}
          onChange={(e) => onChangeLifestyle(e.target.value)}
          hint="The more context, the better your outfit suggestions."
        />
      </div>
      <StepActions onNext={onNext} canAdvance={canAdvance} />
    </div>
  )
}

// Step 4 — Style
function Step4Style({
  selected,
  onToggle,
  onNext,
  canAdvance,
}: {
  selected: StylePreference[]
  onToggle: (v: StylePreference) => void
  onNext: () => void
  canAdvance: boolean
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Your aesthetic"
        title="How would you describe your style?"
        subtitle="Pick all that feel like you — your wardrobe can contain multitudes."
      />
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-4">
        {styleOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onToggle(opt.value)}
            className={clsx(
              'text-left p-4 rounded-2xl border transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900',
              selected.includes(opt.value)
                ? 'bg-charcoal-900 text-cream-50 border-charcoal-900'
                : 'bg-white text-charcoal-700 border-cream-200 hover:border-charcoal-300'
            )}
          >
            <div className="text-2xl mb-2">{opt.emoji}</div>
            <div className="font-medium text-sm">{opt.label}</div>
            <div
              className={clsx(
                'text-2xs mt-0.5',
                selected.includes(opt.value) ? 'text-cream-300' : 'text-charcoal-400'
              )}
            >
              {opt.description}
            </div>
          </button>
        ))}
      </div>
      <StepActions onNext={onNext} canAdvance={canAdvance} />
    </div>
  )
}

// Step 5 — Occasions
function Step5Occasions({
  selected,
  onToggle,
  onNext,
  canAdvance,
}: {
  selected: Occasion[]
  onToggle: (v: Occasion) => void
  onNext: () => void
  canAdvance: boolean
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Your occasions"
        title="What do you typically dress for?"
        subtitle="Select everything that's part of your regular life."
      />
      <div className="flex flex-wrap gap-3">
        {occasionOptions.map((opt) => (
          <SelectChip
            key={opt.value}
            label={opt.label}
            emoji={opt.emoji}
            selected={selected.includes(opt.value)}
            onClick={() => onToggle(opt.value)}
          />
        ))}
      </div>
      <StepActions onNext={onNext} canAdvance={canAdvance} />
    </div>
  )
}

// Step 6 & 7 — Colours (reused for both)
function Step6Colours({
  title,
  subtitle,
  selected,
  onToggle,
  onNext,
  skipLabel,
}: {
  title: string
  subtitle: string
  selected: string[]
  onToggle: (v: string) => void
  onNext: () => void
  skipLabel?: string
}) {
  return (
    <div>
      <StepHeading eyebrow="Your palette" title={title} subtitle={subtitle} />
      <div className="flex flex-wrap gap-3">
        {COLOUR_PALETTE.map((colour) => (
          <div key={colour.name} className="flex flex-col items-center gap-1.5">
            <ColourSwatch
              name={colour.name}
              hex={colour.hex}
              selected={selected.includes(colour.name)}
              onClick={() => onToggle(colour.name)}
            />
            <span className="text-2xs text-charcoal-400 text-center max-w-[48px] leading-tight">
              {colour.name}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-10 flex flex-col sm:flex-row items-start gap-4">
        <Button size="lg" onClick={onNext} className="group">
          {selected.length > 0 ? `Continue with ${selected.length} selected` : 'Continue'}
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Button>
        {skipLabel && (
          <button
            onClick={onNext}
            className="text-charcoal-400 hover:text-charcoal-700 text-sm underline underline-offset-4 transition-colors"
          >
            {skipLabel}
          </button>
        )}
      </div>
    </div>
  )
}

// Step 8 — Gender style preference
function Step8Gender({
  value,
  onChange,
  onNext,
}: {
  value: string
  onChange: (v: UserProfile['genderStylePreference']) => void
  onNext: () => void
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Optional"
        title="Any gender expression preference?"
        subtitle="This shapes the styling direction of your recommendations. Totally optional."
      />
      <div className="flex flex-wrap gap-3">
        {genderStyleOptions.map((opt) => (
          <SelectChip
            key={opt.value}
            label={opt.label}
            emoji={opt.emoji}
            selected={value === opt.value}
            onClick={() => {
              onChange(opt.value as UserProfile['genderStylePreference'])
              setTimeout(onNext, 250)
            }}
          />
        ))}
      </div>
      <div className="mt-10">
        <button
          onClick={onNext}
          className="text-charcoal-400 hover:text-charcoal-700 text-sm underline underline-offset-4 transition-colors"
        >
          Skip this question
        </button>
      </div>
    </div>
  )
}

// Step 9 — Frequency
function Step9Frequency({
  name,
  value,
  onChange,
  onNext,
  canAdvance,
}: {
  name: string
  value: string
  onChange: (v: RecommendationFrequency) => void
  onNext: () => void
  canAdvance: boolean
}) {
  return (
    <div>
      <StepHeading
        eyebrow="Almost done"
        title={`How often would you like outfit suggestions, ${name.split(' ')[0]}?`}
        subtitle="You can always change this later in your profile."
      />
      <div className="flex flex-col gap-3">
        {frequencyOptions.map((opt) => (
          <button
            key={opt.value}
            type="button"
            onClick={() => onChange(opt.value as RecommendationFrequency)}
            className={clsx(
              'flex items-center justify-between p-4 rounded-2xl border text-left',
              'transition-all duration-200',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-charcoal-900',
              value === opt.value
                ? 'bg-charcoal-900 text-cream-50 border-charcoal-900'
                : 'bg-white text-charcoal-700 border-cream-200 hover:border-charcoal-300'
            )}
          >
            <div>
              <div className="font-medium text-sm">{opt.label}</div>
              <div
                className={clsx(
                  'text-xs mt-0.5',
                  value === opt.value ? 'text-cream-300' : 'text-charcoal-400'
                )}
              >
                {opt.description}
              </div>
            </div>
            {value === opt.value && (
              <Check size={16} className="text-cream-50 flex-shrink-0" />
            )}
          </button>
        ))}
      </div>
      <div className="mt-10">
        <Button
          size="lg"
          onClick={onNext}
          disabled={!canAdvance}
          className="group !bg-charcoal-900"
        >
          <Sparkles size={16} />
          Build My Kloset
          <ArrowRight
            size={16}
            className="transition-transform duration-200 group-hover:translate-x-1"
          />
        </Button>
      </div>
    </div>
  )
}
