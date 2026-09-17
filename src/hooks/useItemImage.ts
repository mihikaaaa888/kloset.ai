import { useState, useEffect } from 'react'
import { getImage } from '@/lib/imageStorage'
import type { ClothingItem } from '@/types'

/**
 * Resolves a displayable image URL for a ClothingItem.
 *
 * Priority:
 *   1. item.imageUrl — backwards-compat: old base64 data URLs still work immediately
 *   2. item.imageId  — new path: loads Blob from IndexedDB, creates object URL
 *   3. null          — no image; show placeholder
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

    // New path: load Blob from IndexedDB and create a temporary object URL
    if (!item.imageId) { setUrl(null); return }

    let objectUrl: string | null = null
    let cancelled = false

    getImage(item.imageId)
      .then((blob) => {
        if (cancelled) return
        if (blob) {
          objectUrl = URL.createObjectURL(blob)
          setUrl(objectUrl)
        } else {
          setUrl(null)
        }
      })
      .catch(() => { if (!cancelled) setUrl(null) })

    return () => {
      cancelled = true
      if (objectUrl) URL.revokeObjectURL(objectUrl)
    }
  }, [item?.id, item?.imageId, item?.imageUrl])

  return url
}
