import { CATALOG_ITEMS } from '@/lib/catalogData'
import type { CatalogItem, ClothingCategory, ClothingItem, StylePreference, UserProfile } from '@/types'

// ─── Budget ───────────────────────────────────────────────────────────────────
// One dropdown drives every shopping mode. Buying filters on the per-piece
// price; renting filters on the weekly rental price, so each band carries
// both a buy and a rent range.

export type BudgetId = 'any' | 'low' | 'mid' | 'high' | 'luxe'

interface BudgetBand {
  id: BudgetId
  buyLabel: string
  rentLabel: string
  buy: [number, number]
  rent: [number, number]
}

export const BUDGET_BANDS: BudgetBand[] = [
  { id: 'any',  buyLabel: 'Any budget',          rentLabel: 'Any budget',            buy: [0, Infinity],      rent: [0, Infinity] },
  { id: 'low',  buyLabel: 'Under ₹2,500',        rentLabel: 'Under ₹500 / wk',       buy: [0, 2499],          rent: [0, 499] },
  { id: 'mid',  buyLabel: '₹2,500 – ₹6,000',     rentLabel: '₹500 – ₹1,000 / wk',    buy: [2500, 5999],       rent: [500, 999] },
  { id: 'high', buyLabel: '₹6,000 – ₹15,000',    rentLabel: '₹1,000 – ₹2,000 / wk',  buy: [6000, 14999],      rent: [1000, 1999] },
  { id: 'luxe', buyLabel: '₹15,000+',            rentLabel: '₹2,000+ / wk',          buy: [15000, Infinity],  rent: [2000, Infinity] },
]

const INR = new Intl.NumberFormat('en-IN', { style: 'currency', currency: 'INR', maximumFractionDigits: 0 })

/** ₹2,499 — Indian digit grouping, no paise. */
export function formatINR(amount: number): string {
  return INR.format(amount)
}

const band = (id: BudgetId) => BUDGET_BANDS.find((b) => b.id === id) ?? BUDGET_BANDS[0]

export function fitsBuyBudget(item: CatalogItem, budget: BudgetId): boolean {
  const [lo, hi] = band(budget).buy
  return item.estimatedPrice >= lo && item.estimatedPrice <= hi
}

export function fitsRentBudget(item: CatalogItem, budget: BudgetId): boolean {
  const [lo, hi] = band(budget).rent
  return item.rentPricePerWeek >= lo && item.rentPricePerWeek <= hi
}

// ─── Personal ranking ─────────────────────────────────────────────────────────
// Pieces that match the user's style aesthetic, and categories their Kloset is
// missing or thin in, float to the top — that's what makes it "personal".

function gapCategories(wardrobe: ClothingItem[]): Set<ClothingCategory> {
  const counts = new Map<ClothingCategory, number>()
  for (const i of wardrobe) counts.set(i.category, (counts.get(i.category) ?? 0) + 1)
  const all: ClothingCategory[] = ['tops', 'bottoms', 'dresses', 'outerwear', 'shoes', 'accessories']
  return new Set(all.filter((c) => (counts.get(c) ?? 0) <= 1))
}

function personalScore(item: CatalogItem, styles: StylePreference[], gaps: Set<ClothingCategory>): number {
  let score = 0
  score += item.styleAesthetics.filter((s) => styles.includes(s)).length * 2
  if (gaps.has(item.category)) score += 1
  return score
}

export function rankForUser(items: CatalogItem[], profile: UserProfile | null, wardrobe: ClothingItem[]): CatalogItem[] {
  const styles = profile?.stylePreferences ?? []
  const gaps = gapCategories(wardrobe)
  return [...items].sort((a, b) => personalScore(b, styles, gaps) - personalScore(a, styles, gaps))
}

// ─── Rent ─────────────────────────────────────────────────────────────────────
// Renting makes sense for occasion pieces and investment-price pieces, not
// everyday basics.

export function isRentable(item: CatalogItem): boolean {
  const occasionPiece = item.occasions.some((o) => ['formal', 'special-event', 'date-night'].includes(o))
  const investmentPiece = item.priceRange === 'premium' || item.priceRange === 'luxury'
  return occasionPiece || investmentPiece || item.category === 'dresses'
}

// ─── Brand-new outfits ────────────────────────────────────────────────────────

export interface ShoppingLook {
  id: string
  title: string
  style: StylePreference
  pieces: CatalogItem[]
  total: number
}

const LOOK_TITLES: Record<StylePreference, string> = {
  classic: 'The Classic Edit',
  minimalist: 'Quiet Minimalism',
  business: 'Boardroom Ready',
  streetwear: 'Off-Duty Street',
  bohemian: 'Free-Spirited',
  athleisure: 'Easy Movement',
  romantic: 'Soft Romance',
  eclectic: 'Mix & Match',
}

/**
 * Builds complete, shoppable outfits (top + bottom or a dress, plus shoes and
 * a finishing layer/accessory) from the catalog — one look per style, starting
 * with the user's own style aesthetic. Every piece respects the budget.
 */
export function buildShoppingLooks(profile: UserProfile | null, budget: BudgetId, maxLooks = 6): ShoppingLook[] {
  const pool = CATALOG_ITEMS.filter((i) => fitsBuyBudget(i, budget))
  const userStyles = profile?.stylePreferences ?? []
  const allStyles = Object.keys(LOOK_TITLES) as StylePreference[]
  const styleOrder = [...userStyles, ...allStyles.filter((s) => !userStyles.includes(s))]

  const used = new Set<string>()
  const pick = (category: ClothingCategory, style: StylePreference): CatalogItem | undefined => {
    const inCategory = pool.filter((i) => i.category === category && !used.has(i.id))
    const choice = inCategory.find((i) => i.styleAesthetics.includes(style)) ?? inCategory[0]
    if (choice) used.add(choice.id)
    return choice
  }

  const looks: ShoppingLook[] = []
  for (const [index, style] of styleOrder.entries()) {
    if (looks.length >= maxLooks) break

    // Alternate dress-based and separates-based looks for variety.
    const pieces: (CatalogItem | undefined)[] = []
    const dress = index % 3 === 2 ? pick('dresses', style) : undefined
    if (dress) {
      pieces.push(dress)
    } else {
      pieces.push(pick('tops', style), pick('bottoms', style))
    }
    pieces.push(pick('shoes', style))
    pieces.push(index % 2 === 0 ? pick('outerwear', style) : pick('accessories', style))

    const complete = pieces.filter(Boolean) as CatalogItem[]
    const hasBase = complete.some((p) => ['tops', 'dresses'].includes(p.category))
    if (!hasBase || complete.length < 3) {
      complete.forEach((p) => used.delete(p.id))
      continue
    }

    looks.push({
      id: `look-${style}`,
      title: LOOK_TITLES[style],
      style,
      pieces: complete,
      total: complete.reduce((sum, p) => sum + p.estimatedPrice, 0),
    })
  }

  console.log('[shopping] built looks', { budget, count: looks.length })
  return looks
}

// ─── Complete a piece ─────────────────────────────────────────────────────────
// Given one piece (from the user's Kloset, or read from an uploaded photo),
// recommend catalog pieces in the categories that finish an outfit around it.

export interface PieceAnchor {
  name: string
  category: ClothingCategory
  colours: string[]
  occasions: string[]
  formality?: string | null
  imageUrl?: string | null
}

const COMPLEMENTS: Record<ClothingCategory, ClothingCategory[]> = {
  tops: ['bottoms', 'outerwear', 'shoes', 'accessories'],
  bottoms: ['tops', 'outerwear', 'shoes', 'accessories'],
  dresses: ['outerwear', 'shoes', 'accessories'],
  outerwear: ['tops', 'bottoms', 'shoes'],
  shoes: ['tops', 'bottoms', 'accessories'],
  accessories: ['tops', 'bottoms', 'dresses'],
}

const NEUTRALS = new Set(['black', 'white', 'cream', 'beige', 'camel', 'tan', 'navy', 'grey', 'charcoal', 'brown', 'denim'])
const isNeutral = (c: string) => NEUTRALS.has(c.toLowerCase())

function complementScore(item: CatalogItem, anchor: PieceAnchor, styles: StylePreference[]): number {
  let score = 0
  // Shared occasions — the pieces need to be worn to the same places.
  score += item.occasions.filter((o) => anchor.occasions.includes(o)).length * 2
  // Colour harmony: neutrals go with anything; two non-neutral statement
  // colours compete, so one bold piece per outfit.
  const anchorBold = anchor.colours.some((c) => !isNeutral(c))
  const itemBold = item.colours.some((c) => !isNeutral(c))
  if (!itemBold) score += 2
  else if (!anchorBold) score += 1
  else score -= 1
  // Matching formality level.
  if (anchor.formality && item.formality && item.formality.toLowerCase() === anchor.formality.toLowerCase()) score += 1
  // The user's own aesthetic.
  score += item.styleAesthetics.filter((s) => styles.includes(s)).length
  return score
}

export interface PieceRecommendationGroup {
  category: ClothingCategory
  items: CatalogItem[]
}

export function recommendForPiece(
  anchor: PieceAnchor,
  budget: BudgetId,
  profile: UserProfile | null,
  perCategory = 4
): PieceRecommendationGroup[] {
  const styles = profile?.stylePreferences ?? []
  const groups = COMPLEMENTS[anchor.category].map((category) => ({
    category,
    items: CATALOG_ITEMS
      .filter((i) => i.category === category && fitsBuyBudget(i, budget))
      .sort((a, b) => complementScore(b, anchor, styles) - complementScore(a, anchor, styles))
      .slice(0, perCategory),
  })).filter((g) => g.items.length > 0)

  console.log('[shopping] complete-a-piece', { anchor: anchor.name, category: anchor.category, budget, groups: groups.length })
  return groups
}
