import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { ClothingItem, ClothingCategory } from '@/types'

interface WardrobeStore {
  items: ClothingItem[]
  activeCategory: ClothingCategory | 'all'
  setItems: (items: ClothingItem[]) => void
  addItem: (item: ClothingItem) => void
  updateItem: (id: string, updates: Partial<ClothingItem>) => void
  removeItem: (id: string) => void
  toggleFavourite: (id: string) => void
  setActiveCategory: (category: ClothingCategory | 'all') => void
  getItemsByCategory: (category: ClothingCategory | 'all') => ClothingItem[]
}

export const useWardrobeStore = create<WardrobeStore>()(
  persist(
    (set, get) => ({
      items: [],
      activeCategory: 'all',

      setItems: (items) => set({ items }),

      addItem: (item) =>
        set((state) => ({ items: [...state.items, item] })),

      updateItem: (id, updates) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id
              ? { ...item, ...updates, updatedAt: new Date().toISOString() }
              : item
          ),
        })),

      removeItem: (id) =>
        set((state) => ({ items: state.items.filter((item) => item.id !== id) })),

      toggleFavourite: (id) =>
        set((state) => ({
          items: state.items.map((item) =>
            item.id === id ? { ...item, isFavourite: !item.isFavourite } : item
          ),
        })),

      setActiveCategory: (category) => set({ activeCategory: category }),

      getItemsByCategory: (category) => {
        const { items } = get()
        return category === 'all' ? items : items.filter((i) => i.category === category)
      },
    }),
    { name: 'kloset-wardrobe' }
  )
)
