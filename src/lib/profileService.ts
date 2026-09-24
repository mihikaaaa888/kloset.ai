import { supabase } from './supabase'
import type { UserProfile } from '@/types'

type DbProfile = {
  id: string
  name: string
  age_range: string | null
  occupation: string | null
  lifestyle: string | null
  style_preferences: string[]
  typical_occasions: string[]
  favourite_colours: string[]
  avoid_colours: string[]
  gender_style_preference: string | null
  recommendation_frequency: string | null
  onboarding_complete: boolean
  style_item_selections?: string[] | null
  created_at: string
  updated_at: string
}

function toProfile(row: DbProfile): UserProfile {
  return {
    id: row.id,
    name: row.name,
    ageRange: (row.age_range ?? '') as UserProfile['ageRange'],
    occupation: row.occupation ?? '',
    lifestyle: row.lifestyle ?? '',
    stylePreferences: row.style_preferences as UserProfile['stylePreferences'],
    typicalOccasions: row.typical_occasions as UserProfile['typicalOccasions'],
    favouriteColours: row.favourite_colours,
    avoidColours: row.avoid_colours,
    genderStylePreference: (row.gender_style_preference ?? undefined) as UserProfile['genderStylePreference'],
    recommendationFrequency: (row.recommendation_frequency ?? 'weekly') as UserProfile['recommendationFrequency'],
    onboardingComplete: row.onboarding_complete,
    styleItemSelections: row.style_item_selections ?? [],
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

export async function fetchProfile(userId: string): Promise<UserProfile | null> {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', userId)
    .maybeSingle()

  if (error) {
    console.error('[profile] fetch failed', error.message)
    return null
  }
  if (!data) {
    console.log('[profile] no profile row yet', { userId })
    return null
  }
  const profile = toProfile(data as DbProfile)
  console.log('[profile] fetched', { onboardingComplete: profile.onboardingComplete, hasName: !!profile.name })
  return profile
}

// Returns true when the profile reached Supabase. Other devices only see what gets saved here.
export async function upsertProfile(userId: string, profile: UserProfile): Promise<boolean> {
  const row: Record<string, unknown> = {
    id: userId,
    name: profile.name,
    age_range: profile.ageRange || null,
    occupation: profile.occupation || null,
    lifestyle: profile.lifestyle || null,
    style_preferences: profile.stylePreferences,
    typical_occasions: profile.typicalOccasions,
    favourite_colours: profile.favouriteColours,
    avoid_colours: profile.avoidColours,
    gender_style_preference: profile.genderStylePreference ?? null,
    recommendation_frequency: profile.recommendationFrequency,
    onboarding_complete: profile.onboardingComplete,
    style_item_selections: profile.styleItemSelections ?? [],
    updated_at: new Date().toISOString(),
  }

  let { error } = await supabase.from('profiles').upsert(row)

  // Databases created before style_item_selections existed reject the whole row; save everything else.
  if (error?.code === '42703' || error?.code === 'PGRST204') {
    console.warn('[profile] style_item_selections column missing, saving without it — run supabase/schema.sql')
    delete row.style_item_selections
    ;({ error } = await supabase.from('profiles').upsert(row))
  }

  if (error) {
    console.error('[profile] save failed', error.message)
    return false
  }
  console.log('[profile] saved', { onboardingComplete: profile.onboardingComplete })
  return true
}
