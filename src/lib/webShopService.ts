import type { WebShopResult } from '@/types'

export type Retailer = 'zara' | 'hm' | 'cos' | 'uniqlo' | 'mango' | 'stories' | 'everlane'

interface WebShopSearchResponse {
  results: WebShopResult[]
  noKey?: boolean
  error?: string
}

/** Live web search for real product pages on Zara/H&M/etc, via the Exa-backed API route. */
export async function searchWebShop(
  query: string,
  retailers?: Retailer[]
): Promise<WebShopSearchResponse> {
  console.log('[webShopService] searching', { query, retailers })

  const response = await fetch('/api/web-shop-search', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ query, retailers }),
  })

  if (!response.ok) {
    const data = await response.json().catch(() => ({}))
    console.error('[webShopService] request failed', response.status, data.error)
    return { results: [], error: data.error ?? 'Live shopping search failed.' }
  }

  const data = await response.json()
  console.log('[webShopService] got', data.results?.length ?? 0, 'results', data.noKey ? '(no key)' : '')
  return data
}
