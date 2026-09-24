import { useState, useEffect } from 'react'
import { getImage } from '@/lib/imageStorage'
import { getPhotoUrl } from '@/lib/wardrobeService'
import type { ClothingItem } from '@/types'

/**
 * Resolves a displayable image URL for a ClothingItem.
 *
 * Priority:
 *   1. item.imageUrl — backwards-compat: old base64 data URLs still work immediately
 *   2. item.imageId  — new path: loads Blob from IndexedDB, creates object URL
 *   3. item.imageStoragePath — photo taken on another device, served from Supabase Storage
 *   4. null          — no image; show placeholder
 *
 * Automatically revokes any created object URLs on unmount or item change.
 */
export function useItemImage(item: ClothingItem | null | undefined): string | null {
  // Seed state immediately for base64 items — avoids a placeholder flash
  const [url, setUrl] = useState<string | null>(item?.imageUrl ?? null)

  useEffect(() => {
    if (!item) { setUrl(null); return }

    // Backwards compat: existing base64 / remote imageUrl takes priority
    if (item.imageUrl) { setUrl(item.imageUrl); return }

    if (!item.imageId && !item.imageStoragePath) { setUrl(null); return }

    let objectUrl: string | null = null
    let cancelled = false

    // Local copy first; a photo added on another device only exists in storage.
    const local = item.imageId ? getImage(item.imageId).catch(() => null) : Promise.resolve(null)
    local
      .then(async (blob) => {
        if (cancelled) return
        if (blob) {
          objectUrl = URL.createObjectURL(blob)
          setUrl(objectUrl)
          return
        }
        const remote = item.imageStoragePath ? await getPhotoUrl(item.imageStoragePath) : null
        if (!cancelled) setUrl(remote)
      })
      .catch(() => { if (!cancelled) setUrl(null) })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [item?.id, item?.imageId, item?.imageUrl, item?.imageStoragePath])

  return url
}
