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
    .single()

  if (error || !data) return null
  return toProfile(data as DbProfile)
}

export async function upsertProfile(userId: string, profile: UserProfile): Promise<void> {
  await supabase.from('profiles').upsert({
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
  })
}
