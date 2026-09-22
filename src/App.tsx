import { useEffect, type ReactNode } from 'react'
import { BrowserRouter, Routes, Route, useLocation, Navigate } from 'react-router-dom'
import { Navigation } from '@/components/layout/Navigation'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { useDataSync } from '@/hooks/useDataSync'
import { LandingPage } from '@/pages/LandingPage'
import { OnboardingPage } from '@/pages/onboarding/OnboardingPage'
import { WardrobePage } from '@/pages/WardrobePage'
import { StylistPage } from '@/pages/StylistPage'
import { SavedOutfitsPage } from '@/pages/SavedOutfitsPage'
import { ProfilePage } from '@/pages/ProfilePage'
import { DiscoverPage } from '@/pages/DiscoverPage'
import { HomePage } from '@/pages/HomePage'
import { LoginPage } from '@/pages/auth/LoginPage'
import { SignupPage } from '@/pages/auth/SignupPage'
import { ForgotPasswordPage } from '@/pages/auth/ForgotPasswordPage'

function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'instant' as ScrollBehavior })
  }, [pathname])
  return null
}

// Redirects unauthenticated users to /login, preserving the intended destination.
function RequireAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()
  const location = useLocation()

  if (loading) {
    return (
      <div className="min-h-screen bg-dark-purple flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-butter-yellow/30 border-t-butter-yellow animate-spin" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" state={{ from: location.pathname }} replace />
  }

  return <>{children}</>
}

// Redirects already-authenticated users away from auth pages.
function RedirectIfAuth({ children }: { children: ReactNode }) {
  const { user, loading } = useAuth()

  if (loading) return null
  if (user) return <Navigate to="/home" replace />
  return <>{children}</>
}

function AppRoutes() {
  useDataSync()

  return (
    <>
      <ScrollToTop />
      <Navigation />
      <Routes>
        {/* Public */}
        <Route path="/" element={<LandingPage />} />
        <Route path="/login" element={<RedirectIfAuth><LoginPage /></RedirectIfAuth>} />
        <Route path="/signup" element={<RedirectIfAuth><SignupPage /></RedirectIfAuth>} />
        <Route path="/forgot-password" element={<RedirectIfAuth><ForgotPasswordPage /></RedirectIfAuth>} />

        {/* Protected */}
        <Route path="/home" element={<RequireAuth><HomePage /></RequireAuth>} />
        <Route path="/onboarding" element={<RequireAuth><OnboardingPage /></RequireAuth>} />
        <Route path="/wardrobe" element={<RequireAuth><WardrobePage /></RequireAuth>} />
        <Route path="/stylist" element={<RequireAuth><StylistPage /></RequireAuth>} />
        <Route path="/discover" element={<RequireAuth><DiscoverPage /></RequireAuth>} />
        <Route path="/saved" element={<RequireAuth><SavedOutfitsPage /></RequireAuth>} />
        <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
      </Routes>
    </>
  )
}

export function App() {
  return (
    <BrowserRouter>
      <AuthProvider>
        <AppRoutes />
      </AuthProvider>
    </BrowserRouter>
  )
}
