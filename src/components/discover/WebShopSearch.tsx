import { useState } from 'react'
import { Search, ExternalLink, Globe2, KeyRound } from 'lucide-react'
import { clsx } from 'clsx'
import { searchWebShop, type Retailer } from '@/lib/webShopService'
import type { WebShopResult } from '@/types'

const RETAILER_FILTERS: { value: Retailer | 'all'; label: string }[] = [
  { value: 'all', label: 'All brands' },
  { value: 'zara', label: 'Zara' },
  { value: 'hm', label: 'H&M' },
  { value: 'cos', label: 'COS' },
  { value: 'uniqlo', label: 'Uniqlo' },
  { value: 'mango', label: 'Mango' },
  { value: 'stories', label: '& Other Stories' },
  { value: 'everlane', label: 'Everlane' },
]

const SUGGESTIONS = ['pink top', 'black blazer', 'denim jacket', 'linen trousers']

export function WebShopSearch() {
  const [query, setQuery] = useState('')
  const [activeRetailer, setActiveRetailer] = useState<Retailer | 'all'>('all')
  const [results, setResults] = useState<WebShopResult[]>([])
  const [status, setStatus] = useState<'idle' | 'loading' | 'done' | 'no-key' | 'error'>('idle')
  const [errorMessage, setErrorMessage] = useState('')

  const runSearch = async (q: string, retailer: Retailer | 'all') => {
    const trimmed = q.trim()
    if (!trimmed) return

    setQuery(trimmed)
    setStatus('loading')
    setErrorMessage('')

    const retailers: Retailer[] | undefined = retailer === 'all' ? undefined : [retailer]
    const { results: found, noKey, error } = await searchWebShop(trimmed, retailers)

    if (noKey) {
      setStatus('no-key')
      return
    }
    if (error) {
      setErrorMessage(error)
      setStatus('error')
      return
    }
    setResults(found)
    setStatus('done')
  }

  const handleRetailerChange = (retailer: Retailer | 'all') => {
    setActiveRetailer(retailer)
    if (query) runSearch(query, retailer)
  }

  return (
    <div className="mb-10">
      <div className="flex items-center gap-3 mb-3">
        <div className="w-10 h-10 rounded-2xl bg-dark-purple flex items-center justify-center flex-shrink-0">
          <Globe2 size={18} className="text-butter-yellow" />
        </div>
        <div>
          <p className="text-butter-yellow text-xs font-medium uppercase tracking-ultra-wide">
            Shop the web
          </p>
          <h2 className="font-display text-xl font-medium text-text-primary">
            Real links from brands that fit your style
          </h2>
        </div>
      </div>

      <form
        onSubmit={(e) => {
          e.preventDefault()
          runSearch(query, activeRetailer)
        }}
        className="flex gap-2 mb-3"
      >
        <div className="relative flex-1">
          <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-text-muted" />
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Say what you want — e.g. &ldquo;pink top&rdquo;"
            className="w-full pl-10 pr-4 py-2.5 rounded-full text-sm bg-white border border-text-primary/15 focus:outline-none focus:border-dark-purple placeholder:text-text-muted"
          />
        </div>
        <button
          type="submit"
          className="px-5 py-2.5 rounded-full text-sm font-medium bg-dark-purple text-butter-yellow hover:bg-deep-purple transition-colors disabled:opacity-50"
          disabled={!query.trim() || status === 'loading'}
        >
          Search
        </button>
      </form>

      <div className="mb-4 overflow-x-auto scrollbar-hide">
        <div className="flex gap-2 pb-1 min-w-max">
          {RETAILER_FILTERS.map((f) => (
            <button
              key={f.value}
              onClick={() => handleRetailerChange(f.value)}
              className={clsx(
                'px-3.5 py-1.5 rounded-full text-xs font-medium border transition-all duration-200 whitespace-nowrap',
                activeRetailer === f.value
                  ? 'bg-text-primary/10 text-butter-yellow border-text-primary/30'
                  : 'bg-transparent text-text-muted border-text-primary/10 hover:border-text-primary/25 hover:text-text-primary'
              )}
            >
              {f.label}
            </button>
          ))}
        </div>
      </div>

      <div className="mb-4">
        {status === 'idle' && (
          <div className="flex flex-wrap gap-1.5">
            {SUGGESTIONS.map((s) => (
              <button
                key={s}
                onClick={() => runSearch(s, activeRetailer)}
                className="text-2xs px-2.5 py-1 rounded-full bg-text-primary/5 text-text-muted hover:bg-text-primary/10 hover:text-text-primary transition-colors"
              >
                {s}
              </button>
            ))}
          </div>
        )}
      </div>

      {status === 'loading' && (
        <div className="py-10 flex justify-center">
          <div className="w-6 h-6 border-2 border-text-primary/15 border-t-dark-purple rounded-full animate-spin" />
        </div>
      )}

      {status === 'no-key' && (
        <div className="py-8 flex flex-col items-center text-center rounded-3xl bg-text-primary/5 px-6">
          <KeyRound size={20} className="text-text-primary/40 mb-2" />
          <p className="text-sm text-text-primary font-medium">Live search isn&rsquo;t connected yet</p>
          <p className="text-xs text-text-muted mt-1 max-w-xs">
            Add an <code className="px-1 py-0.5 rounded bg-text-primary/10">EXA_API_KEY</code> to your{' '}
            <code className="px-1 py-0.5 rounded bg-text-primary/10">.env</code> to pull real Zara &amp; H&amp;M results.
          </p>
        </div>
      )}

      {status === 'error' && (
        <div className="py-8 text-center">
          <p className="text-sm text-text-primary">{errorMessage}</p>
        </div>
      )}

      {status === 'done' && results.length === 0 && (
        <div className="py-8 text-center">
          <p className="text-sm text-text-muted">No matches for &ldquo;{query}&rdquo; — try a different search.</p>
        </div>
      )}

      {status === 'done' && results.length > 0 && (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 sm:gap-4">
          {results.map((r) => (
            <a
              key={r.id}
              href={r.url}
              target="_blank"
              rel="noreferrer"
              className="group rounded-3xl overflow-hidden bg-white shadow-card transition-all duration-300 hover:-translate-y-1 hover:shadow-medium flex flex-col"
            >
              <div className="aspect-[3/4] relative overflow-hidden flex-shrink-0 bg-text-primary/5">
                {r.imageUrl ? (
                  <img
                    src={r.imageUrl}
                    alt={r.title}
                    loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center">
                    <span className="text-xs font-medium text-text-muted">{r.retailer}</span>
                  </div>
                )}
                <div className="absolute top-3 left-3">
                  <span className="text-2xs font-medium uppercase tracking-widest px-2 py-0.5 rounded-full bg-white/90 backdrop-blur-sm text-text-muted">
                    {r.retailer}
                  </span>
                </div>
              </div>
              <div className="p-3 pb-4 flex flex-col gap-1 flex-1">
                <p className="text-sm font-medium text-text-primary leading-snug line-clamp-2">{r.title}</p>
                {r.snippet && (
                  <p className="text-2xs text-text-muted leading-snug line-clamp-2">{r.snippet}</p>
                )}
                <div className="mt-auto pt-2 flex items-center gap-1 text-2xs font-medium text-dark-purple">
                  <ExternalLink size={11} />
                  Shop at {r.retailer}
                </div>
              </div>
            </a>
          ))}
        </div>
      )}
    </div>
  )
}
