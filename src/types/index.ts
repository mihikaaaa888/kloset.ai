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
  styleItemSelections?: string[]
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
  // Set when the item was added from the catalog
  catalogId?: string
}

// ─── Catalog ──────────────────────────────────────────────────────────────────

export interface CatalogItem {
  id: string
  name: string
  category: ClothingCategory
  subcategory?: string
  colours: string[]
  material: string
  pattern: Pattern
  seasons: Season[]
  occasions: Occasion[]
  styleAesthetics: StylePreference[]
  description: string
  priceRange: 'budget' | 'mid' | 'premium' | 'luxury'
  fit?: string
  formality?: string
  /** Reference photo — for browsing/inspiration, not the user's own item photo. */
  imageUrl: string
  /** Approximate buy price in USD, derived from priceRange. */
  estimatedPrice: number
  /** Approximate weekly rental price in USD. */
  rentPricePerWeek: number
  /** Opens a live shopping search for this piece (not a specific listing we can't verify). */
  shopUrl: string
  /** Opens a live rental-marketplace search for this piece. */
  rentUrl: string
}

// ─── Web shopping search (Exa) ─────────────────────────────────────────────────

/** A real, live product/page result from a retailer's site, via Exa search. */
export interface WebShopResult {
  id: string
  title: string
  url: string
  domain: string
  retailer: string
  snippet: string
  imageUrl: string | null
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
