import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useUserStore } from '@/store/userStore'
import { useWardrobeStore } from '@/store/wardrobeStore'
import { fetchProfile, upsertProfile } from '@/lib/profileService'
import { fetchWardrobe, backfillPhotos } from '@/lib/wardrobeService'

// Loads the authenticated user's profile and wardrobe from Supabase into local stores.
// Runs once per login. Clears local stores on logout.
export function useDataSync() {
  const { user } = useAuth()
  const setProfile = useUserStore((s) => s.setProfile)
  const clearProfile = useUserStore((s) => s.clearProfile)
  const markLoaded = useUserStore((s) => s.markLoaded)
  const setItems = useWardrobeStore((s) => s.setItems)
  const prevUserIdRef = useRef<string | null>(null)

  useEffect(() => {
    if (!user) {
      if (prevUserIdRef.current) {
        clearProfile()
        setItems([])
        prevUserIdRef.current = null
      }
      return
    }

    if (user.id === prevUserIdRef.current) return
    prevUserIdRef.current = user.id

    // A profile cached in this browser from a different account must never show for this one.
    const cached = useUserStore.getState().profile
    if (cached && cached.id !== user.id) {
      console.log('[sync] clearing cached profile from another account')
      clearProfile()
    }

    async function sync() {
      const userId = user!.id
      const [remote, items] = await Promise.all([fetchProfile(userId), fetchWardrobe(userId)])
      const local = useUserStore.getState().profile

      if (remote?.onboardingComplete) {
        setProfile(remote)
      } else if (local?.id === userId && local.onboardingComplete) {
        // Onboarding finished here but never reached the server (older builds dropped failed saves).
        // Keep the local answers and push them up so other devices get them too.
        console.log('[sync] local profile is complete but server copy is not, re-uploading')
        await upsertProfile(userId, local)
      } else if (remote) {
        setProfile(remote)
      }

      setItems(items)
      markLoaded(userId)
      backfillPhotos(userId, items).catch((e) => console.error('[sync] photo backfill failed', e))
      console.log('[sync] profile ready', {
        onboardingComplete: !!useUserStore.getState().profile?.onboardingComplete,
      })
    }

    sync()
  }, [user, setProfile, clearProfile, markLoaded, setItems])
}
