import { isProductPage } from '../server/productPages.mjs'

const RETAILER_DOMAINS = {
  zara: 'zara.com',
  hm: 'hm.com',
  cos: 'cos.com',
  uniqlo: 'uniqlo.com',
  mango: 'mango.com',
  stories: 'stories.com',
  everlane: 'everlane.com',
}
const RETAILER_NAMES = {
  'zara.com': 'Zara',
  'hm.com': 'H&M',
  'cos.com': 'COS',
  'uniqlo.com': 'Uniqlo',
  'mango.com': 'Mango',
  'stories.com': '& Other Stories',
  'everlane.com': 'Everlane',
}

// Serverless functions are stateless between invocations, so this cache only
// helps within a warm instance — a best-effort cost reducer, not a guarantee.
const webShopCache = new Map()
const WEB_SHOP_CACHE_TTL_MS = 10 * 60 * 1000

function domainOf(url) {
  try {
    // Strips www., www2., etc — H&M's site serves from www2.hm.com.
    return new URL(url).hostname.replace(/^www\d*\./, '')
  } catch {
    return ''
  }
}

// Suffix match, not exact — retailers serve from regional subdomains Exa
// crawls independently (ae.hm.com, en_ca.hm.com, etc), all still "H&M".
function retailerNameFor(domain) {
  for (const [known, name] of Object.entries(RETAILER_NAMES)) {
    if (domain === known || domain.endsWith(`.${known}`)) return name
  }
  return domain
}

// Exa's /search API has no region/language filter, so a domain-only match
// can surface a non-US, non-English storefront page (e.g. zara.com/es/...,
// or ae.hm.com where the region lives in the subdomain, not the path) above
// a US one. This doesn't remove anything — a niche query might only exist on
// a regional page — it just sorts likely-US/English pages first. Retailers
// don't agree on a country-code standard (Zara uses "uk", ISO uses "gb"), so
// both are covered; checked against path AND hostname to catch either style.
const NON_US_LOCALE_RE = /(?:^|[./_-])(en[-_](gb|uk|ca|au|ie|in|sg|hk|nz|ww|eu)|es|fr|de|it|nl|pt|se|dk|no|fi|pl|ru|ja|jp|ko|kr|zh|cn|tw|ar|ae|sa|mx|br|tr|gb|uk|ca|au|eu)(?:[-_./]|$)/i

function isLikelyNonUS(url) {
  try {
    const u = new URL(url)
    return NON_US_LOCALE_RE.test(u.pathname) || NON_US_LOCALE_RE.test(u.hostname.replace(/^www\d*\./, ''))
  } catch {
    return false
  }
}

export default async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' })
  }

  const { query, retailers } = req.body ?? {}

  if (!query || typeof query !== 'string' || !query.trim()) {
    return res.status(400).json({ error: 'query is required' })
  }

  const includeDomains = (Array.isArray(retailers) && retailers.length
    ? retailers.filter((r) => RETAILER_DOMAINS[r]).map((r) => RETAILER_DOMAINS[r])
    : Object.values(RETAILER_DOMAINS))

  const apiKey = process.env.EXA_API_KEY
  if (!apiKey) {
    console.log('[web-shop-search] no EXA_API_KEY set — returning empty results')
    return res.json({ results: [], noKey: true })
  }

  const trimmedQuery = query.trim().slice(0, 200)
  const cacheKey = `${trimmedQuery.toLowerCase()}|${includeDomains.slice().sort().join(',')}`
  const cached = webShopCache.get(cacheKey)
  if (cached && cached.expiresAt > Date.now()) {
    console.log(`[web-shop-search] cache hit for "${trimmedQuery}"`)
    return res.json({ results: cached.results })
  }

  try {
    const response = await fetch('https://api.exa.ai/search', {
      method: 'POST',
      headers: {
        'x-api-key': apiKey,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        query: trimmedQuery,
        type: 'auto',
        // Over-fetch: listing pages get filtered out below, and the rest
        // still needs to fill a row of product cards.
        numResults: 30,
        includeDomains,
        contents: {
          text: { maxCharacters: 280 },
          highlights: true,
        },
      }),
    })

    if (!response.ok) {
      const err = await response.text()
      throw new Error(`Exa ${response.status}: ${err}`)
    }

    const data = await response.json()
    const raw = data.results ?? []
    // Stable sort, US pages first *before* capping — keeps Exa's relevance
    // order within each group, and regional duplicates can't crowd US
    // products out of the 12 we keep.
    const productHits = raw
      .filter((r) => isProductPage(r.url))
      .sort((a, b) => Number(isLikelyNonUS(a.url)) - Number(isLikelyNonUS(b.url)))
    const results = productHits.slice(0, 12).map((r) => {
      const domain = domainOf(r.url)
      return {
        id: r.id ?? r.url,
        title: r.title ?? 'View item',
        url: r.url,
        domain,
        retailer: retailerNameFor(domain),
        snippet: (r.highlights?.[0] ?? r.text ?? '').trim().slice(0, 200),
        imageUrl: r.image ?? null,
      }
    })

    webShopCache.set(cacheKey, { results, expiresAt: Date.now() + WEB_SHOP_CACHE_TTL_MS })
    const nonUSCount = results.filter((r) => isLikelyNonUS(r.url)).length
    console.log(`[web-shop-search] "${trimmedQuery}" (${includeDomains.join(',')}) → ${results.length} product pages (${raw.length - productHits.length} listing pages dropped, ${nonUSCount} non-US deprioritized)`)
    return res.json({ results })
  } catch (e) {
    console.error('[web-shop-search] Exa error:', e?.message ?? e)
    return res.status(500).json({ error: 'Live shopping search failed. Try again in a moment.' })
  }
}
