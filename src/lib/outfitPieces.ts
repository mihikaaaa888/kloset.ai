import type { CatalogItem, ClothingCategory, ClothingItem, Outfit, OutfitItem, PieceSnapshot } from '@/types'

// Outfits can mix wardrobe pieces with shop finds and inspiration photos. Those
// aren't in the wardrobe, so the outfit carries a snapshot of each one and it's
// turned back into a ClothingItem for display.

export const ROLE_FOR_CATEGORY: Record<ClothingCategory, OutfitItem['role']> = {
  tops: 'top',
  bottoms: 'bottom',
  dresses: 'dress',
  outerwear: 'outerwear',
  shoes: 'shoes',
  accessories: 'accessory',
}

/** A catalog piece shaped like a wardrobe item, for adding to the Kloset or showing in pickers. */
export function catalogToItem(c: CatalogItem, id: string = c.id): ClothingItem {
  const now = new Date().toISOString()
  return {
    id,
    name: c.name,
    category: c.category,
    subcategory: c.subcategory,
    imageUrl: c.imageUrl,
    imageSource: 'remote',
    colour: c.colours,
    material: c.material,
    pattern: c.pattern,
    fit: c.fit,
    formality: c.formality,
    seasons: c.seasons,
    occasions: c.occasions,
    isFavourite: false,
    timesWorn: 0,
    createdAt: now,
    updatedAt: now,
    catalogId: c.id,
  }
}

export function catalogSnapshot(c: CatalogItem): PieceSnapshot {
  return { source: 'shop', name: c.name, category: c.category, imageUrl: c.imageUrl, colour: c.colours, catalogId: c.id }
}

function snapshotToItem(id: string, s: PieceSnapshot): ClothingItem {
  return {
    id,
    name: s.name,
    category: s.category,
    imageUrl: s.imageUrl,
    imageSource: s.imageUrl ? 'remote' : 'none',
    colour: s.colour,
    pattern: 'solid',
    seasons: [],
    occasions: [],
    isFavourite: false,
    timesWorn: 0,
    createdAt: '',
    updatedAt: '',
    catalogId: s.catalogId,
  }
}

export interface ResolvedOutfitItem {
  itemId: string
  role: OutfitItem['role']
  item: ClothingItem | null
  source: 'kloset' | PieceSnapshot['source']
}

/** Each outfit piece as a displayable item: from the wardrobe, else from its snapshot. */
export function resolveOutfitItems(outfit: Outfit, wardrobe: ClothingItem[]): ResolvedOutfitItem[] {
  return outfit.items.map((oi) => {
    const owned = wardrobe.find((w) => w.id === oi.itemId)
    if (owned) return { itemId: oi.itemId, role: oi.role, item: owned, source: 'kloset' }
    if (oi.snapshot) return { itemId: oi.itemId, role: oi.role, item: snapshotToItem(oi.itemId, oi.snapshot), source: oi.snapshot.source }
    return { itemId: oi.itemId, role: oi.role, item: null, source: 'kloset' }
  })
}
