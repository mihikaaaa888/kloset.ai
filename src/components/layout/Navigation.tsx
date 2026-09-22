import { useState, useEffect } from 'react'
import { NavLink, useLocation, useNavigate } from 'react-router-dom'
import { clsx } from 'clsx'
import { Home, Shirt, Sparkles, BookMarked, User, Menu, X, LogOut, Compass } from 'lucide-react'
import { useUserStore } from '@/store/userStore'
import { useAuth } from '@/contexts/AuthContext'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  requiresAuth?: boolean
}

const publicNavItems: NavItem[] = [
  { label: 'Home', to: '/', icon: <Home size={18} /> },
]

const authNavItems: NavItem[] = [
  { label: 'Home', to: '/home', icon: <Home size={18} />, requiresAuth: true },
  { label: 'My Kloset', to: '/wardrobe', icon: <Shirt size={18} />, requiresAuth: true },
  { label: 'Discover', to: '/discover', icon: <Compass size={18} />, requiresAuth: true },
  { label: 'AI Stylist', to: '/stylist', icon: <Sparkles size={18} />, requiresAuth: true },
  { label: 'Saved', to: '/saved', icon: <BookMarked size={18} />, requiresAuth: true },
  { label: 'Profile', to: '/profile', icon: <User size={18} />, requiresAuth: true },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const navigate = useNavigate()
  const profile = useUserStore((s) => s.profile)
  const { user, signOut } = useAuth()

  const isOnboarding = location.pathname.startsWith('/onboarding')
  const isAuthPage = ['/login', '/signup', '/forgot-password', '/reset-password'].includes(location.pathname)
  const isLanding = location.pathname === '/'

  useEffect(() => {
    // On the landing page, the cinematic hero is pinned for several viewport
    // heights — wait until it's been scrolled past (rather than 20px) before
    // the nav turns solid, so it doesn't cut over the closet scene mid-scroll.
    const handler = () => {
      const cinematicHero = document.getElementById('cinematic-hero')
      const threshold = cinematicHero ? cinematicHero.offsetHeight - window.innerHeight - 40 : 20
      setScrolled(window.scrollY > Math.max(20, threshold))
    }
    handler()
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [location.pathname])

  useEffect(() => { setMobileOpen(false) }, [location.pathname])

  const handleSignOut = async () => {
    await signOut()
    navigate('/')
  }

  if (isOnboarding || isAuthPage) return null

  const solidNav = scrolled || !isLanding

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          solidNav
            ? 'bg-warm-cream/95 backdrop-blur-md border-b border-text-primary/10'
            : 'bg-transparent'
        )}
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">

            {/* Logo */}
            <NavLink to="/" className="flex items-center gap-2" aria-label="Kloset.ai home">
              <span className={clsx(
                'font-serif text-xl font-medium tracking-tight transition-colors duration-300',
                'text-text-primary'
              )}>
                <span className="font-brand font-bold">Kloset</span><span className="text-butter-yellow">.</span>ai
              </span>
            </NavLink>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {(user && profile?.onboardingComplete ? authNavItems : publicNavItems).map((item) => {
                if (item.requiresAuth && !user) return null
                if (item.requiresAuth && !profile?.onboardingComplete) return null
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/' || item.to === '/home'}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200',
                      isActive
                        ? 'bg-dark-purple text-butter-yellow'
                        : 'text-text-muted hover:text-text-primary hover:bg-text-primary/5'
                    )}
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
                  className="ml-2 flex items-center gap-1.5 px-4 py-2 rounded-full text-sm font-medium transition-all duration-200 text-text-muted hover:text-text-primary hover:bg-text-primary/5"
                >
                  <LogOut size={15} />
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
            <div className="px-6 py-6 flex flex-col gap-2">
              {(user && profile?.onboardingComplete ? authNavItems : publicNavItems).map((item) => {
                if (item.requiresAuth && !user) return null
                if (item.requiresAuth && !profile?.onboardingComplete) return null
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/' || item.to === '/home'}
                    className={({ isActive }) => clsx(
                      'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium transition-colors duration-150',
                      isActive ? 'bg-dark-purple text-butter-yellow' : 'text-text-primary hover:bg-text-primary/5'
                    )}
                  >
                    {item.icon}
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
                  className="mt-2 flex items-center justify-center gap-2 px-4 py-3 rounded-2xl text-text-muted hover:bg-text-primary/5 text-sm font-medium w-full"
                >
                  <LogOut size={16} />
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
                  'flex flex-col items-center gap-1 px-3 py-2 rounded-2xl text-2xs font-medium transition-colors duration-150',
                  isActive ? 'text-butter-yellow bg-butter-yellow/10' : 'text-text-muted hover:text-text-primary'
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
