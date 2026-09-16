import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { Outfit } from '@/types'

interface OutfitStore {
  savedOutfits: Outfit[]
  currentOutfit: Outfit | null
  saveOutfit: (outfit: Outfit) => void
  unsaveOutfit: (id: string) => void
  setCurrentOutfit: (outfit: Outfit | null) => void
  isOutfitSaved: (id: string) => boolean
}

export const useOutfitStore = create<OutfitStore>()(
  persist(
    (set, get) => ({
      savedOutfits: [],
      currentOutfit: null,

      saveOutfit: (outfit) =>
        set((state) => ({
          savedOutfits: [
            ...state.savedOutfits.filter((o) => o.id !== outfit.id),
            { ...outfit, isSaved: true, savedAt: new Date().toISOString() },
          ],
        })),

      unsaveOutfit: (id) =>
        set((state) => ({
          savedOutfits: state.savedOutfits.filter((o) => o.id !== id),
        })),

      setCurrentOutfit: (outfit) => set({ currentOutfit: outfit }),

      isOutfitSaved: (id) => get().savedOutfits.some((o) => o.id === id),
    }),
    { name: 'kloset-outfits' }
  )
)
