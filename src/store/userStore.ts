import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { UserProfile } from '@/types'

interface UserStore {
  profile: UserProfile | null
  // Which user's profile has been loaded from Supabase this session. Not persisted, so every
  // fresh page load waits for the server before deciding whether onboarding is needed.
  loadedForUserId: string | null
  setProfile: (profile: UserProfile) => void
  updateProfile: (updates: Partial<UserProfile>) => void
  clearProfile: () => void
  markLoaded: (userId: string | null) => void
}

export const useUserStore = create<UserStore>()(
  persist(
    (set) => ({
      profile: null,
      loadedForUserId: null,

      setProfile: (profile) => set({ profile }),

      updateProfile: (updates) =>
        set((state) => ({
          profile: state.profile
            ? { ...state.profile, ...updates, updatedAt: new Date().toISOString() }
            : null,
        })),

      clearProfile: () => set({ profile: null, loadedForUserId: null }),

      markLoaded: (userId) => set({ loadedForUserId: userId }),
    }),
    { name: 'kloset-user', partialize: (s) => ({ profile: s.profile }) }
  )
)
