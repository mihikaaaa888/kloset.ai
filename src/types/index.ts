// ─── User & Profile ──────────────────────────────────────────────────────────

export type AgeRange = 'under-25' | '25-34' | '35-44' | '45-54' | '55+'

export type StylePreference =
  | 'classic'
  | 'minimalist'
  | 'streetwear'
  | 'bohemian'
  | 'business'
  | 'athleisure'
  | 'romantic'
  | 'eclectic'

export type Occasion =
  | 'work'
  | 'casual'
  | 'formal'
  | 'date-night'
  | 'weekend'
  | 'travel'
  | 'gym'
  | 'special-event'

export type RecommendationFrequency = 'daily' | 'a-few-times-a-week' | 'weekly' | 'on-demand'

export interface UserProfile {
  id: string
  name: string
  ageRange: AgeRange
  occupation: string
  lifestyle: string
  stylePreferences: StylePreference[]
  typicalOccasions: Occasion[]
  favouriteColours: string[]
  avoidColours: string[]
  genderStylePreference?: 'feminine' | 'masculine' | 'androgynous' | 'no-preference'
  recommendationFrequency: RecommendationFrequency
  onboardingComplete: boolean
  createdAt: string
  updatedAt: string
}

// ─── Wardrobe ─────────────────────────────────────────────────────────────────

export type ClothingCategory =
  | 'tops'
  | 'bottoms'
  | 'dresses'
  | 'outerwear'
  | 'shoes'
  | 'accessories'

export type Season = 'spring' | 'summer' | 'autumn' | 'winter' | 'all-season'

export type Pattern =
  | 'solid'
  | 'striped'
  | 'checked'
  | 'floral'
  | 'abstract'
  | 'animal-print'
  | 'geometric'
  | 'other'

export interface ClothingItem {
  id: string
  name: string
  category: ClothingCategory
  subcategory?: string
  // imageId: IndexedDB key for the stored Blob (new path, survives refresh)
  imageId?: string
  // imageUrl: legacy base64 data URL or remote URL; kept for backwards compatibility
  imageUrl: string | null
  imageSource: 'local' | 'remote' | 'none'
  colour: string[]
  material?: string
  pattern: Pattern
  fit?: string
  formality?: string
  seasons: Season[]
  occasions: Occasion[]
  brand?: string
  notes?: string
  isFavourite: boolean
  timesWorn: number
  lastWorn?: string
  createdAt: string
  updatedAt: string
}

// ─── Outfits ──────────────────────────────────────────────────────────────────

export interface OutfitItem {
  itemId: string
  role: 'top' | 'bottom' | 'dress' | 'outerwear' | 'shoes' | 'accessory'
}

export interface Outfit {
  id: string
  name: string
  items: OutfitItem[]
  occasion: Occasion
  weather?: string
  mood?: string
  stylingNotes: string
  whyItWorks: string
  generatedAt: string
  savedAt?: string
  isSaved: boolean
  source: 'ai-mock' | 'ai-api' | 'manual'
}

// ─── Stylist Request ──────────────────────────────────────────────────────────

export interface OutfitRequest {
  occasion: Occasion
  weather: string
  mood: string
  stylePreference?: StylePreference
  additionalNotes?: string
}

export interface OutfitGenerationResult {
  outfit: Outfit
  alternativeItems?: ClothingItem[]
}
