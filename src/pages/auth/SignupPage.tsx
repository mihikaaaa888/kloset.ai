import { useState, type FormEvent } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { Eye, EyeOff, ArrowRight } from 'lucide-react'
import { supabase } from '@/lib/supabase'
import { Button } from '@/components/ui/Button'

export function SignupPage() {
  const navigate = useNavigate()

  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [showPassword, setShowPassword] = useState(false)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    setError(null)

    if (password !== confirmPassword) {
      setError('Passwords do not match.')
      return
    }
    if (password.length < 8) {
      setError('Password must be at least 8 characters.')
      return
    }

    setLoading(true)

    const { error } = await supabase.auth.signUp({
      email,
      password,
      options: {
        emailRedirectTo: `${window.location.origin}/wardrobe`,
      },
    })

    if (error) {
      setError(error.message)
      setLoading(false)
      return
    }

    setSuccess(true)
    setLoading(false)
  }

  if (success) {
    return (
      <div className="min-h-screen bg-warm-cream flex items-center justify-center px-4">
        <div className="w-full max-w-sm text-center">
          <div className="w-16 h-16 rounded-full bg-butter-yellow/10 border border-butter-yellow/20 flex items-center justify-center mx-auto mb-6">
            <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="text-butter-yellow">
              <polyline points="20 6 9 17 4 12" />
            </svg>
          </div>
          <h2 className="font-display text-2xl font-medium text-text-primary mb-2">Check your email</h2>
          <p className="text-text-muted text-sm leading-relaxed mb-8">
            We sent a confirmation link to <strong className="text-text-primary">{email}</strong>. Click it to activate your account.
          </p>
          <button
            onClick={() => navigate('/login')}
            className="text-sm text-text-muted hover:text-text-primary transition-colors underline underline-offset-4"
          >
            Back to sign in
          </button>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-warm-cream flex items-center justify-center px-4">
      <div className="w-full max-w-sm">
        {/* Logo */}
        <div className="text-center mb-10">
          <Link to="/" className="inline-flex items-center gap-2 mb-8">
            <span className="font-serif text-2xl font-medium text-butter-yellow">
              <span className="font-brand font-bold">Kloset</span><span className="text-butter-yellow/50">.</span>ai
            </span>
          </Link>
          <h1 className="font-display text-3xl font-medium text-text-primary mb-1">Create your Kloset</h1>
          <p className="text-text-muted text-sm">Your wardrobe, organised and styled</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          {error && (
            <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-red-600 text-sm">
              {error}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-xs font-medium text-text-muted uppercase tracking-widest mb-2">
              Email
            </label>
            <input
              id="email"
              type="email"
              autoComplete="email"
              required
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="you@example.com"
              className="w-full px-4 py-3 rounded-xl bg-white border border-text-primary/10 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-butter-yellow/50 focus:ring-1 focus:ring-butter-yellow/30 transition-all text-sm"
            />
          </div>

          <div>
            <label htmlFor="password" className="block text-xs font-medium text-text-muted uppercase tracking-widest mb-2">
              Password
            </label>
            <div className="relative">
              <input
                id="password"
                type={showPassword ? 'text' : 'password'}
                autoComplete="new-password"
                required
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Min. 8 characters"
                className="w-full px-4 py-3 pr-12 rounded-xl bg-white border border-text-primary/10 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-butter-yellow/50 focus:ring-1 focus:ring-butter-yellow/30 transition-all text-sm"
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                aria-label={showPassword ? 'Hide password' : 'Show password'}
              >
                {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div>
            <label htmlFor="confirm-password" className="block text-xs font-medium text-text-muted uppercase tracking-widest mb-2">
              Confirm Password
            </label>
            <input
              id="confirm-password"
              type={showPassword ? 'text' : 'password'}
              autoComplete="new-password"
              required
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              placeholder="Repeat your password"
              className="w-full px-4 py-3 rounded-xl bg-white border border-text-primary/10 text-text-primary placeholder:text-text-muted/50 focus:outline-none focus:border-butter-yellow/50 focus:ring-1 focus:ring-butter-yellow/30 transition-all text-sm"
            />
          </div>

          <Button
            type="submit"
            fullWidth
            size="lg"
            disabled={loading}
            className="mt-2 !bg-butter-yellow !text-dark-purple hover:!bg-soft-butter font-medium gap-2"
          >
            {loading ? 'Creating account…' : (
              <>Create account <ArrowRight size={16} /></>
            )}
          </Button>
        </form>

        <p className="text-center text-sm text-text-muted mt-8">
          Already have an account?{' '}
          <Link to="/login" className="text-butter-yellow hover:text-soft-butter transition-colors font-medium">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  )
}
