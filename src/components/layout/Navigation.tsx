import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { Home, Shirt, BookMarked, User, Menu, X, Compass } from 'lucide-react'
import { HangerIcon } from '@/components/ui/HangerIcon'
import { useUserStore } from '@/store/userStore'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  requiresAuth?: boolean
}

export const publicNavItems: NavItem[] = [
  { label: 'Home', to: '/', icon: <Home size={18} /> },
]

export const authNavItems: NavItem[] = [
  { label: 'Home', to: '/home', icon: <Home size={18} />, requiresAuth: true },
  { label: 'My Kloset', to: '/wardrobe', icon: <Shirt size={18} />, requiresAuth: true },
  { label: 'Shop', to: '/discover', icon: <Compass size={18} />, requiresAuth: true },
  { label: 'AI Stylist', to: '/stylist', icon: <HangerIcon size={18} />, requiresAuth: true },
  { label: 'Saved', to: '/saved', icon: <BookMarked size={18} />, requiresAuth: true },
  { label: 'Profile', to: '/profile', icon: <User size={18} />, requiresAuth: true },
]

export function Navigation() {
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const profile = useUserStore((s) => s.profile)
  const { user, signOut } = useAuth()

  const isOnboarding = location.pathname.startsWith('/onboarding')
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)
  const isLanding = location.pathname === '/'

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  // The landing page has no top nav — its links live in the footer instead.
  if (isOnboarding || isAuthPage || isLanding) return null

  return (
    <>
      <header
        className="fixed top-0 left-0 right-0 z-50 bg-warm-cream/95 backdrop-blur-md border-b border-text-primary/10"
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2" aria-label="Kloset.ai home">
              <span className={clsx(
                'font-brand text-xl tracking-tight transition-colors duration-300',
                'text-text-primary'
              )}>
                Kloset<span className="text-butter-yellow">.</span>ai
              </span>
            </NavLink>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-7 lg:gap-9">
              {(user && profile?.onboardingComplete ? authNavItems : publicNavItems).map((item) => {
                if (item.requiresAuth && !user) return null
                if (item.requiresAuth && !profile?.onboardingComplete) return null
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/' || item.to === '/home'}
                    className={({ isActive }) => clsx('text-tab', isActive && 'text-tab-active')}
                  >
                    {item.label}
                  </NavLink>
                )
              })}

              {!user && (
                <NavLink
                  to="/signup"
                  className="ml-2 px-5 py-2 rounded-full text-sm font-medium uppercase tracking-widest transition-all duration-200 bg-dark-purple text-butter-yellow hover:bg-deep-purple"
                >
                  Get Started
                </NavLink>
              )}

              {user && (
                <button
                  onClick={handleSignOut}
                  className="text-tab ml-4"
                >
                  Sign out
                </button>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className="md:hidden p-2 rounded-full transition-colors text-text-primary hover:bg-text-primary/5"
              aria-label="Toggle menu"
            >
              {mobileOpen ? <X size={22} /> : <Menu size={22} />}
            </button>
          </div>
        </nav>
      </header>

      {/* Mobile menu overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 md:hidden">
          <div className="absolute inset-0 bg-text-primary/40 backdrop-blur-sm" onClick={() => setMobileOpen(false)} />
          <div className="absolute top-16 left-0 right-0 bg-warm-cream border-b border-text-primary/10 shadow-lifted animate-fade-up">
            <div className="px-6 py-6 flex flex-col">
              {(user && profile?.onboardingComplete ? authNavItems : publicNavItems).map((item) => {
                if (item.requiresAuth && !user) return null
                if (item.requiresAuth && !profile?.onboardingComplete) return null
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/' || item.to === '/home'}
                    className={({ isActive }) => clsx(
                      'block py-2.5 text-base uppercase tracking-wider transition-colors',
                      isActive ? 'text-butter-yellow font-semibold' : 'text-text-primary hover:text-butter-yellow'
                    )}
                  >
                    {item.label}
                  </NavLink>
                )
              })}

              {!user && (
                <NavLink
                  to="/signup"
                  className="mt-2 flex items-center justify-center px-4 py-3 rounded-2xl bg-dark-purple text-butter-yellow text-sm font-medium uppercase tracking-widest"
                >
                  Get Started
                </NavLink>
              )}

              {user && (
                <button
                  onClick={handleSignOut}
                  className="mt-4 pt-4 border-t border-text-primary/10 text-left py-2.5 text-sm uppercase tracking-wider text-text-muted hover:text-text-primary"
                >
                  Sign out
                </button>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom mobile nav */}
      {user && profile?.onboardingComplete && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-warm-cream/95 backdrop-blur-md border-t border-text-primary/10">
          <div className="flex items-center justify-around px-2 py-2">
            {authNavItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/home'}
                className={({ isActive }) => clsx(
                  'flex flex-col items-center gap-1 px-2 py-2 text-2xs uppercase tracking-wider transition-colors duration-150',
                  isActive ? 'text-butter-yellow font-semibold' : 'text-text-muted hover:text-text-primary'
                )}
              >
                {item.icon}
                <span>{item.label}</span>
              </NavLink>
            ))}
          </div>
        </nav>
      )}
    </>
  )
}
