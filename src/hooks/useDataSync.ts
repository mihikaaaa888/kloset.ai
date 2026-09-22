import { useEffect, useRef } from 'react'
import { useAuth } from '@/contexts/AuthContext'
import { useUserStore } from '@/store/userStore'
import { useWardrobeStore } from '@/store/wardrobeStore'
import { fetchProfile } from '@/lib/profileService'
import { fetchWardrobe } from '@/lib/wardrobeService'

// Loads the authenticated user's profile and wardrobe from Supabase into local stores.
// Runs once per login. Clears local stores on logout.
export function useDataSync() {
  const { user } = useAuth()
  const setProfile = useUserStore((s) => s.setProfile)
  const clearProfile = useUserStore((s) => s.clearProfile)
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

    async function sync() {
      const [profile, items] = await Promise.all([
        fetchProfile(user!.id),
        fetchWardrobe(user!.id),
      ])
      if (profile) setProfile(profile)
      setItems(items)
    }

    sync()
  }, [user, setProfile, clearProfile, setItems])
}
