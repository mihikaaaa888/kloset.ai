import { supabase } from './supabase'
import type { ClothingItem } from '@/types'

type DbItem = {
  id: string
  user_id: string
  name: string
  category: string
  subcategory: string | null
  image_id: string | null
  image_url: string | null
  image_storage_path: string | null
  image_source: string
  colour: string[]
  material: string | null
  pattern: string | null
  fit: string | null
  formality: string | null
  seasons: string[]
  occasions: string[]
  brand: string | null
  notes: string | null
  is_favourite: boolean
  times_worn: number
  last_worn: string | null
  created_at: string
  updated_at: string
}

function toItem(row: DbItem): ClothingItem {
  return {
    id: row.id,
    name: row.name,
    category: row.category as ClothingItem['category'],
    subcategory: row.subcategory ?? undefined,
    imageId: row.image_id ?? undefined,
    imageUrl: row.image_url,
    imageSource: row.image_source as ClothingItem['imageSource'],
    colour: row.colour,
    material: row.material ?? undefined,
    pattern: (row.pattern ?? undefined) as ClothingItem['pattern'],
    fit: row.fit ?? undefined,
    formality: row.formality ?? undefined,
    seasons: row.seasons as ClothingItem['seasons'],
    occasions: row.occasions as ClothingItem['occasions'],
    brand: row.brand ?? undefined,
    notes: row.notes ?? undefined,
    isFavourite: row.is_favourite,
    timesWorn: row.times_worn,
    lastWorn: row.last_worn ?? undefined,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  }
}

function toRow(userId: string, item: ClothingItem): Omit<DbItem, 'user_id'> & { user_id: string } {
  return {
    id: item.id,
    user_id: userId,
    name: item.name,
    category: item.category,
    subcategory: item.subcategory ?? null,
    image_id: item.imageId ?? null,
    image_url: item.imageUrl,
    image_storage_path: null,
    image_source: item.imageSource,
    colour: item.colour,
    material: item.material ?? null,
    pattern: item.pattern ?? null,
    fit: item.fit ?? null,
    formality: item.formality ?? null,
    seasons: item.seasons,
    occasions: item.occasions,
    brand: item.brand ?? null,
    notes: item.notes ?? null,
    is_favourite: item.isFavourite,
    times_worn: item.timesWorn,
    last_worn: item.lastWorn ?? null,
    created_at: item.createdAt,
    updated_at: item.updatedAt,
  }
}

export async function fetchWardrobe(userId: string): Promise<ClothingItem[]> {
  const { data, error } = await supabase
    .from('wardrobe_items')
    .select('*')
    .eq('user_id', userId)
    .order('created_at', { ascending: true })

  if (error || !data) return []
  return (data as DbItem[]).map(toItem)
}

export async function insertItem(userId: string, item: ClothingItem): Promise<void> {
  await supabase.from('wardrobe_items').insert(toRow(userId, item))
}

export async function updateItem(userId: string, item: ClothingItem): Promise<void> {
  const { id, user_id: _uid, created_at: _ca, ...updates } = toRow(userId, item)
  await supabase
    .from('wardrobe_items')
    .update({ ...updates, updated_at: new Date().toISOString() })
    .eq('id', id)
    .eq('user_id', userId)
}

export async function deleteItem(userId: string, itemId: string): Promise<void> {
  await supabase
    .from('wardrobe_items')
    .delete()
    .eq('id', itemId)
    .eq('user_id', userId)
}
