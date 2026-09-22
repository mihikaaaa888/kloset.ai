import { useNavigate } from 'react-router-dom'
import { Pencil, Shirt, BookMarked, Flame, ChevronRight } from 'lucide-react'
import { clsx } from 'clsx'

import { Button } from '@/components/ui/Button'
import { colourNameToHex } from '@/lib/colourUtils'
import { useUserStore } from '@/store/userStore'
import { useWardrobeStore } from '@/store/wardrobeStore'
import { useOutfitStore } from '@/store/outfitStore'
import { styleOptions } from '@/pages/onboarding/onboardingData'

// ─── Avatar helpers ───────────────────────────────────────────────────────────

function getInitials(name: string): string {
  return name
    .split(' ')
    .map((w) => w[0])
    .join('')
    .toUpperCase()
    .slice(0, 2)
}

function getAvatarBg(name: string): string {
  const colours = [
    ['#C9A96E', '#8C7B6E'],
    ['#1A1A19', '#3D3D3A'],
    ['#355E3B', '#6B7C47'],
    ['#800020', '#B7410E'],
    ['#1B2A4A', '#3D3D3A'],
  ]
  const idx = name.split('').reduce((a, c) => a + c.charCodeAt(0), 0) % colours.length
  return `linear-gradient(135deg, ${colours[idx][0]}, ${colours[idx][1]})`
}

// ─── Component ────────────────────────────────────────────────────────────────

export function ProfilePage() {
  const navigate = useNavigate()
  const profile = useUserStore((s) => s.profile)
  const clearProfile = useUserStore((s) => s.clearProfile)
  const wardrobeItems = useWardrobeStore((s) => s.items)
  const { savedOutfits, savedOutfits: allOutfits } = useOutfitStore()
  const removeWardrobeItem = useWardrobeStore((s) => s.removeItem)
  const unsaveOutfitAction = useOutfitStore((s) => s.unsaveOutfit)

  if (!profile) {
    return (
      <div className="min-h-screen bg-text-primary/3 pt-16 lg:pt-20 flex items-center justify-center">
        <div className="text-center px-6">
          <h2 className="font-display text-2xl text-text-primary mb-3">No profile yet</h2>
          <Button onClick={() => navigate('/onboarding')}>Complete Onboarding</Button>
        </div>
      </div>
    )
  }

  const totalWears = wardrobeItems.reduce((sum, i) => sum + i.timesWorn, 0)
  const styleLabels = styleOptions.filter((s) => profile.stylePreferences.includes(s.value))

  const handleEditProfile = () => navigate('/onboarding?edit=true')

  const handleResetOnboarding = () => {
    if (window.confirm('This will restart your onboarding and clear your profile. Your wardrobe and saved outfits will remain. Continue?')) {
      clearProfile()
      navigate('/onboarding')
    }
  }

  const handleClearAll = () => {
    if (window.confirm('This will permanently delete your profile, wardrobe, and saved outfits. Are you sure?')) {
      wardrobeItems.forEach((item) => removeWardrobeItem(item.id))
      allOutfits.forEach((o) => unsaveOutfitAction(o.id))
      clearProfile()
      navigate('/')
    }
  }

  return (
    <div className="min-h-screen bg-warm-cream pb-28 md:pb-12">
      {/* ── Hero header ── */}
      <div className="bg-dark-purple pt-24 pb-12 px-6">
        <div className="mx-auto max-w-2xl">
          <div className="flex items-center gap-5">
            {/* Avatar */}
            <div
              className="w-20 h-20 rounded-full flex items-center justify-center flex-shrink-0 shadow-lifted"
              style={{ background: getAvatarBg(profile.name) }}
            >
              <span className="font-serif text-2xl text-white font-medium">
                {getInitials(profile.name)}
              </span>
            </div>

            <div className="flex-1 min-w-0">
              <h1 className="font-display text-3xl text-text-primary leading-tight">{profile.name}</h1>
              {profile.occupation && (
                <p className="text-text-primary/60 text-sm mt-0.5">{profile.occupation}</p>
              )}
              {profile.ageRange && (
                <p className="text-text-primary/40 text-xs mt-1 uppercase tracking-widest">
                  {AGE_LABEL[profile.ageRange]}
                </p>
              )}
            </div>

            <button
              onClick={handleEditProfile}
              className="w-10 h-10 rounded-full bg-text-primary/10 hover:bg-text-primary/20 flex items-center justify-center text-text-primary/70 hover:text-text-primary transition-colors flex-shrink-0"
              aria-label="Edit profile"
            >
              <Pencil size={16} />
            </button>
          </div>

          {/* Style tags — text only, no emoji */}
          {styleLabels.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-6">
              {styleLabels.map((s) => (
                <span
                  key={s.value}
                  className="px-3 py-1.5 rounded-full bg-text-primary/10 text-text-primary/70 text-xs font-medium"
                >
                  {s.label}
                </span>
              ))}
            </div>
          )}
        </div>
      </div>

      <div className="mx-auto max-w-2xl px-4 sm:px-6 py-8 space-y-8">

        {/* ── Stats ── */}
        <div className="grid grid-cols-3 gap-3">
          <StatCard icon={<Shirt size={18} />} value={wardrobeItems.length} label="Pieces" />
          <StatCard icon={<BookMarked size={18} />} value={savedOutfits.length} label="Saved" />
          <StatCard icon={<Flame size={18} />} value={totalWears} label="Wears" />
        </div>

        {/* ── Colour palette ── */}
        {(profile.favouriteColours.length > 0 || profile.avoidColours.length > 0) && (
          <ProfileSection title="Your Palette">
            {profile.favouriteColours.length > 0 && (
              <div className="mb-5">
                <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Loves</p>
                <div className="flex flex-wrap gap-3">
                  {profile.favouriteColours.map((c) => (
                    <ColourDot key={c} name={c} hex={colourNameToHex(c)} />
                  ))}
                </div>
              </div>
            )}
            {profile.avoidColours.length > 0 && (
              <div>
                <p className="text-xs text-text-muted uppercase tracking-widest mb-3">Avoids</p>
                <div className="flex flex-wrap gap-3">
                  {profile.avoidColours.map((c) => (
                    <ColourDot key={c} name={c} hex={colourNameToHex(c)} muted />
                  ))}
                </div>
              </div>
            )}
          </ProfileSection>
        )}

        {/* ── Occasions ── */}
        {profile.typicalOccasions.length > 0 && (
          <ProfileSection title="Occasions">
            <div className="flex flex-wrap gap-2">
              {profile.typicalOccasions.map((o) => (
                <span
                  key={o}
                  className="px-3 py-1.5 rounded-full bg-text-primary/5 text-text-primary text-sm capitalize font-medium"
                >
                  {o.replace('-', ' ')}
                </span>
              ))}
            </div>
          </ProfileSection>
        )}

        {/* ── Preferences ── */}
        <ProfileSection title="Preferences">
          <div className="space-y-3">
            <PreferenceRow
              label="Recommendation frequency"
              value={FREQUENCY_LABEL[profile.recommendationFrequency]}
            />
            {profile.genderStylePreference && profile.genderStylePreference !== 'no-preference' && (
              <PreferenceRow
                label="Style direction"
                value={profile.genderStylePreference}
              />
            )}
            {profile.lifestyle && (
              <PreferenceRow label="Lifestyle" value={profile.lifestyle} />
            )}
          </div>
        </ProfileSection>

        {/* ── Actions ── */}
        <ProfileSection title="Account">
          <div className="space-y-2">
            <ActionRow
              label="Edit style profile"
              description="Update your preferences, occasions, and colours"
              onClick={handleEditProfile}
            />
            <ActionRow
              label="Restart onboarding"
              description="Redo the setup — your wardrobe is kept"
              onClick={handleResetOnboarding}
            />
            <ActionRow
              label="Clear all data"
              description="Delete everything and start fresh"
              onClick={handleClearAll}
              danger
            />
          </div>
        </ProfileSection>

        {/* Version */}
        <p className="text-center text-2xs text-charcoal-300 uppercase tracking-widest pb-4">
          Kloset.ai · V1
        </p>
      </div>
    </div>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function StatCard({ icon, value, label }: { icon: React.ReactNode; value: number; label: string }) {
  return (
    <div className="bg-white rounded-3xl p-4 shadow-card border border-text-primary/5 flex flex-col items-center text-center gap-1">
      <div className="text-text-muted mb-1">{icon}</div>
      <span className="font-serif text-2xl font-medium text-text-primary tabular-nums">{value}</span>
      <span className="text-2xs text-text-muted uppercase tracking-widest">{label}</span>
    </div>
  )
}

function ProfileSection({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium text-text-muted uppercase tracking-widest mb-4">{title}</p>
      <div className="bg-white rounded-3xl p-5 shadow-card border border-text-primary/5">{children}</div>
    </div>
  )
}

function ColourDot({ name, hex, muted = false }: { name: string; hex: string; muted?: boolean }) {
  return (
    <div className="flex flex-col items-center gap-1.5">
      <div
        className={clsx('w-10 h-10 rounded-full ring-1 ring-black/10', muted && 'opacity-40')}
        style={{ backgroundColor: hex }}
        title={name}
      />
      <span className="text-2xs text-text-muted text-center max-w-[42px] leading-tight truncate">
        {name}
      </span>
    </div>
  )
}

function PreferenceRow({ label, value }: { label: string; value: string }) {
  return (
    <div className="flex items-center justify-between gap-4 py-2 border-b border-text-primary/8 last:border-0">
      <span className="text-sm text-text-muted">{label}</span>
      <span className="text-sm font-medium text-text-primary capitalize text-right">{value}</span>
    </div>
  )
}

function ActionRow({
  label,
  description,
  onClick,
  danger = false,
}: {
  label: string
  description: string
  onClick: () => void
  danger?: boolean
}) {
  return (
    <button
      onClick={onClick}
      className={clsx(
        'w-full flex items-center justify-between gap-4 px-4 py-3.5 rounded-2xl text-left transition-colors',
        danger
          ? 'hover:bg-red-50 text-red-600'
          : 'hover:bg-text-primary/3 text-text-primary'
      )}
    >
      <div>
        <p className="text-sm font-medium">{label}</p>
        <p className={clsx('text-xs mt-0.5', danger ? 'text-red-400' : 'text-text-muted')}>
          {description}
        </p>
      </div>
      <ChevronRight size={16} className={danger ? 'text-red-300' : 'text-charcoal-300'} />
    </button>
  )
}

// ─── Label maps ───────────────────────────────────────────────────────────────

const AGE_LABEL: Record<string, string> = {
  'under-25': 'Under 25',
  '25-34': '25 – 34',
  '35-44': '35 – 44',
  '45-54': '45 – 54',
  '55+': '55+',
}

const FREQUENCY_LABEL: Record<string, string> = {
  daily: 'Daily',
  'a-few-times-a-week': 'A few times a week',
  weekly: 'Weekly',
  'on-demand': 'On demand',
}

