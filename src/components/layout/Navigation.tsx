import { useState, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router-dom'
import { clsx } from 'clsx'
import {
  Home,
  Shirt,
  Sparkles,
  BookMarked,
  User,
  Menu,
  X,
} from 'lucide-react'
import { useUserStore } from '@/store/userStore'

interface NavItem {
  label: string
  to: string
  icon: React.ReactNode
  requiresOnboarding?: boolean
}

const navItems: NavItem[] = [
  { label: 'Home', to: '/', icon: <Home size={18} /> },
  { label: 'My Kloset', to: '/wardrobe', icon: <Shirt size={18} />, requiresOnboarding: true },
  { label: 'AI Stylist', to: '/stylist', icon: <Sparkles size={18} />, requiresOnboarding: true },
  { label: 'Saved', to: '/saved', icon: <BookMarked size={18} />, requiresOnboarding: true },
  { label: 'Profile', to: '/profile', icon: <User size={18} />, requiresOnboarding: true },
]

export function Navigation() {
  const [scrolled, setScrolled] = useState(false)
  const [mobileOpen, setMobileOpen] = useState(false)
  const location = useLocation()
  const profile = useUserStore((s) => s.profile)
  const isOnboarding = location.pathname.startsWith('/onboarding')

  useEffect(() => {
    const handler = () => setScrolled(window.scrollY > 20)
    window.addEventListener('scroll', handler, { passive: true })
    return () => window.removeEventListener('scroll', handler)
  }, [])

  useEffect(() => {
    setMobileOpen(false)
  }, [location.pathname])

  if (isOnboarding) return null

  const isLanding = location.pathname === '/'

  return (
    <>
      <header
        className={clsx(
          'fixed top-0 left-0 right-0 z-50 transition-all duration-300',
          scrolled || !isLanding
            ? 'bg-cream-50/95 backdrop-blur-md border-b border-cream-200'
            : 'bg-transparent'
        )}
      >
        <nav className="mx-auto max-w-7xl px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <NavLink
              to="/"
              className="flex items-center gap-2 group"
              aria-label="Kloset.ai home"
            >
              <LogoMark scrolled={scrolled} isLanding={isLanding} />
              <span
                className={clsx(
                  'font-serif text-xl font-medium tracking-tight transition-colors duration-300',
                  scrolled || !isLanding ? 'text-charcoal-900' : 'text-white'
                )}
              >
                Kloset
                <span className="text-gold">.</span>
                ai
              </span>
            </NavLink>

            {/* Desktop nav */}
            <div className="hidden md:flex items-center gap-1">
              {navItems.map((item) => {
                if (item.requiresOnboarding && !profile?.onboardingComplete) return null
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium',
                        'transition-all duration-200',
                        isActive
                          ? scrolled || !isLanding
                            ? 'bg-charcoal-900 text-cream-50'
                            : 'bg-white/20 text-white backdrop-blur-sm'
                          : scrolled || !isLanding
                          ? 'text-charcoal-600 hover:text-charcoal-900 hover:bg-cream-100'
                          : 'text-white/80 hover:text-white hover:bg-white/10'
                      )
                    }
                  >
                    {item.label}
                  </NavLink>
                )
              })}
              {!profile?.onboardingComplete && (
                <NavLink
                  to="/onboarding"
                  className={clsx(
                    'ml-2 px-5 py-2 rounded-full text-sm font-medium uppercase tracking-widest',
                    'transition-all duration-200',
                    scrolled || !isLanding
                      ? 'bg-charcoal-900 text-cream-50 hover:bg-charcoal-700'
                      : 'bg-white text-charcoal-900 hover:bg-cream-100'
                  )}
                >
                  Get Started
                </NavLink>
              )}
            </div>

            {/* Mobile menu button */}
            <button
              onClick={() => setMobileOpen((v) => !v)}
              className={clsx(
                'md:hidden p-2 rounded-full transition-colors',
                scrolled || !isLanding
                  ? 'text-charcoal-700 hover:bg-cream-100'
                  : 'text-white hover:bg-white/10'
              )}
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
          <div
            className="absolute inset-0 bg-charcoal-900/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <div className="absolute top-16 left-0 right-0 bg-cream-50 border-b border-cream-200 shadow-lifted animate-fade-up">
            <div className="px-6 py-6 flex flex-col gap-2">
              {navItems.map((item) => {
                if (item.requiresOnboarding && !profile?.onboardingComplete) return null
                return (
                  <NavLink
                    key={item.to}
                    to={item.to}
                    end={item.to === '/'}
                    className={({ isActive }) =>
                      clsx(
                        'flex items-center gap-3 px-4 py-3 rounded-2xl text-sm font-medium',
                        'transition-colors duration-150',
                        isActive
                          ? 'bg-charcoal-900 text-cream-50'
                          : 'text-charcoal-700 hover:bg-cream-100'
                      )
                    }
                  >
                    {item.icon}
                    {item.label}
                  </NavLink>
                )
              })}
              {!profile?.onboardingComplete && (
                <NavLink
                  to="/onboarding"
                  className="mt-2 flex items-center justify-center px-4 py-3 rounded-2xl bg-charcoal-900 text-cream-50 text-sm font-medium uppercase tracking-widest"
                >
                  Get Started
                </NavLink>
              )}
            </div>
          </div>
        </div>
      )}

      {/* Bottom mobile nav (for logged-in users) */}
      {profile?.onboardingComplete && (
        <nav className="md:hidden fixed bottom-0 left-0 right-0 z-40 bg-cream-50/95 backdrop-blur-md border-t border-cream-200">
          <div className="flex items-center justify-around px-2 py-2">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.to === '/'}
                className={({ isActive }) =>
                  clsx(
                    'flex flex-col items-center gap-1 px-3 py-2 rounded-2xl text-2xs font-medium',
                    'transition-colors duration-150',
                    isActive
                      ? 'text-charcoal-900 bg-cream-200'
                      : 'text-charcoal-400 hover:text-charcoal-700'
                  )
                }
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

function LogoMark({
  scrolled,
  isLanding,
}: {
  scrolled: boolean
  isLanding: boolean
}) {
  const dark = scrolled || !isLanding
  return (
    <svg width="28" height="28" viewBox="0 0 28 28" fill="none" aria-hidden="true">
      <rect
        width="28"
        height="28"
        rx="8"
        fill={dark ? '#111110' : 'white'}
      />
      <path
        d="M8 10h12M8 14h8M8 18h10"
        stroke={dark ? '#FAFAF8' : '#111110'}
        strokeWidth="1.8"
        strokeLinecap="round"
      />
    </svg>
  )
}
