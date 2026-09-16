import { useEffect } from 'react'
import { BrowserRouter, Routes, Route, useLocation } from 'react-router-dom'
import { Navigation } from '@/components/layout/Navigation'
import { LandingPage } from '@/pages/LandingPage'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { WardrobePage } from '@/pages/WardrobePage'
import { StylistPage } from '@/pages/StylistPage'
import { SavedOutfitsPage } from '@/pages/SavedOutfitsPage'
import { ProfilePage } from '@/pages/ProfilePage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

export function App() {
  return (
    <BrowserRouter>
      <ScrollToTop />
      <Navigation />
      <Routes>
        <Route path="/" element={<LandingPage />} />
        <Route path="/onboarding" element={<OnboardingPage />} />
        <Route path="/wardrobe" element={<WardrobePage />} />
        <Route path="/stylist" element={<StylistPage />} />
        <Route path="/saved" element={<SavedOutfitsPage />} />
        <Route path="/profile" element={<ProfilePage />} />
      </Routes>
    </BrowserRouter>
  )
}
